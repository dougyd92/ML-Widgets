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

export const linearRegression: Model = {
  name: "Linear Regression",
  parameterNames: ["w0", "w1"],

  initialParameters(): Parameters {
    return { values: { w0: 0, w1: 0 } };
  },

  predict(params: Parameters, point: DataPoint): number {
    return params.values.w0 + params.values.w1 * point.x;
  },

  computeLoss(predictions: number[], targets: number[]): number {
    let sum = 0;
    for (let i = 0; i < predictions.length; i++) {
      const r = predictions[i] - targets[i];
      sum += r * r;
    }
    return sum / predictions.length;
  },

  describeParams(params: Parameters): ComputationStep {
    const { w0, w1 } = params.values;
    return {
      label: "Current parameters",
      expression: `w₀ = ${fmt(w0)}    w₁ = ${fmt(w1)}`,
      phase: "params",
    };
  },

  computeGradients(params: Parameters, points: DataPoint[]): GradientResult {
    const predictions: number[] = [];
    const residuals: number[] = [];
    let dw0 = 0;
    let dw1 = 0;
    let totalLoss = 0;

    for (const point of points) {
      const pred = this.predict(params, point);
      const res = pred - point.y;
      predictions.push(pred);
      residuals.push(res);
      dw0 += 2 * res;
      dw1 += 2 * res * point.x;
      totalLoss += res * res;
    }

    const n = points.length;
    const meanPrediction = n === 1
      ? predictions[0]
      : predictions.reduce((a, b) => a + b, 0) / n;
    const meanResidual = n === 1
      ? residuals[0]
      : residuals.reduce((a, b) => a + b, 0) / n;

    return {
      prediction: meanPrediction,
      residual: meanResidual,
      predictions,
      residuals,
      gradients: { w0: dw0 / n, w1: dw1 / n },
      loss: totalLoss / n,
    };
  },

  describeForwardPass(
    params: Parameters,
    points: DataPoint[]
  ): ComputationStep[] {
    const { w0, w1 } = params.values;

    if (points.length === 1) {
      const point = points[0];
      const yHat = this.predict(params, point);
      return [
        {
          label: "Forward pass (prediction)",
          expression: `ŷ = w₀ + w₁·x = ${fmt(w0)} + ${fmt(w1)} · ${fmt(point.x)} = ${fmt(yHat)}`,
          phase: "forward",
        },
        {
          label: "Error",
          expression: `residual = ŷ - y = ${fmt(yHat)} - ${fmt(point.y)} = ${fmt(yHat - point.y)}`,
          color: "#ef4444",
          phase: "residual",
        },
      ];
    }

    // Batch mode
    const n = points.length;
    const preds = points.map((p) => this.predict(params, p));
    const residuals = points.map((p, i) => preds[i] - p.y);
    const meanPred = preds.reduce((a, b) => a + b, 0) / n;
    const meanRes = residuals.reduce((a, b) => a + b, 0) / n;

    return [
      {
        label: `Batch (${n} samples)`,
        expression: `x = [${points.map((p) => fmt(p.x)).join(", ")}]`,
        phase: "forward",
      },
      {
        label: "Mean prediction",
        expression: `ŷ_avg = (1/${n}) Σ (w₀ + w₁·xᵢ) = ${fmt(meanPred)}`,
        phase: "forward",
      },
      {
        label: "Mean error",
        expression: `avg residual = (1/${n}) Σ (ŷᵢ - yᵢ) = ${fmt(meanRes)}`,
        color: "#ef4444",
        phase: "residual",
      },
    ];
  },

  describeGradients(
    params: Parameters,
    points: DataPoint[]
  ): ComputationStep[] {
    if (points.length === 1) {
      const point = points[0];
      const yHat = this.predict(params, point);
      const residual = yHat - point.y;
      return [
        {
          label: "∂L/∂w₀",
          expression: `2(ŷ - y) = 2(${fmt(residual)}) = ${fmt(2 * residual)}`,
          phase: "gradient",
        },
        {
          label: "∂L/∂w₁",
          expression: `2(ŷ - y)·x = 2(${fmt(residual)})·${fmt(point.x)} = ${fmt(2 * residual * point.x)}`,
          phase: "gradient",
        },
      ];
    }

    // Batch mode — show averaged gradients
    const n = points.length;
    let dw0 = 0;
    let dw1 = 0;
    for (const point of points) {
      const res = this.predict(params, point) - point.y;
      dw0 += 2 * res;
      dw1 += 2 * res * point.x;
    }

    return [
      {
        label: "∂L/∂w₀",
        expression: `(1/${n}) Σ 2(ŷᵢ - yᵢ) = ${fmt(dw0 / n)}`,
        phase: "gradient",
      },
      {
        label: "∂L/∂w₁",
        expression: `(1/${n}) Σ 2(ŷᵢ - yᵢ)·xᵢ = ${fmt(dw1 / n)}`,
        phase: "gradient",
      },
    ];
  },
};
