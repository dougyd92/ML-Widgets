import type { BatchStrategy, DataPoint } from "../types";
import { createRng } from "../seed";

const SHUFFLE_SEED = 42;

/** Fisher-Yates in-place shuffle */
function shuffle(arr: number[], rng: () => number): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

export function createSingleSample(): BatchStrategy {
  let data: DataPoint[] = [];
  let order: number[] = [];
  let rng: () => number = createRng(SHUFFLE_SEED);
  let currentIndex = 0;
  let epoch = 0;
  let justCompletedEpoch = false;

  function buildShuffledOrder(n: number): number[] {
    const arr = Array.from({ length: n }, (_, i) => i);
    shuffle(arr, rng);
    return arr;
  }

  return {
    name: "Single Sample (SGD)",

    init(d: DataPoint[]) {
      data = d;
      rng = createRng(SHUFFLE_SEED);
      order = buildShuffledOrder(d.length);
      currentIndex = 0;
      epoch = 0;
      justCompletedEpoch = false;
    },

    nextBatch(): { points: DataPoint[]; indices: number[] } {
      if (justCompletedEpoch) {
        justCompletedEpoch = false;
      }

      const dataIndex = order[currentIndex];
      const point = data[dataIndex];
      currentIndex++;

      if (currentIndex >= data.length) {
        currentIndex = 0;
        epoch++;
        justCompletedEpoch = true;
        order = buildShuffledOrder(data.length);
      }

      return { points: [point], indices: [dataIndex] };
    },

    epochComplete(): boolean {
      return justCompletedEpoch;
    },

    reset() {
      rng = createRng(SHUFFLE_SEED);
      order = buildShuffledOrder(data.length);
      currentIndex = 0;
      epoch = 0;
      justCompletedEpoch = false;
    },

    currentEpoch(): number {
      return epoch;
    },

    clone(): BatchStrategy {
      return createSingleSample();
    },
  };
}
