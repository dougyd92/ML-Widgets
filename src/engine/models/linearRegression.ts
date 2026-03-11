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

  predict(params: Parameters, x: number): number {
    return params.values.w0 + params.values.w1 * x;
  },

  computeGradients(params: Parameters, points: DataPoint[]): GradientResult {
    // For single-sample SGD, points has one element
    // For mini-batch, average over the batch
    let totalResidual = 0;
    let dw0 = 0;
    let dw1 = 0;
    let totalLoss = 0;

    for (const point of points) {
      const prediction = this.predict(params, point.x);
      const residual = prediction - point.y;
      totalResidual += residual;
      dw0 += 2 * residual;
      dw1 += 2 * residual * point.x;
      totalLoss += residual * residual;
    }

    const n = points.length;
    const prediction = this.predict(params, points[0].x);
    const residual = prediction - points[0].y;

    return {
      prediction,
      residual,
      gradients: { w0: dw0 / n, w1: dw1 / n },
      loss: totalLoss / n,
    };
  },

  describeForwardPass(
    params: Parameters,
    points: DataPoint[]
  ): ComputationStep[] {
    const point = points[0];
    const { w0, w1 } = params.values;
    const yHat = this.predict(params, point.x);

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
  },

  describeGradients(
    params: Parameters,
    points: DataPoint[]
  ): ComputationStep[] {
    const point = points[0];
    const yHat = this.predict(params, point.x);
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
  },
};
