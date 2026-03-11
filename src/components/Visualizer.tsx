import { ScatterPlot } from "./ScatterPlot";
import { ComputationPanel } from "./ComputationPanel";
import type { DataPoint, Parameters, StepResult, ComputationStep } from "../engine/types";

interface Props {
  data: DataPoint[];
  activeIndices: number[];
  params: Parameters;
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
}

export function Visualizer({
  data,
  activeIndices,
  params,
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
}: Props) {
  return (
    <div className="flex flex-1 gap-4 min-h-0 h-full">
      {/* Left: Scatter plot */}
      <div className="flex-1 min-w-0 bg-white rounded-lg border border-gray-200 p-2">
        <ScatterPlot
          data={data}
          activeIndices={activeIndices}
          params={params}
          showResidualLine={showResidualLine}
        />
      </div>

      {/* Right: Computation panel */}
      <div className="w-[420px] shrink-0 overflow-y-auto">
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
        />
      </div>
    </div>
  );
}
