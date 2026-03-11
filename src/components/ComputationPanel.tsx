import type { StepResult, ComputationStep } from "../engine/types";
import { MathLine } from "./MathLine";

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
}: Props) {
  if (!stepResult) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 h-full flex flex-col justify-center items-center text-gray-500">
        <div className="text-lg font-medium mb-2">Initial State</div>
        <div className="text-sm">
          Parameters: w₀ = 0.000, w₁ = 0.000
        </div>
        <div className="text-sm mt-4">Click <strong>Next</strong> to begin.</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-5 h-full overflow-y-auto">
      <div className="text-sm text-gray-500 mb-4 font-medium">
        Step {stepNumber} of {totalSteps}{" "}
        <span className="text-gray-400">({subStep + 1}/{subStepCount})</span>
        &nbsp;|&nbsp; Epoch{" "}
        {epoch + 1}, Sample {sampleIndexInEpoch + 1} of {samplesPerEpoch}
      </div>

      <div className="space-y-1">
        {visibleComputationSteps.map((step, i) => (
          <MathLine key={i} step={step} />
        ))}
      </div>
    </div>
  );
}
