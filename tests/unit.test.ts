import { describe, it, expect } from "vitest";
import {
  strength,
  damage,
  destruction,
  random,
  Clock,
  preferences,
} from "../src/game/domain";
import { cities, structures } from "../src/game/cities";
describe("structural simulation contracts", () => {
  it("clamps strength including invalid inputs", () => {
    expect(strength(9)).toBe(2);
    expect(strength(-1)).toBe(0.25);
    expect(strength(NaN)).toBe(1);
  });
  it("accumulates damage with distance and material resistance", () => {
    expect(damage(100, 0, 100, 1, "glass")).toBeGreaterThan(
      damage(100, 0, 100, 1, "steel"),
    );
    expect(damage(100, 101, 100, 1, "glass")).toBe(0);
    expect(damage(100, 10, 100, 2, "concrete")).toBeGreaterThan(
      damage(100, 10, 100, 0.25, "concrete"),
    );
  });
  it("measures integrity instead of body count", () => {
    expect(destruction([100, 50], 200)).toBe(25);
    expect(destruction([0], 200)).toBe(100);
    expect(destruction([], 0)).toBe(0);
  });
  it("reproduces seeded sequences", () => {
    const a = random(42),
      b = random(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
  it("freezes and scales all simulation time and clamps suspension", () => {
    const c = new Clock();
    expect(c.tick(1000, false, false)).toBeCloseTo(50);
    expect(c.tick(16, true, false)).toBe(0);
    expect(c.tick(16, false, true)).toBe(4);
    expect(c.tick(16, false, false, true)).toBe(0);
  });
  it("rejects corrupt and old preferences", () => {
    expect(preferences("{bad").strength).toBe(1);
    expect(
      preferences('{"version":1,"strength":20,"music":false}'),
    ).toMatchObject({ strength: 2, music: false });
    expect(preferences('{"version":0,"strength":2}').strength).toBe(1);
  });
  it("authors six distinct bounded city silhouettes", () => {
    expect(cities).toHaveLength(6);
    for (const city of cities) {
      const chunks = structures(city);
      expect(chunks.length).toBeLessThanOrEqual(160);
      expect(chunks.filter((c) => c.landmark).length).toBeGreaterThan(4);
      expect(chunks.every((c) => c.w > 0 && c.h > 0)).toBe(true);
    }
    expect(new Set(cities.map((c) => JSON.stringify(structures(c)))).size).toBe(
      6,
    );
  });
});
import { disasterPowers } from "../src/game/powers";
import { powers } from "../src/game/domain";
import { parseCity } from "../src/game/cities";
describe("power lifecycle", () => {
  for (const power of powers)
    for (const s of [0.25, 1, 2])
      it(`${power} at strength ${s} targets, damages and expires`, () => {
        const p = disasterPowers[power],
          e = p.activate(600, 450, s, 42);
        expect(e.x).toBe(600);
        expect(e.y).toBe(450);
        let hits = 0;
        for (let t = 0; t < e.duration + 100; t += 100) {
          const impact = p.step(e, 100);
          if (impact) {
            expect(impact.radius).toBeGreaterThan(0);
            expect(
              damage(impact.base, 0, impact.radius, s, "masonry"),
            ).toBeGreaterThan(0);
            hits++;
          }
        }
        expect(hits).toBeGreaterThan(0);
        p.dispose(e);
        expect(p.step(e, 16)).toBeNull();
      });
  it("increases bounded area with strength for every power", () => {
    for (const p of Object.values(disasterPowers))
      expect(p.preview(2)).toBeGreaterThan(p.preview(0.25));
  });
  it("parses Bangalore without exposing a seventh city", () => {
    expect(parseCity("Bangalore")?.name).toBe("Bengaluru");
    expect(parseCity("unknown")).toBeUndefined();
  });
});
import { supportGraph, unsupported } from "../src/game/support";
describe("structural support graph", () => {
  it("breaks a lintel when both staggered pillars lose their ground path", () => {
    const boxes = [
      { x: 520, y: 500, w: 48, h: 28 },
      { x: 680, y: 500, w: 48, h: 28 },
      { x: 520, y: 472, w: 48, h: 28 },
      { x: 680, y: 472, w: 48, h: 28 },
      { x: 510, y: 444, w: 29, h: 28 },
      { x: 540, y: 444, w: 29, h: 28 },
      { x: 570, y: 444, w: 29, h: 28 },
      { x: 600, y: 444, w: 29, h: 28 },
      { x: 630, y: 444, w: 29, h: 28 },
      { x: 660, y: 444, w: 29, h: 28 },
      { x: 690, y: 444, w: 29, h: 28 },
    ];
    const graph = supportGraph(boxes);
    expect(unsupported(graph, new Set(), boxes, 515)).toEqual([]);
    expect(unsupported(graph, new Set([0, 1]), boxes, 515)).toEqual([
      2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
  });
});
it("all authored pieces have a grounded support path", () => {
  for (const city of cities) {
    const boxes = structures(city);
    expect(
      unsupported(supportGraph(boxes), new Set(), boxes, 515),
      city.id,
    ).toEqual([]);
  }
});
