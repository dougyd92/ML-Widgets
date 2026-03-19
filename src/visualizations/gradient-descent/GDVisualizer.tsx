import { ComputationPanel } from "./ComputationPanel";
import type { DataPoint, Parameters, StepResult, ComputationStep, Model } from "@/engine/types";
import type { ComputationGraphDef, GraphHighlightState } from "./graphTypes";
import type { VisualizationPanelProps } from "./modelKit";

interface Props {
  data: DataPoint[];
  activeIndices: number[];
  params: Parameters;
  model: Model;
  stepResult: StepResult | null;
  visibleComputationSteps: ComputationStep[];
  showResidualLine: boolean;
  stepNumber: number;
  totalSteps: number;
  epoch: number;
  sampleIndexInEpoch: number;
  samplesPerEpoch: number;
  subStep: number;
  subStepCount: number;
  graphDef: ComputationGraphDef;
  computeHighlight: (
    subStep: number,
    stepResult: StepResult | null,
    samplePoints: DataPoint[]
  ) => GraphHighlightState;
  initialStateLabel: string;
  VisualizationPanel: React.ComponentType<VisualizationPanelProps>;
}


export function GDVisualizer({
  data,
  activeIndices,
  params,
  model,
  stepResult,
  visibleComputationSteps,
  showResidualLine,
  stepNumber,
  totalSteps,
  epoch,
  sampleIndexInEpoch,
  samplesPerEpoch,
  subStep,
  subStepCount,
  graphDef,
  computeHighlight,
  initialStateLabel,
  VisualizationPanel,
}: Props) {
  return (
    <div className="flex flex-1 gap-4 min-h-0 h-full">
      {/* Left: Visualization */}
      <div className="flex-1 min-w-0 bg-white rounded-lg border border-gray-200 p-2">
        <VisualizationPanel
          data={data}
          activeIndices={activeIndices}
          params={params}
          showResidualLine={showResidualLine}
          model={model}
        />
      </div>

      {/* Right: Computation panel */}
      <div className="w-[500px] shrink-0 overflow-y-auto">
        <ComputationPanel
          stepResult={stepResult}
          visibleComputationSteps={visibleComputationSteps}
          stepNumber={stepNumber}
          totalSteps={totalSteps}
          epoch={epoch}
          sampleIndexInEpoch={sampleIndexInEpoch}
          samplesPerEpoch={samplesPerEpoch}
          subStep={subStep}
          subStepCount={subStepCount}
          data={data}
          graphDef={graphDef}
          computeHighlight={computeHighlight}
          initialStateLabel={initialStateLabel}
        />
      </div>
    </div>
  );
}
