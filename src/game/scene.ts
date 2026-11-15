import Phaser from "phaser";
import { supportGraph, unsupported } from "./support";
import { disasterPowers, type Activation } from "./powers";
import { Clock, damage, destruction, random, type PowerId } from "./domain";
import { structures, type City, type ChunkDef } from "./cities";
export interface Controls {
  paused: boolean;
  slow: boolean;
  night: boolean;
  strength: number;
  power: PowerId;
  motion: boolean;
  flash: boolean;
}
interface Chunk {
  def: ChunkDef;
  body: MatterJS.BodyType;
  hp: number;
  loose: boolean;
  removed: boolean;
  links: MatterJS.ConstraintType[];
}
type Effect = Activation;
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: number;
  r: number;
}
export class CityScene extends Phaser.Scene {
  city: City;
  controls: Controls;
  onStatus: (value: number) => void;
  onSound: (p: PowerId) => void;
  chunks: Chunk[] = [];
  effects: Effect[] = [];
  particles: Particle[] = Array.from({ length: 260 }, () => ({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    life: 0,
    max: 1,
    color: 0,
    r: 0,
  }));
  clock = new Clock();
  private accumulator = 0;
  private statusAt = 0;
  private lastActivation = -1000;
  private art!: Phaser.GameObjects.Graphics;
  private back!: Phaser.GameObjects.Graphics;
  private target = { x: 600, y: 420 };
  private initial = 0;
  private lastTheme?: boolean;
  private rocks: { body: MatterJS.BodyType; life: number }[] = [];
  private supports: number[][] = [];

  private rand = random(22);
  private ground = 515;
  constructor(
    city: City,
    controls: Controls,
    onStatus: (v: number) => void,
    onSound: (p: PowerId) => void,
  ) {
    super("City");
    this.city = city;
    this.controls = controls;
    this.onStatus = onStatus;
    this.onSound = onSound;
  }
  create() {
    this.matter.world.autoUpdate = false;
    this.matter.world.engine.enableSleeping = true;
    this.matter.world.setBounds(0, -400, 1200, 940, 35);
    this.matter.add.rectangle(600, 548, 1200, 66, {
      isStatic: true,
      friction: 0.9,
    });
    this.back = this.add.graphics();
    this.art = this.add.graphics();
    for (const def of structures(this.city)) {
      const body = this.matter.add.rectangle(def.x, def.y, def.w, def.h, {
        isStatic: false,
        angle: def.angle || 0,
        friction: 0.75,
        restitution: 0.08,
        density: def.material === "timber" ? 0.001 : 0.003,
      });
      // Create dynamic first: Matter must retain finite mass/inertia for release.
      this.matter.body.setStatic(body, true);
      this.chunks.push({
        def,
        body,
        hp: 100,
        loose: false,
        removed: false,
        links: [],
      });
    }
    this.supports = supportGraph(this.chunks.map((c) => c.def));

    for (let i = 0; i < this.chunks.length; i++)
      for (const j of this.supports[i])
        if (j < i) {
          const a = this.chunks[i],
            b = this.chunks[j];
          const link = this.matter.add.constraint(
            a.body,
            b.body,
            Phaser.Math.Distance.Between(a.def.x, a.def.y, b.def.x, b.def.y),
            0.8,
          );
          a.links.push(link);
          b.links.push(link);
        }
    this.initial = this.chunks.length * 100;
    const point = (p: Phaser.Input.Pointer) => {
      const event = p.event as MouseEvent | TouchEvent;
      const touch = "changedTouches" in event ? event.changedTouches[0] : event;
      const rect = this.game.canvas.getBoundingClientRect();
      return {
        x: ((touch.clientX - rect.left) * 1200) / rect.width,
        y: ((touch.clientY - rect.top) * 650) / rect.height,
      };
    };
    let down: { x: number; y: number } | undefined;
    this.input.on("pointermove", (p: Phaser.Input.Pointer) => {
      this.target = point(p);
    });
    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
      down = point(p);
    });
    this.input.on("pointerup", (p: Phaser.Input.Pointer) => {
      const up = point(p);
      if (down && Phaser.Math.Distance.Between(down.x, down.y, up.x, up.y) < 18)
        this.activate(up.x, up.y);
      down = undefined;
    });
    const dispose = () => {
      for (const e of this.effects) disasterPowers[e.power].dispose(e);
      this.effects.length = 0;
      this.rocks.length = 0;
      this.chunks.length = 0;
      for (const p of this.particles) p.life = 0;
      this.input.removeAllListeners();
    };
    this.events.once("shutdown", dispose);
    this.events.once("destroy", dispose);
    this.onStatus(0);
  }
  activate(x: number, y: number) {
    if (
      this.controls.paused ||
      document.hidden ||
      this.clock.time - this.lastActivation < 100 ||
      this.effects.length >= 8
    ) {
      if (this.effects.length >= 8) {
        const message = document.getElementById("instruction");
        if (message)
          message.textContent =
            "Eight disasters active · let an effect finish before adding another";
      }
      return;
    }
    const message = document.getElementById("instruction");
    if (message)
      message.textContent = `${this.controls.power} · target acquired`;
    this.target = { x, y };
    this.lastActivation = this.clock.time;
    this.effects.push(
      disasterPowers[this.controls.power].activate(
        Phaser.Math.Clamp(x, 10, 1190),
        Phaser.Math.Clamp(y, 100, 510),
        this.controls.strength,
        Math.floor(this.rand() * 1e6),
      ),
    );
    this.onSound(this.controls.power);
  }
  private detach(c: Chunk) {
    if (c.loose) return;
    c.loose = true;
    for (const link of c.links) this.matter.world.removeConstraint(link);
    c.links = [];
    this.matter.body.setStatic(c.body, false);
    this.matter.body.setVelocity(c.body, { x: (this.rand() - 0.5) * 2, y: -1 });
  }
  private hit(e: Effect, radius: number, base: number, kind: string) {
    for (const c of this.chunks) {
      if (c.removed) continue;
      const dx = c.body.position.x - e.x,
        dy = c.body.position.y - e.y;
      const d = kind === "quake" ? Math.abs(dx) : Math.hypot(dx, dy);
      const amount = damage(base, d, radius, e.strength, c.def.material);
      if (amount <= 0) continue;
      c.hp = Math.max(0, c.hp - amount);
      if (c.hp < 35) this.detach(c);
      if (c.loose) {
        const len = Math.max(30, d);
        const force =
          kind === "vortex"
            ? { x: -dx * 0.000006 * e.strength, y: -0.0018 * e.strength }
            : {
                x: (dx / len) * 0.002 * e.strength,
                y: (dy / len - 0.9) * 0.002 * e.strength,
              };
        if (kind === "quake") {
          force.x = Math.sin(e.age * 0.035) * 0.003 * e.strength;
          force.y = -Math.abs(Math.cos(e.age * 0.035)) * 0.0012 * e.strength;
        }
        if (kind === "heat") force.y = -0.004 * e.strength;
        this.matter.body.applyForce(c.body, c.body.position, force);
      }
    }
    const loose = new Set(this.chunks.flatMap((c, i) => (c.loose ? [i] : [])));
    for (const i of unsupported(
      this.supports,
      loose,
      this.chunks.map((c) => c.def),
      this.ground,
    )) {
      const c = this.chunks[i];
      c.hp = Math.min(c.hp, 34);
      this.detach(c);
    }
    this.burst(
      e.x,
      e.y,
      kind === "vortex" ? 0xe1d5bf : 0xd5b18d,
      kind === "quake" ? 18 : 32,
    );
  }
  private burst(x: number, y: number, color: number, count: number) {
    for (const p of this.particles) {
      if (count <= 0) break;
      if (p.life > 0) continue;
      count--;
      p.x = x;
      p.y = y;
      p.vx = (this.rand() - 0.5) * 160;
      p.vy = -this.rand() * 130;
      p.max = p.life = 500 + this.rand() * 1300;
      p.color = color;
      p.r = 2 + this.rand() * 9;
    }
  }
  update(_time: number, delta: number) {
    const dt = this.clock.tick(
      delta,
      this.controls.paused,
      this.controls.slow,
      document.hidden,
    );
    this.accumulator += dt;
    while (this.accumulator >= 1000 / 60) {
      this.simulate(1000 / 60);
      this.matter.world.step(1000 / 60);
      this.accumulator -= 1000 / 60;
    }
    if (this.clock.time - this.statusAt >= 250) {
      this.statusAt = this.clock.time;
      this.onStatus(
        destruction(
          this.chunks.map((c) => c.hp),
          this.initial,
        ),
      );
    }
    this.draw();
  }
  private simulate(dt: number) {
    for (const e of this.effects) {
      const impact = disasterPowers[e.power].step(e, dt);
      if (impact) {
        this.hit(
          impact.grounded
            ? { ...e, y: e.power === "volcano" ? 490 : this.ground }
            : e,
          impact.radius,
          impact.base,
          impact.kind,
        );
        if (e.power === "volcano") {
          this.burst(e.x, 480, 0xff9a45, 12);
          if (this.rocks.length < 12 && e.pulse % 2 === 0) {
            const body = this.matter.add.circle(e.x, 455, 6, {
              density: 0.004,
              restitution: 0.25,
            });
            this.matter.body.setVelocity(body, {
              x: (this.rand() - 0.5) * 7 * e.strength,
              y: -8 * e.strength,
            });
            this.rocks.push({ body, life: 2000 });
          }
        }
      }
    }
    for (const rock of this.rocks) {
      rock.life -= dt;
      if (rock.life <= 0) {
        this.matter.world.remove(rock.body);
        continue;
      }
      for (const c of this.chunks) {
        if (c.removed || c.loose) continue;
        const dx = Math.abs(c.body.position.x - rock.body.position.x),
          dy = Math.abs(c.body.position.y - rock.body.position.y);
        if (dx < c.def.w / 2 + 7 && dy < c.def.h / 2 + 7) {
          c.hp = Math.max(0, c.hp - 35);
          if (c.hp < 35) this.detach(c);
          rock.life = 0;
          this.matter.world.remove(rock.body);
          break;
        }
      }
    }
    this.rocks = this.rocks.filter((r) => r.life > 0);
    this.effects = this.effects.filter((e) => e.age < e.duration);
    for (const p of this.particles)
      if (p.life > 0) {
        p.life -= dt;
        p.x += (p.vx * dt) / 1000;
        p.y += (p.vy * dt) / 1000;
        p.vy += dt * 0.07;
      }
    for (const c of this.chunks)
      if (
        !c.removed &&
        c.loose &&
        (c.body.position.y > 650 ||
          c.body.position.x < -80 ||
          c.body.position.x > 1280)
      ) {
        this.matter.world.remove(c.body);
        c.removed = true;
        c.hp = 0;
      }
  }
  private draw() {
    const g = this.art,
      b = this.back,
      n = this.controls.night;
    g.clear();
    if (this.lastTheme !== n) {
      this.lastTheme = n;
      b.clear();
      const sky = n ? 0x152938 : this.city.sky;
      b.fillStyle(sky);
      b.fillRect(0, 0, 1200, 650);
      for (let band = 0; band < 16; band++) {
        b.fillStyle(n ? 0x638594 : 0xfff1d0, 0.012 + band * 0.002);
        b.fillRect(0, band * 34, 1200, 34);
      }
      for (let cloud = 0; cloud < 4; cloud++) {
        b.fillStyle(n ? 0x496376 : 0xfff4dd, n ? 0.08 : 0.25);
        b.fillEllipse(145 + cloud * 300, 95 + (cloud % 2) * 52, 170, 18);
        b.fillEllipse(170 + cloud * 300, 87 + (cloud % 2) * 52, 110, 22);
      }
      b.fillStyle(n ? 0x263b4d : 0xf7e4c3, 0.7);
      b.fillCircle(910, 125, n ? 25 : 47);
      const rng = random(this.city.seed);
      for (let layer = 0; layer < 3; layer++) {
        for (let i = 0; i < 24; i++) {
          const w = 25 + rng() * 50,
            h = 30 + rng() * (85 + layer * 30),
            x = i * 56 + layer * 12,
            y = 510 - h;
          b.fillStyle(n ? 0x203c4b : 0x78989b, 0.18 + layer * 0.14);
          b.fillRect(x, y, w, h);
          if (i % 3 === 0) b.fillTriangle(x, y, x + w / 2, y - 15, x + w, y);
        }
      }
      // Original scenery: palms, garden canopy, waterfront, promenade and geological strata.
      for (let i = 0; i < 10; i++) {
        const x = 35 + i * 127 + ((this.city.seed * 17) % 40);
        b.lineStyle(5, n ? 0x304b46 : 0x697d61);
        b.lineBetween(x, 515, x + 5, 457);
        b.fillStyle(n ? 0x294a40 : 0x66836b);
        if (this.city.water || this.city.id === "chennai") {
          for (let j = 0; j < 5; j++)
            b.fillEllipse(x + (j - 2) * 9, 453 + Math.abs(j - 2) * 4, 38, 10);
        } else {
          b.fillCircle(x, 464, 22);
          b.fillCircle(x + 13, 472, 17);
        }
      }
      b.fillStyle(n ? 0x384d4e : 0x9fa28b);
      b.fillRect(0, 515, 1200, 17);
      b.fillStyle(n ? 0x1a3038 : 0x718c86);
      b.fillRect(0, 532, 1200, 118);
      if (this.city.water) {
        for (let i = 0; i < 45; i++) {
          b.lineStyle(1, n ? 0x52717c : 0xc3d0ba, 0.5);
          const x = (i * 113) % 1200,
            y = 546 + ((i * 37) % 100);
          b.lineBetween(x, y, x + 20 + (i % 5) * 7, y);
        }
      } else {
        b.fillStyle(n ? 0x333b36 : 0x7f8066);
        b.fillRect(0, 547, 1200, 103);
        b.lineStyle(2, 0xaaa086, 0.3);
        for (let i = 0; i < 6; i++)
          b.lineBetween(0, 560 + i * 17, 1200, 570 + i * 17);
      }
    }
    for (const c of this.chunks) {
      if (c.removed) continue;
      const { def, body } = c;
      g.save();
      g.translateCanvas(body.position.x, body.position.y);
      g.rotateCanvas(body.angle);
      const color = n
        ? Phaser.Display.Color.IntegerToColor(def.color).darken(38).color
        : def.color;
      g.fillStyle(color);
      if (def.detail === "dome") {
        g.fillEllipse(0, 4, def.w, def.h * 1.5);
        g.fillRect(-def.w / 2, 0, def.w, def.h / 2);
      } else if (def.detail === "roof")
        g.fillTriangle(
          -def.w / 2,
          def.h / 2,
          0,
          -def.h / 2,
          def.w / 2,
          def.h / 2,
        );
      else g.fillRect(-def.w / 2, -def.h / 2, def.w, def.h);
      g.lineStyle(1, n ? 0x283946 : 0x605c50, 0.5);
      if (def.detail === "dome") g.strokeEllipse(0, 4, def.w, def.h * 1.5);
      else if (def.detail === "roof")
        g.strokeTriangle(
          -def.w / 2,
          def.h / 2,
          0,
          -def.h / 2,
          def.w / 2,
          def.h / 2,
        );
      else g.strokeRect(-def.w / 2, -def.h / 2, def.w, def.h);
      if (def.detail === "clock") {
        g.fillStyle(0xefe0be);
        g.fillCircle(0, 0, 12);
        g.lineStyle(2, 0x48504a);
        g.lineBetween(0, 0, 0, -8);
        g.lineBetween(0, 0, 6, 2);
      }
      g.fillStyle(n ? 0xffd891 : 0x344e5b, n ? 0.85 : 0.65);
      if (def.detail === "window")
        for (let x = -9; x <= 9; x += 18) g.fillRect(x - 3, -7, 6, 11);
      else if (def.detail === "stone") {
        g.fillStyle(0xffebc0, 0.14);
        g.fillRect(-def.w / 2 + 3, -def.h / 2 + 2, def.w - 6, 3);
        if (def.landmark && Math.round(def.y) % 2 === 0) {
          g.fillStyle(n ? 0xf8d997 : 0x6d6857, 0.7);
          g.fillRect(-4, -7, 8, 15);
        }
      }
      if (!c.loose && def.detail === "window") {
        g.lineStyle(1, n ? 0x9a9b7e : 0xe2d9ba, 0.35);
        g.lineBetween(
          -def.w / 2 + 2,
          def.h / 2 - 3,
          def.w / 2 - 2,
          def.h / 2 - 3,
        );
        if (def.material === "glass") {
          g.fillStyle(0xc8e7e1, n ? 0.1 : 0.2);
          g.fillTriangle(
            -def.w / 2 + 2,
            -def.h / 2,
            def.w / 2 - 2,
            -def.h / 2,
            -def.w / 2 + 2,
            def.h / 2,
          );
        }
      }
      if (c.hp < 75) {
        g.lineStyle(1, 0x3d352f);
        g.beginPath();
        g.moveTo(-9, -10);
        g.lineTo(1, 0);
        g.lineTo(-3, 8);
        g.strokePath();
      }
      g.restore();
    }
    for (const rock of this.rocks) {
      g.fillStyle(0xffaa61);
      g.fillCircle(rock.body.position.x, rock.body.position.y, 6);
      g.fillStyle(0x665044);
      g.fillCircle(rock.body.position.x + 1, rock.body.position.y, 4);
    }
    for (const p of this.particles)
      if (p.life > 0) {
        g.fillStyle(p.color, (0.4 * p.life) / p.max);
        g.fillCircle(p.x, p.y, p.r * (2 - p.life / p.max));
      }
    for (const e of this.effects) this.drawEffect(g, e);
    if (!this.controls.paused) {
      g.lineStyle(1, 0xf8edd8, 0.55);
      g.strokeCircle(this.target.x, this.target.y, 17);
      g.lineBetween(
        this.target.x - 23,
        this.target.y,
        this.target.x - 11,
        this.target.y,
      );
      g.lineBetween(
        this.target.x + 11,
        this.target.y,
        this.target.x + 23,
        this.target.y,
      );
    }
  }
  private drawEffect(g: Phaser.GameObjects.Graphics, e: Effect) {
    const { x, y, age } = e;
    const fade = Math.min(1, (e.duration - age) / 300);
    g.lineStyle(3, 0xf9d5a0, fade);
    switch (e.power) {
      case "meteor":
        if (age < 600) {
          const px = x - 250 * (1 - age / 600),
            py = y - 600 * (1 - age / 600);
          g.lineStyle(20, 0xffae57, 0.3);
          g.lineBetween(px - 80, py - 170, px, py);
          g.fillStyle(0xffd19a);
          g.fillCircle(px, py, 17);
          g.fillStyle(0x78574b);
          g.fillCircle(px + 3, py + 2, 12);
        } else {
          g.lineStyle(4, 0xffd8a1, fade * 0.6);
          g.strokeEllipse(
            x,
            y,
            Math.min(400, (age - 600) * 0.8),
            Math.min(140, (age - 600) * 0.3),
          );
        }
        break;
      case "alien":
        g.fillStyle(0x738b94);
        g.fillEllipse(x, 105, 100, 22);
        g.fillStyle(0xb9f2d5);
        g.fillEllipse(x, 96, 48, 24);
        g.fillStyle(0xa7ffd6, 0.15 * fade);
        g.fillTriangle(x, 110, x - 55, y, x + 55, y);
        g.lineStyle(3, 0xb1ffdc, 0.8 * fade);
        g.lineBetween(x, 115, x, y);
        break;
      case "lightning": {
        const rng = random(e.seed);
        g.lineStyle(this.controls.flash ? 2 : 4, 0xfff0bd, fade);
        g.beginPath();
        g.moveTo(x - 30, 0);
        for (let i = 1; i <= 10; i++)
          g.lineTo(x + (rng() - 0.5) * 45, (y * i) / 10);
        g.strokePath();
        g.strokeCircle(x, y, 25 + age * 0.04);
        break;
      }
      case "earthquake": {
        g.lineStyle(3, 0xe1bd86, fade);
        for (let i = 0; i < 5; i++) {
          const radius = (age * 0.2 + i * 75) % 380;
          g.strokeEllipse(x, 518, radius * 2, 12 + radius * 0.08);
        }
        g.lineBetween(x - 80, 518, x - 15, 530);
        g.lineBetween(x - 15, 530, x + 12, 521);
        g.lineBetween(x + 12, 521, x + 80, 535);
        break;
      }
      case "tornado":
        for (let i = 0; i < 15; i++) {
          const w = 22 + i * 6,
            cy = 510 - i * 20,
            drift = this.controls.motion ? Math.sin(age * 0.008 + i) * 12 : 0;
          g.lineStyle(3 + i * 0.3, 0xcbd6c8, (0.2 + i * 0.02) * fade);
          g.strokeEllipse(x + drift, cy, w * 2, 12 + i * 1.2);
        }
        break;
      case "volcano":
        g.fillStyle(0x5d5146, fade);
        g.fillTriangle(x - 70, 517, x, 460, x + 70, 517);
        g.fillStyle(0xffa451, fade);
        g.fillEllipse(x, 464, 30, 12);
        for (let i = 0; i < 8; i++) {
          const t = ((age + i * 130) % 900) / 900;
          g.fillCircle(
            x + Math.sin(i * 7) * t * 115,
            465 - Math.sin(t * Math.PI) * 170,
            5 * (1 - t) + 2,
          );
        }
        break;
    }
  }
  snapshot() {
    return {
      city: this.city.id,
      target: { ...this.target },
      destruction: destruction(
        this.chunks.map((c) => c.hp),
        this.initial,
      ),
      chunks: this.chunks.length,
      bodies: this.matter.world.getAllBodies().length,
      constraints: this.matter.world.getAllConstraints().length,
      loose: this.chunks.filter((c) => c.loose).length,
      effects: this.effects.length,
      particles: this.particles.filter((p) => p.life > 0).length,
      time: this.clock.time,
      timeScale: this.controls.paused ? 0 : this.controls.slow ? 0.25 : 1,
      night: this.controls.night,
      positions: this.chunks
        .filter((c) => c.loose)
        .slice(0, 5)
        .map((c) => ({ ...c.body.position })),
    };
  }
}
