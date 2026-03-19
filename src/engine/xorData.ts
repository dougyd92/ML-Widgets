import { createRng } from "./seed";
import type { DataPoint } from "./types";

export function generateXorData(
  pointsPerCluster: number = 5,
  seed: number = 42,
  noise: number = 0.15
): DataPoint[] {
  const rng = createRng(seed);
  const centers = [
    { cx: 0, cy: 0, label: 0 },
    { cx: 1, cy: 0, label: 1 },
    { cx: 0, cy: 1, label: 1 },
    { cx: 1, cy: 1, label: 0 },
  ];
  const points: DataPoint[] = [];
  for (const { cx, cy, label } of centers) {
    for (let i = 0; i < pointsPerCluster; i++) {
      const x1 = cx + (rng() - 0.5) * noise * 2;
      const x2 = cy + (rng() - 0.5) * noise * 2;
      points.push({
        x: x1,
        y: label,
        features: [x1, x2],
      });
    }
  }
  return points;
}
