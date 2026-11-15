interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}
// Authored neighbours remain linked until a piece loses integrity. Connections are
// built once, not inferred from the changing positions of airborne debris.
export function supportGraph(boxes: readonly Box[]): number[][] {
  return boxes.map((a, i) =>
    boxes.flatMap((b, j) => {
      if (i === j) return [];
      const dx = Math.abs(a.x - b.x) - (a.w + b.w) / 2,
        dy = Math.abs(a.y - b.y) - (a.h + b.h) / 2;
      return (dx <= 2 && dy <= 12) || (dy <= 2 && dx <= 2) ? [j] : [];
    }),
  );
}
export function unsupported(
  graph: readonly number[][],
  loose: ReadonlySet<number>,
  boxes: readonly Box[],
  ground: number,
): number[] {
  const supported = new Set<number>(),
    queue: number[] = [];
  boxes.forEach((b, i) => {
    if (b.y + b.h / 2 >= ground - 2 && !loose.has(i)) {
      supported.add(i);
      queue.push(i);
    }
  });
  for (let q = 0; q < queue.length; q++)
    for (const j of graph[queue[q]])
      if (!loose.has(j) && !supported.has(j)) {
        supported.add(j);
        queue.push(j);
      }
  return boxes.flatMap((_, i) =>
    !loose.has(i) && !supported.has(i) ? [i] : [],
  );
}
