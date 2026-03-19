import { useMemo } from "react";
import type { StepResult, ComputationStep, DataPoint } from "@/engine/types";
import type { ComputationGraphDef, GraphHighlightState } from "./graphTypes";
import { MathLine } from "./MathLine";
import { ComputationGraph } from "./ComputationGraph";

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
  graphDef: ComputationGraphDef;
  computeHighlight: (
    subStep: number,
    stepResult: StepResult | null,
    samplePoints: DataPoint[]
  ) => GraphHighlightState;
  initialStateLabel: string;
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
  graphDef,
  computeHighlight,
  initialStateLabel,
}: Props) {
  const samplePoints = useMemo(() => {
    if (!stepResult) return [];
    return stepResult.sampleIndices.map((idx) => data[idx]).filter(Boolean);
  }, [stepResult, data]);

  const highlight = useMemo(
    () => computeHighlight(subStep, stepResult, samplePoints),
    [subStep, stepResult, samplePoints, computeHighlight]
  );

  if (!stepResult) {
    return (
      <div className="bg-gray-50 rounded-lg p-5 h-full flex flex-col">
        <ComputationGraph
          graph={graphDef}
          highlight={highlight}
        />
        <div className="flex flex-col justify-center items-center text-gray-500 mt-4">
          <div className="text-lg font-medium mb-2">Initial State</div>
          <div className="text-sm">
            {initialStateLabel}
          </div>
          <div className="text-sm mt-4">Click <strong>Next</strong> to begin.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-5 h-full overflow-y-auto">
      <ComputationGraph
        graph={graphDef}
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
