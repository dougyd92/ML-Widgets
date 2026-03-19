import type { Model, DataPoint, Parameters, StepResult } from "@/engine/types";
import type { ComputationGraphDef, GraphHighlightState } from "./graphTypes";

export interface VisualizationPanelProps {
  data: DataPoint[];
  activeIndices: number[];
  params: Parameters;
  showResidualLine: boolean;
  model: Model;
}

export interface ModelKit {
  model: Model;
  defaultData: DataPoint[];
  totalEpochs: number;
  defaultLearningRate: number;
  defaultBatchSize: number;
  graphDef: ComputationGraphDef;
  computeHighlightState: (
    subStep: number,
    stepResult: StepResult | null,
    samplePoints: DataPoint[]
  ) => GraphHighlightState;
  initialStateLabel: string;
  VisualizationPanel: React.ComponentType<VisualizationPanelProps>;
}
