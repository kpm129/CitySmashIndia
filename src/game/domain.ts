export type PowerId =
  "alien" | "earthquake" | "meteor" | "tornado" | "volcano" | "lightning";
export type Material = "masonry" | "concrete" | "glass" | "steel" | "timber";
export const powers: readonly PowerId[] = [
  "alien",
  "earthquake",
  "meteor",
  "tornado",
  "volcano",
  "lightning",
];
export const strength = (n: number) =>
  Number.isFinite(n) ? Math.max(0.25, Math.min(2, n)) : 1;
const resistance: Record<Material, number> = {
  masonry: 1,
  concrete: 1.2,
  glass: 0.65,
  steel: 1.7,
  timber: 0.8,
};
export const damage = (
  base: number,
  distance: number,
  radius: number,
  s: number,
  m: Material,
) =>
  Math.max(0, (base * strength(s) * (1 - distance / radius)) / resistance[m]);
export const destruction = (remaining: number[], initial: number) =>
  initial
    ? Math.round(
        Math.max(
          0,
          Math.min(
            100,
            100 *
              (1 - remaining.reduce((a, b) => a + Math.max(0, b), 0) / initial),
          ),
        ),
      )
    : 0;
export function random(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export class Clock {
  time = 0;
  tick(delta: number, paused: boolean, slow: boolean, hidden = false) {
    const dt =
      paused || hidden
        ? 0
        : Math.min(50, Math.max(0, delta)) * (slow ? 0.25 : 1);
    this.time += dt;
    return dt;
  }
}
export interface Preferences {
  version: 1;
  strength: number;
  music: boolean;
  sfx: boolean;
  master: boolean;
  motion: boolean;
  flash: boolean;
}
export function preferences(raw: string | null): Preferences {
  const defaults: Preferences = {
    version: 1,
    strength: 1,
    music: true,
    sfx: true,
    master: true,
    motion: !globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")
      .matches,
    flash: false,
  };
  try {
    const p = JSON.parse(raw || "{}");
    if (p.version !== 1) return defaults;
    for (const k of ["music", "sfx", "master", "motion", "flash"] as const)
      if (typeof p[k] === "boolean") defaults[k] = p[k];
    defaults.strength = strength(p.strength);
    return defaults;
  } catch {
    return defaults;
  }
}
