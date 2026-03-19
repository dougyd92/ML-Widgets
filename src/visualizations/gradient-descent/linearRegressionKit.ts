import { linearRegression } from "@/engine/models/linearRegression";
import { generateData } from "@/engine/data";
import { LINEAR_REGRESSION_GRAPH, computeHighlightState } from "./linearRegressionGraph";
import { ScatterPlot } from "./ScatterPlot";
import type { ModelKit } from "./modelKit";

export const linearRegressionKit: ModelKit = {
  model: linearRegression,
  defaultData: generateData(10, 42),
  totalEpochs: 12,
  defaultLearningRate: 0.01,
  defaultBatchSize: 1,
  graphDef: LINEAR_REGRESSION_GRAPH,
  computeHighlightState,
  initialStateLabel: "Parameters: w₀ = 0.000, w₁ = 0.000",
  VisualizationPanel: ScatterPlot,
};
