import { neuralNetwork } from "@/engine/models/neuralNetwork";
import { generateXorData } from "@/engine/xorData";
import { NEURAL_NETWORK_GRAPH, computeNNHighlightState } from "./neuralNetworkGraph";
import { DecisionBoundaryPlot } from "./DecisionBoundaryPlot";
import type { ModelKit } from "./modelKit";

export const neuralNetworkKit: ModelKit = {
  model: neuralNetwork,
  defaultData: generateXorData(5, 42),
  totalEpochs: 50,
  defaultLearningRate: 0.5,
  defaultBatchSize: 4,
  graphDef: NEURAL_NETWORK_GRAPH,
  computeHighlightState: computeNNHighlightState,
  initialStateLabel: "9 parameters initialized (hidden: 4W + 2b, output: 2W + 1b)",
  VisualizationPanel: DecisionBoundaryPlot,
};
