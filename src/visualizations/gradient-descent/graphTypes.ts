export type GraphNodeKind = 'input' | 'weight' | 'operation' | 'output';

export interface GraphNode {
  id: string;
  kind: GraphNodeKind;
  label: string;
  shape?: 'circle' | 'rect';
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
}

export interface ComputationGraphDef {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphHighlightState {
  activeNodes: Set<string>;
  activeEdges: Set<string>;
  nodeValues: Record<string, string>;
  edgeValues: Record<string, string>;
  nodeDeltas: Record<string, { value: number; label: string }>;
  flowDirection: 'forward' | 'backward' | 'none';
  accentColor?: string;
}
