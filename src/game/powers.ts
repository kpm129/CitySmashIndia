import { strength, type PowerId } from "./domain";
export interface Activation {
  power: PowerId;
  x: number;
  y: number;
  age: number;
  duration: number;
  strength: number;
  seed: number;
  pulse: number;
}
export interface Impact {
  radius: number;
  base: number;
  kind: "blast" | "beam" | "quake" | "electric" | "vortex" | "heat";
  grounded: boolean;
}
export interface DisasterPower {
  readonly id: PowerId;
  preview(s: number): number;
  activate(x: number, y: number, s: number, seed: number): Activation;
  step(e: Activation, dt: number): Impact | null;
  dispose(e: Activation): void;
}
const tuning: Record<
  PowerId,
  {
    radius: number;
    base: number;
    kind: Impact["kind"];
    duration: number;
    delay: number;
    single: boolean;
    grounded: boolean;
  }
> = {
  meteor: {
    radius: 175,
    base: 260,
    kind: "blast",
    duration: 1300,
    delay: 600,
    single: true,
    grounded: false,
  },
  alien: {
    radius: 85,
    base: 28,
    kind: "beam",
    duration: 1300,
    delay: 250,
    single: false,
    grounded: false,
  },
  earthquake: {
    radius: 300,
    base: 28,
    kind: "quake",
    duration: 2200,
    delay: 0,
    single: false,
    grounded: true,
  },
  lightning: {
    radius: 105,
    base: 260,
    kind: "electric",
    duration: 1300,
    delay: 120,
    single: true,
    grounded: false,
  },
  tornado: {
    radius: 150,
    base: 24,
    kind: "vortex",
    duration: 4500,
    delay: 0,
    single: false,
    grounded: false,
  },
  volcano: {
    radius: 160,
    base: 28,
    kind: "heat",
    duration: 3500,
    delay: 0,
    single: false,
    grounded: true,
  },
};
export const disasterPowers = Object.fromEntries(
  Object.entries(tuning).map(([id, t]) => [
    id,
    {
      id: id as PowerId,
      preview: (s: number) => t.radius * Math.sqrt(strength(s)),
      activate: (
        x: number,
        y: number,
        s: number,
        seed: number,
      ): Activation => ({
        power: id as PowerId,
        x,
        y,
        age: 0,
        duration: t.duration * (0.8 + 0.2 * strength(s)),
        strength: strength(s),
        seed,
        pulse: -1,
      }),
      step: (e: Activation, dt: number): Impact | null => {
        e.age += dt;
        if (id === "tornado") e.x += dt * 0.018;
        const pulse = Math.floor(e.age / 180);
        if (
          e.age < t.delay ||
          e.age >= e.duration ||
          (t.single ? e.pulse >= 0 : e.pulse === pulse)
        )
          return null;
        e.pulse = pulse;
        return {
          radius: t.radius * Math.sqrt(e.strength),
          base: t.base,
          kind: t.kind,
          grounded: t.grounded,
        };
      },
      dispose: (e: Activation) => {
        e.age = e.duration;
      },
    },
  ]),
) as Record<PowerId, DisasterPower>;
