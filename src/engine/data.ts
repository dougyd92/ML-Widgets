import { createRng } from "./seed";
import type { DataPoint } from "./types";

// Generates synthetic data: y = 2x + 1 + noise
export function generateData(
  numPoints: number = 10,
  seed: number = 42
): DataPoint[] {
  const rng = createRng(seed);
  const points: DataPoint[] = [];

  for (let i = 0; i < numPoints; i++) {
    const x = 0.5 + (i / (numPoints - 1)) * 4; // spread x from 0.5 to 4.5
    const noise = (rng() - 0.5) * 1.5; // noise in [-0.75, 0.75]
    const y = 2 * x + 1 + noise;
    points.push({
      x: Math.round(x * 100) / 100,
      y: Math.round(y * 100) / 100,
    });
  }

  return points;
}
