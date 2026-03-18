import { useMemo } from "react";
import type { StepResult, ComputationStep, DataPoint } from "@/engine/types";
import { MathLine } from "./MathLine";
import { ComputationGraph } from "./ComputationGraph";
import { LINEAR_REGRESSION_GRAPH, computeHighlightState } from "./linearRegressionGraph";

interface Props {
  stepResult: StepResult | null;
  visibleComputationSteps: ComputationStep[];
  stepNumber: number;
  totalSteps: number;
  epoch: number;
  sampleIndexInEpoch: number;
  samplesPerEpoch: number;
  subStep: number;
  subStepCount: number;
  data: DataPoint[];
}

export function ComputationPanel({
  stepResult,
  visibleComputationSteps,
  stepNumber,
  totalSteps,
  epoch,
  sampleIndexInEpoch,
  samplesPerEpoch,
  subStep,
  subStepCount,
  data,
}: Props) {
  const samplePoints = useMemo(() => {
    if (!stepResult) return [];
    return stepResult.sampleIndices.map((idx) => data[idx]).filter(Boolean);
  }, [stepResult, data]);

  const highlight = useMemo(
    () => computeHighlightState(subStep, stepResult, samplePoints),
    [subStep, stepResult, samplePoints]
  );

  if (!stepResult) {
    return (
      <div className="bg-gray-50 rounded-lg p-5 h-full flex flex-col">
        <ComputationGraph
          graph={LINEAR_REGRESSION_GRAPH}
          highlight={highlight}
        />
        <div className="flex flex-col justify-center items-center text-gray-500 mt-4">
          <div className="text-lg font-medium mb-2">Initial State</div>
          <div className="text-sm">
            Parameters: w₀ = 0.000, w₁ = 0.000
          </div>
          <div className="text-sm mt-4">Click <strong>Next</strong> to begin.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-5 h-full overflow-y-auto">
      <ComputationGraph
        graph={LINEAR_REGRESSION_GRAPH}
        highlight={highlight}
      />

      <div className="text-sm text-gray-500 mb-4 mt-3 font-medium">
        Step {stepNumber} of {totalSteps}{" "}
        <span className="text-gray-400">({subStep + 1}/{subStepCount})</span>
        &nbsp;|&nbsp; Epoch{" "}
        {epoch + 1}, {samplePoints.length > 1
          ? `Batch ${sampleIndexInEpoch + 1} of ${samplesPerEpoch} (${samplePoints.length} samples)`
          : `Sample ${sampleIndexInEpoch + 1} of ${samplesPerEpoch}`}
      </div>

      <div className="space-y-1">
        {visibleComputationSteps.map((step, i) => (
          <MathLine key={i} step={step} />
        ))}
      </div>
    </div>
  );
}
