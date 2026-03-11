import type { UpdateRule, Parameters, ComputationStep } from "../types";

function fmt(n: number): string {
  return n.toFixed(3);
}

export function createVanillaSgd(): UpdateRule {
  return {
    name: "Vanilla SGD",

    init(_parameterNames: string[]) {
      // No state needed for vanilla SGD
    },

    update(
      params: Parameters,
      gradients: Record<string, number>,
      lr: number
    ): Parameters {
      const newValues: Record<string, number> = {};
      for (const key in params.values) {
        newValues[key] = params.values[key] - lr * gradients[key];
      }
      return { values: newValues };
    },

    describeUpdate(
      params: Parameters,
      gradients: Record<string, number>,
      lr: number
    ): ComputationStep[] {
      const steps: ComputationStep[] = [];
      const paramNames = Object.keys(params.values);
      const subscripts = ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"];

      for (let i = 0; i < paramNames.length; i++) {
        const key = paramNames[i];
        const oldVal = params.values[key];
        const grad = gradients[key];
        const newVal = oldVal - lr * grad;
        const sub = subscripts[i] ?? `_${i}`;

        steps.push({
          label: `w${sub}`,
          expression: `${fmt(oldVal)} - ${lr}·(${fmt(grad)}) = ${fmt(newVal)}`,
          phase: "update",
        });
      }

      return steps;
    },

    clone(): UpdateRule {
      return createVanillaSgd();
    },
  };
}
