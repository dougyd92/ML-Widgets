import { ScatterPlot } from "./ScatterPlot";
import { ComputationPanel } from "./ComputationPanel";
import type { DataPoint, Parameters, StepResult } from "../engine/types";

interface Props {
  data: DataPoint[];
  activeIndices: number[];
  params: Parameters;
  stepResult: StepResult | null;
  stepNumber: number;
  totalSteps: number;
  epoch: number;
  sampleIndexInEpoch: number;
  samplesPerEpoch: number;
}

export function Visualizer({
  data,
  activeIndices,
  params,
  stepResult,
  stepNumber,
  totalSteps,
  epoch,
  sampleIndexInEpoch,
  samplesPerEpoch,
}: Props) {
  return (
    <div className="flex flex-1 gap-4 min-h-0">
      {/* Left: Scatter plot */}
      <div className="flex-1 min-w-0 bg-white rounded-lg border border-gray-200 p-2">
        <ScatterPlot
          data={data}
          activeIndices={activeIndices}
          params={params}
        />
      </div>

      {/* Right: Computation panel */}
      <div className="w-[420px] shrink-0">
        <ComputationPanel
          stepResult={stepResult}
          stepNumber={stepNumber}
          totalSteps={totalSteps}
          epoch={epoch}
          sampleIndexInEpoch={sampleIndexInEpoch}
          samplesPerEpoch={samplesPerEpoch}
        />
      </div>
    </div>
  );
}
