import type { ComputationStep } from "@/engine/types";

export function MathLine({ step }: { step: ComputationStep }) {
  return (
    <div className="mb-2">
      <div
        className="text-xs font-semibold uppercase tracking-wide mb-0.5"
        style={step.color ? { color: step.color } : { color: "#6b7280" }}
      >
        {step.label}
      </div>
      <div
        className="font-mono text-sm pl-2"
        style={step.color ? { color: step.color } : undefined}
      >
        {step.expression}
      </div>
    </div>
  );
}
