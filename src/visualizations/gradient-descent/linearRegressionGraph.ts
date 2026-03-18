import type { ComputationGraphDef, GraphHighlightState } from "./graphTypes";
import type { StepResult, DataPoint } from "@/engine/types";

function fmt(n: number): string {
  return n.toFixed(3);
}

export const LINEAR_REGRESSION_GRAPH: ComputationGraphDef = {
  nodes: [
    { id: "input-bias", kind: "input", label: "1", shape: "circle" },
    { id: "input-x1", kind: "input", label: "x₁", shape: "circle" },
    { id: "w0", kind: "weight", label: "w₀", shape: "circle" },
    { id: "w1", kind: "weight", label: "w₁", shape: "circle" },
    { id: "sum", kind: "operation", label: "Σ", shape: "rect" },
  ],
  edges: [
    { id: "bias-to-w0", from: "input-bias", to: "w0" },
    { id: "x1-to-w1", from: "input-x1", to: "w1" },
    { id: "w0-to-sum", from: "w0", to: "sum" },
    { id: "w1-to-sum", from: "w1", to: "sum" },
  ],
};

const ALL_NODE_IDS = LINEAR_REGRESSION_GRAPH.nodes.map((n) => n.id);
const ALL_EDGE_IDS = LINEAR_REGRESSION_GRAPH.edges.map((e) => e.id);

export function computeHighlightState(
  subStep: number,
  stepResult: StepResult | null,
  samplePoint: DataPoint | null
): GraphHighlightState {
  // Initial / no step yet
  if (!stepResult) {
    return {
      activeNodes: new Set<string>(),
      activeEdges: new Set<string>(),
      nodeValues: { w0: "0.000", w1: "0.000" },
      edgeValues: {},
      nodeDeltas: {},
      flowDirection: "none",
    };
  }

  const { paramsBefore, paramsAfter, prediction, residual, gradients } =
    stepResult;
  const w0 = paramsBefore.values.w0;
  const w1 = paramsBefore.values.w1;
  const x = samplePoint?.x ?? 0;
  const y = samplePoint?.y ?? 0;

  switch (subStep) {
    case 0: // params
      return {
        activeNodes: new Set(["w0", "w1"]),
        activeEdges: new Set<string>(),
        nodeValues: { w0: fmt(w0), w1: fmt(w1) },
        edgeValues: {},
        nodeDeltas: {},
        flowDirection: "none",
        accentColor: "#3b82f6",
      };

    case 1: // forward
      return {
        activeNodes: new Set(ALL_NODE_IDS),
        activeEdges: new Set(ALL_EDGE_IDS),
        nodeValues: {
          "input-bias": "1",
          "input-x1": fmt(x),
          w0: fmt(w0),
          w1: fmt(w1),
          sum: "ŷ = " + fmt(prediction),
        },
        edgeValues: {},
        nodeDeltas: {},
        flowDirection: "forward",
        accentColor: "#3b82f6",
      };

    case 2: // residual
      return {
        activeNodes: new Set(ALL_NODE_IDS),
        activeEdges: new Set(ALL_EDGE_IDS),
        nodeValues: {
          "input-bias": "1",
          "input-x1": fmt(x),
          w0: fmt(w0),
          w1: fmt(w1),
          sum:
            "ŷ = " +
            fmt(prediction) +
            "\ny = " +
            fmt(y) +
            "\nresidual = " +
            fmt(residual),
        },
        edgeValues: {},
        nodeDeltas: {},
        flowDirection: "forward",
        accentColor: "#ef4444",
      };

    case 3: // gradient
      return {
        activeNodes: new Set(ALL_NODE_IDS),
        activeEdges: new Set(ALL_EDGE_IDS),
        nodeValues: {
          w0: fmt(w0),
          w1: fmt(w1),
          sum: "ŷ = " + fmt(prediction),
        },
        edgeValues: {
          "w0-to-sum": "∂L/∂w₀ = " + fmt(gradients.w0),
          "w1-to-sum": "∂L/∂w₁ = " + fmt(gradients.w1),
        },
        nodeDeltas: {},
        flowDirection: "backward",
        accentColor: "#8b5cf6",
      };

    case 4: {
      // update
      const newW0 = paramsAfter.values.w0;
      const newW1 = paramsAfter.values.w1;
      const dw0 = newW0 - w0;
      const dw1 = newW1 - w1;

      return {
        activeNodes: new Set(["w0", "w1"]),
        activeEdges: new Set<string>(),
        nodeValues: {
          w0: fmt(newW0),
          w1: fmt(newW1),
        },
        edgeValues: {},
        nodeDeltas: {
          w0: { value: dw0, label: (dw0 >= 0 ? "+" : "") + fmt(dw0) },
          w1: { value: dw1, label: (dw1 >= 0 ? "+" : "") + fmt(dw1) },
        },
        flowDirection: "none",
        accentColor: "#22c55e",
      };
    }

    default:
      return {
        activeNodes: new Set<string>(),
        activeEdges: new Set<string>(),
        nodeValues: {},
        edgeValues: {},
        nodeDeltas: {},
        flowDirection: "none",
      };
  }
}
