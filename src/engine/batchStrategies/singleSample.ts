import type { BatchStrategy, DataPoint } from "../types";

export function createSingleSample(): BatchStrategy {
  let data: DataPoint[] = [];
  let currentIndex = 0;
  let epoch = 0;
  let justCompletedEpoch = false;

  return {
    name: "Single Sample (SGD)",

    init(d: DataPoint[]) {
      data = d;
      currentIndex = 0;
      epoch = 0;
      justCompletedEpoch = false;
    },

    nextBatch(): { points: DataPoint[]; indices: number[] } {
      if (justCompletedEpoch) {
        justCompletedEpoch = false;
      }

      const index = currentIndex;
      const point = data[index];
      currentIndex++;

      if (currentIndex >= data.length) {
        currentIndex = 0;
        epoch++;
        justCompletedEpoch = true;
      }

      return { points: [point], indices: [index] };
    },

    epochComplete(): boolean {
      return justCompletedEpoch;
    },

    reset() {
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
