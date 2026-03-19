import type { ComputationGraphDef, GraphHighlightState } from "./graphTypes";
import type { StepResult, DataPoint } from "@/engine/types";

function fmt(n: number): string {
  return n.toFixed(3);
}

export const NEURAL_NETWORK_GRAPH: ComputationGraphDef = {
  nodes: [
    { id: "input-x1", kind: "input", label: "x₁", shape: "circle" },
    { id: "input-x2", kind: "input", label: "x₂", shape: "circle" },
    { id: "h0", kind: "operation", label: "h₀", shape: "rect" },
    { id: "h1", kind: "operation", label: "h₁", shape: "rect" },
    { id: "out", kind: "output", label: "ŷ", shape: "rect" },
  ],
  edges: [
    { id: "x1-to-h0", from: "input-x1", to: "h0" },
    { id: "x2-to-h0", from: "input-x2", to: "h0" },
    { id: "x1-to-h1", from: "input-x1", to: "h1" },
    { id: "x2-to-h1", from: "input-x2", to: "h1" },
    { id: "h0-to-out", from: "h0", to: "out" },
    { id: "h1-to-out", from: "h1", to: "out" },
  ],
};

const ALL_NODE_IDS = NEURAL_NETWORK_GRAPH.nodes.map((n) => n.id);
const ALL_EDGE_IDS = NEURAL_NETWORK_GRAPH.edges.map((e) => e.id);

export function computeNNHighlightState(
  subStep: number,
  stepResult: StepResult | null,
  samplePoints: DataPoint[]
): GraphHighlightState {
  if (!stepResult) {
    return {
      activeNodes: new Set<string>(),
      activeEdges: new Set<string>(),
      nodeValues: {},
      edgeValues: {},
      nodeDeltas: {},
      flowDirection: "none",
    };
  }

  const { paramsBefore, paramsAfter, prediction, residual, gradients } = stepResult;
  const v = paramsBefore.values;
  const isBatch = samplePoints.length > 1;

  switch (subStep) {
    case 0: // params — show weight values on hidden and output nodes
      return {
        activeNodes: new Set(["h0", "h1", "out"]),
        activeEdges: new Set<string>(),
        nodeValues: {
          h0: `b₀=${fmt(v.bh_0)}`,
          h1: `b₁=${fmt(v.bh_1)}`,
          out: `b=${fmt(v.bo)}`,
        },
        edgeValues: {
          "x1-to-h0": fmt(v.wh_00),
          "x2-to-h0": fmt(v.wh_01),
          "x1-to-h1": fmt(v.wh_10),
          "x2-to-h1": fmt(v.wh_11),
          "h0-to-out": fmt(v.wo_0),
          "h1-to-out": fmt(v.wo_1),
        },
        nodeDeltas: {},
        flowDirection: "none",
        accentColor: "#3b82f6",
      };

    case 1: { // forward
      const x1Label = isBatch ? `batch(${samplePoints.length})` : fmt(samplePoints[0]?.features?.[0] ?? 0);
      const x2Label = isBatch ? `batch(${samplePoints.length})` : fmt(samplePoints[0]?.features?.[1] ?? 0);
      const predLabel = isBatch ? `ŷ_avg=${fmt(prediction)}` : `ŷ=${fmt(prediction)}`;

      return {
        activeNodes: new Set(ALL_NODE_IDS),
        activeEdges: new Set(ALL_EDGE_IDS),
        nodeValues: {
          "input-x1": x1Label,
          "input-x2": x2Label,
          h0: "ReLU",
          h1: "ReLU",
          out: predLabel,
        },
        edgeValues: {},
        nodeDeltas: {},
        flowDirection: "forward",
        accentColor: "#3b82f6",
      };
    }

    case 2: { // residual
      const predLabel = isBatch
        ? `ŷ_avg=${fmt(prediction)}\nerr=${fmt(residual)}`
        : `ŷ=${fmt(prediction)}\ny=${fmt(samplePoints[0]?.y ?? 0)}\nerr=${fmt(residual)}`;

      return {
        activeNodes: new Set(ALL_NODE_IDS),
        activeEdges: new Set(ALL_EDGE_IDS),
        nodeValues: {
          "input-x1": isBatch ? `batch(${samplePoints.length})` : fmt(samplePoints[0]?.features?.[0] ?? 0),
          "input-x2": isBatch ? `batch(${samplePoints.length})` : fmt(samplePoints[0]?.features?.[1] ?? 0),
          h0: "ReLU",
          h1: "ReLU",
          out: predLabel,
        },
        edgeValues: {},
        nodeDeltas: {},
        flowDirection: "forward",
        accentColor: "#ef4444",
      };
    }

    case 3: // gradient — backward flow with gradient labels on edges
      return {
        activeNodes: new Set(ALL_NODE_IDS),
        activeEdges: new Set(ALL_EDGE_IDS),
        nodeValues: {
          h0: "ReLU",
          h1: "ReLU",
          out: `ŷ=${fmt(prediction)}`,
        },
        edgeValues: {
          "h0-to-out": `∂L=${fmt(gradients.wo_0)}`,
          "h1-to-out": `∂L=${fmt(gradients.wo_1)}`,
          "x1-to-h0": `∂L=${fmt(gradients.wh_00)}`,
          "x2-to-h0": `∂L=${fmt(gradients.wh_01)}`,
          "x1-to-h1": `∂L=${fmt(gradients.wh_10)}`,
          "x2-to-h1": `∂L=${fmt(gradients.wh_11)}`,
        },
        nodeDeltas: {},
        flowDirection: "backward",
        accentColor: "#8b5cf6",
      };

    case 4: { // update — show new weights with deltas
      const nv = paramsAfter.values;
      const dbo = nv.bo - v.bo;

      return {
        activeNodes: new Set(["h0", "h1", "out"]),
        activeEdges: new Set<string>(),
        nodeValues: {
          h0: `b₀=${fmt(nv.bh_0)}`,
          h1: `b₁=${fmt(nv.bh_1)}`,
          out: `b=${fmt(nv.bo)}`,
        },
        edgeValues: {},
        nodeDeltas: {
          out: { value: dbo, label: (dbo >= 0 ? "+" : "") + fmt(dbo) },
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
