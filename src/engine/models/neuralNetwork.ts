import type {
  Model,
  Parameters,
  DataPoint,
  GradientResult,
  ComputationStep,
} from "../types";

function fmt(n: number): string {
  return n.toFixed(3);
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function relu(x: number): number {
  return Math.max(0, x);
}

function reluDeriv(x: number): number {
  return x > 0 ? 1 : 0;
}

interface ForwardResult {
  h0_raw: number;
  h1_raw: number;
  h0: number;
  h1: number;
  z: number;
  yHat: number;
}

function forward(params: Parameters, x1: number, x2: number): ForwardResult {
  const v = params.values;
  const h0_raw = v.wh_00 * x1 + v.wh_01 * x2 + v.bh_0;
  const h1_raw = v.wh_10 * x1 + v.wh_11 * x2 + v.bh_1;
  const h0 = relu(h0_raw);
  const h1 = relu(h1_raw);
  const z = v.wo_0 * h0 + v.wo_1 * h1 + v.bo;
  const yHat = sigmoid(z);
  return { h0_raw, h1_raw, h0, h1, z, yHat };
}

export const neuralNetwork: Model = {
  name: "Neural Network (XOR)",
  parameterNames: [
    "wh_00", "wh_01", "wh_10", "wh_11",
    "bh_0", "bh_1",
    "wo_0", "wo_1", "bo",
  ],

  initialParameters(): Parameters {
    return {
      values: {
        wh_00: 0.5, wh_01: -0.3, wh_10: -0.4, wh_11: 0.6,
        bh_0: 0.1, bh_1: -0.1,
        wo_0: 0.5, wo_1: -0.5,
        bo: 0.0,
      },
    };
  },

  predict(params: Parameters, point: DataPoint): number {
    const [x1, x2] = point.features!;
    return forward(params, x1, x2).yHat;
  },

  computeLoss(predictions: number[], targets: number[]): number {
    const eps = 1e-7;
    let loss = 0;
    for (let i = 0; i < predictions.length; i++) {
      const p = Math.max(eps, Math.min(1 - eps, predictions[i]));
      const t = targets[i];
      loss -= t * Math.log(p) + (1 - t) * Math.log(1 - p);
    }
    return loss / predictions.length;
  },

  computeGradients(params: Parameters, points: DataPoint[]): GradientResult {
    const predictions: number[] = [];
    const residuals: number[] = [];
    const grads: Record<string, number> = {};
    for (const name of this.parameterNames) grads[name] = 0;

    let totalLoss = 0;
    const eps = 1e-7;

    for (const point of points) {
      const [x1, x2] = point.features!;
      const t = point.y;
      const fwd = forward(params, x1, x2);
      const { h0_raw, h1_raw, h0, h1, yHat } = fwd;

      predictions.push(yHat);
      residuals.push(yHat - t);

      const p = Math.max(eps, Math.min(1 - eps, yHat));
      totalLoss -= t * Math.log(p) + (1 - t) * Math.log(1 - p);

      // Backprop: dL/dz = yHat - t (BCE + sigmoid simplification)
      const dz = yHat - t;

      // Output layer gradients
      grads.wo_0 += dz * h0;
      grads.wo_1 += dz * h1;
      grads.bo += dz;

      // Hidden layer gradients through ReLU
      const dh0 = dz * params.values.wo_0 * reluDeriv(h0_raw);
      const dh1 = dz * params.values.wo_1 * reluDeriv(h1_raw);

      grads.wh_00 += dh0 * x1;
      grads.wh_01 += dh0 * x2;
      grads.bh_0 += dh0;
      grads.wh_10 += dh1 * x1;
      grads.wh_11 += dh1 * x2;
      grads.bh_1 += dh1;
    }

    const n = points.length;
    for (const name of this.parameterNames) grads[name] /= n;

    const meanPred = n === 1
      ? predictions[0]
      : predictions.reduce((a, b) => a + b, 0) / n;
    const meanRes = n === 1
      ? residuals[0]
      : residuals.reduce((a, b) => a + b, 0) / n;

    return {
      prediction: meanPred,
      residual: meanRes,
      predictions,
      residuals,
      gradients: grads,
      loss: totalLoss / n,
    };
  },

  describeParams(params: Parameters): ComputationStep {
    const v = params.values;
    const hidden = `W_h = [[${fmt(v.wh_00)}, ${fmt(v.wh_01)}], [${fmt(v.wh_10)}, ${fmt(v.wh_11)}]]  b_h = [${fmt(v.bh_0)}, ${fmt(v.bh_1)}]`;
    const output = `W_o = [${fmt(v.wo_0)}, ${fmt(v.wo_1)}]  b_o = ${fmt(v.bo)}`;
    return {
      label: "Current parameters",
      expression: `${hidden}\n${output}`,
      phase: "params",
    };
  },

  describeForwardPass(
    params: Parameters,
    points: DataPoint[]
  ): ComputationStep[] {
    if (points.length === 1) {
      const [x1, x2] = points[0].features!;
      const t = points[0].y;
      const fwd = forward(params, x1, x2);

      return [
        {
          label: "Hidden h₀",
          expression: `ReLU(${fmt(params.values.wh_00)}·${fmt(x1)} + ${fmt(params.values.wh_01)}·${fmt(x2)} + ${fmt(params.values.bh_0)}) = ${fmt(fwd.h0)}`,
          phase: "forward",
        },
        {
          label: "Hidden h₁",
          expression: `ReLU(${fmt(params.values.wh_10)}·${fmt(x1)} + ${fmt(params.values.wh_11)}·${fmt(x2)} + ${fmt(params.values.bh_1)}) = ${fmt(fwd.h1)}`,
          phase: "forward",
        },
        {
          label: "Output ŷ",
          expression: `σ(${fmt(params.values.wo_0)}·${fmt(fwd.h0)} + ${fmt(params.values.wo_1)}·${fmt(fwd.h1)} + ${fmt(params.values.bo)}) = ${fmt(fwd.yHat)}`,
          phase: "forward",
        },
        {
          label: "Error (BCE)",
          expression: `-(${t}·ln(${fmt(fwd.yHat)}) + ${1 - t}·ln(${fmt(1 - fwd.yHat)})) = ${fmt(this.computeLoss([fwd.yHat], [t]))}`,
          color: "#ef4444",
          phase: "residual",
        },
      ];
    }

    // Batch mode
    const n = points.length;
    const preds = points.map((p) => forward(params, p.features![0], p.features![1]).yHat);
    const meanPred = preds.reduce((a, b) => a + b, 0) / n;
    const loss = this.computeLoss(preds, points.map((p) => p.y));

    return [
      {
        label: `Batch (${n} samples)`,
        expression: `inputs: [${points.map((p) => `(${fmt(p.features![0])}, ${fmt(p.features![1])})`).join(", ")}]`,
        phase: "forward",
      },
      {
        label: "Mean prediction",
        expression: `ŷ_avg = ${fmt(meanPred)}`,
        phase: "forward",
      },
      {
        label: "Mean BCE loss",
        expression: `L = ${fmt(loss)}`,
        color: "#ef4444",
        phase: "residual",
      },
    ];
  },

  describeGradients(
    params: Parameters,
    points: DataPoint[]
  ): ComputationStep[] {
    // Compute actual gradients for display
    const grads = this.computeGradients(params, points).gradients;

    if (points.length === 1) {
      const [x1, x2] = points[0].features!;
      const fwd = forward(params, x1, x2);
      const dz = fwd.yHat - points[0].y;

      return [
        {
          label: "∂L/∂W_o",
          expression: `[${fmt(grads.wo_0)}, ${fmt(grads.wo_1)}]  ∂L/∂b_o = ${fmt(grads.bo)}`,
          phase: "gradient",
        },
        {
          label: "δ_output",
          expression: `ŷ - y = ${fmt(dz)}`,
          phase: "gradient",
        },
        {
          label: "∂L/∂W_h",
          expression: `[[${fmt(grads.wh_00)}, ${fmt(grads.wh_01)}], [${fmt(grads.wh_10)}, ${fmt(grads.wh_11)}]]`,
          phase: "gradient",
        },
        {
          label: "∂L/∂b_h",
          expression: `[${fmt(grads.bh_0)}, ${fmt(grads.bh_1)}]`,
          phase: "gradient",
        },
      ];
    }

    // Batch mode
    return [
      {
        label: "∂L/∂W_o (avg)",
        expression: `[${fmt(grads.wo_0)}, ${fmt(grads.wo_1)}]  ∂L/∂b_o = ${fmt(grads.bo)}`,
        phase: "gradient",
      },
      {
        label: "∂L/∂W_h (avg)",
        expression: `[[${fmt(grads.wh_00)}, ${fmt(grads.wh_01)}], [${fmt(grads.wh_10)}, ${fmt(grads.wh_11)}]]`,
        phase: "gradient",
      },
      {
        label: "∂L/∂b_h (avg)",
        expression: `[${fmt(grads.bh_0)}, ${fmt(grads.bh_1)}]`,
        phase: "gradient",
      },
    ];
  },
};
