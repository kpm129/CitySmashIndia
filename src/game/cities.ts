import type { Material } from "./domain";
export type CityId =
  "delhi" | "mumbai" | "chennai" | "bengaluru" | "kochi" | "kolkata";
export interface City {
  id: CityId;
  name: string;
  landmark: string;
  description: string;
  color: number;
  sky: number;
  water: boolean;
  seed: number;
}
export const cities: readonly City[] = [
  {
    id: "delhi",
    name: "Delhi",
    landmark: "India Gate",
    description: "Sandstone arches · ceremonial avenues",
    color: 0xcda978,
    sky: 0xe8be92,
    water: false,
    seed: 1,
  },
  {
    id: "mumbai",
    name: "Mumbai",
    landmark: "Gateway of India",
    description: "Harbour light · a city reaching skyward",
    color: 0xd7b685,
    sky: 0xb5d4da,
    water: true,
    seed: 2,
  },
  {
    id: "chennai",
    name: "Chennai",
    landmark: "Chennai Central",
    description: "Brick-red towers · tropical railway city",
    color: 0xc77762,
    sky: 0xf0d5aa,
    water: false,
    seed: 3,
  },
  {
    id: "bengaluru",
    name: "Bengaluru",
    landmark: "Vidhana Soudha",
    description: "Garden canopy · grand civic domes",
    color: 0xc9c3a1,
    sky: 0xc8ddd3,
    water: false,
    seed: 4,
  },
  {
    id: "kochi",
    name: "Kochi",
    landmark: "Chinese fishing nets",
    description: "Timber nets · quiet coastal roofs",
    color: 0xb48a69,
    sky: 0xf1c39e,
    water: true,
    seed: 5,
  },
  {
    id: "kolkata",
    name: "Kolkata",
    landmark: "Victoria Memorial",
    description: "Marble domes · gardens by the water",
    color: 0xe1ddd0,
    sky: 0xd5d4cd,
    water: false,
    seed: 6,
  },
];
export interface ChunkDef {
  x: number;
  y: number;
  w: number;
  h: number;
  color: number;
  material: Material;
  landmark: boolean;
  detail: "window" | "stone" | "roof" | "net" | "dome" | "clock";
  angle?: number;
}
export function structures(city: City): ChunkDef[] {
  const chunks: ChunkDef[] = [];
  const add = (
    x: number,
    y: number,
    w: number,
    h: number,
    color = city.color,
    detail: ChunkDef["detail"] = "stone",
    angle = 0,
  ) =>
    chunks.push({
      x,
      y,
      w,
      h,
      color,
      detail,
      angle,
      material: city.id === "kochi" ? "timber" : "masonry",
      landmark: true,
    });
  // Each landmark is assembled from physical convex pieces, including arches and roof silhouettes.
  if (city.id === "mumbai" || city.id === "delhi") {
    const tall = city.id === "delhi";
    for (const x of [520, 680])
      for (let r = 0; r < 5; r++) add(x, 501 - r * 27, 48, 26);
    for (let col = 0; col < 7; col++) add(510 + col * 30, 357, 29, 30);
    for (let col = 0; col < 6; col++) add(525 + col * 30, 332, 29, 20);
    if (tall) {
      for (let col = 0; col < 4; col++) add(555 + col * 30, 310, 29, 24);
      add(600, 292, 156, 12);
    } else {
      for (const x of [504, 696]) {
        add(x, 329, 30, 27);
        add(x, 308, 38, 15, city.color, "roof");
      }
      for (const x of [550, 650]) add(x, 386, 34, 26, city.color, "roof");
    }
  } else if (city.id === "kochi") {
    for (const cx of [500, 675]) {
      for (let r = 0; r < 5; r++)
        add(cx, 500 - r * 27, 12, 26, 0x745b4d, "stone");
      for (let i = 0; i < 5; i++)
        add(cx + 20 + i * 22, 355 + i * 11, 27, 7, 0x9b8465, "net", 0.45);
      for (let i = 0; i < 5; i++)
        add(cx + 20 + i * 22, 412 + i * 9, 27, 6, 0x746457, "net", -0.35);
      add(cx - 20, 379, 110, 7, 0x8d7459, "net", -0.55);
    }
  } else {
    const station = city.id === "chennai";
    for (let col = 0; col < 9; col++)
      for (let row = 0; row < 3; row++)
        add(465 + col * 34, 500 - row * 28, 33, 27);
    for (const x of [465, 735]) {
      for (let row = 0; row < 5; row++) add(x, 500 - row * 28, 32, 27);
      add(x, 350, 44, 25, city.color, "roof");
    }
    for (let row = 0; row < (station ? 7 : 5); row++)
      add(600, 500 - row * 27, 52, 26);
    add(
      600,
      station ? 300 : 350,
      station ? 62 : 100,
      38,
      city.color,
      station ? "clock" : "dome",
    );
    add(600, station ? 274 : 325, station ? 12 : 25, 18, city.color, "roof");
    if (!station)
      for (const x of [493, 527, 561, 639, 673, 707])
        add(x, 413, 12, 65, city.color, "stone");
    if (!station)
      for (const x of [530, 670]) add(x, 395, 48, 24, city.color, "dome");
  }
  const heights =
    city.id === "kochi"
      ? [56, 84, 56, 84, 56, 84]
      : city.id === "mumbai"
        ? [168, 252, 196, 224, 280, 168]
        : city.id === "delhi"
          ? [84, 140, 112, 168, 112, 84]
          : [112, 168, 140, 196, 140, 112];
  [90, 230, 360, 845, 980, 1110].forEach((x, i) => {
    const h = heights[i];
    for (let row = 0; row < h / 28; row++)
      for (let col = 0; col < 2; col++)
        chunks.push({
          x: x + col * 34,
          y: 501 - row * 28,
          w: 33,
          h: 27,
          color: [0x738b91, 0xa9b6ae, 0xa58c78, 0x778c83][(i + city.seed) % 4],
          material: i % 3 === 0 ? "glass" : "concrete",
          landmark: false,
          detail: "window",
        });
    if (city.id === "kochi")
      chunks.push({
        x: x + 17,
        y: 501 - h,
        w: 78,
        h: 16,
        color: 0xa06350,
        material: "timber",
        landmark: false,
        detail: "roof",
      });
  });
  return chunks;
}

export function parseCity(id: string): City | undefined {
  return cities.find(
    (c) =>
      c.id ===
      (id.toLowerCase() === "bangalore" ? "bengaluru" : id.toLowerCase()),
  );
}
