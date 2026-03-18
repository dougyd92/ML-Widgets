import { useMemo } from "react";
import type {
  ComputationGraphDef,
  GraphHighlightState,
  GraphNode,
  GraphNodeKind,
} from "./graphTypes";

interface Props {
  graph: ComputationGraphDef;
  highlight: GraphHighlightState;
}

const SVG_WIDTH = 420;
const SVG_HEIGHT = 250;
const PADDING_X = 60;
const PADDING_Y = 50;
const NODE_RADIUS = 24;
const RECT_SIZE = 48;
const INACTIVE_COLOR = "#d1d5db";
const INACTIVE_STROKE = "#9ca3af";
const DEFAULT_STROKE = "#1f2937";

const COLUMN_ORDER: GraphNodeKind[] = ["input", "weight", "operation", "output"];

interface Position {
  x: number;
  y: number;
}

function computeLayout(
  nodes: GraphNode[]
): Record<string, Position> {
  // Group nodes by kind (column)
  const columns = new Map<GraphNodeKind, GraphNode[]>();
  for (const node of nodes) {
    const list = columns.get(node.kind) ?? [];
    list.push(node);
    columns.set(node.kind, list);
  }

  // Filter to only columns that have nodes
  const activeColumns = COLUMN_ORDER.filter((kind) => columns.has(kind));
  const colCount = activeColumns.length;

  const positions: Record<string, Position> = {};
  const usableWidth = SVG_WIDTH - PADDING_X * 2;
  const usableHeight = SVG_HEIGHT - PADDING_Y * 2;

  activeColumns.forEach((kind, colIndex) => {
    const colNodes = columns.get(kind)!;
    const x =
      colCount === 1
        ? SVG_WIDTH / 2
        : PADDING_X + (colIndex / (colCount - 1)) * usableWidth;

    colNodes.forEach((node, rowIndex) => {
      const y =
        colNodes.length === 1
          ? SVG_HEIGHT / 2
          : PADDING_Y + (rowIndex / (colNodes.length - 1)) * usableHeight;
      positions[node.id] = { x, y };
    });
  });

  return positions;
}

const ARROW_MARKER_ID = "arrow-forward";
const ARROW_MARKER_BACK_ID = "arrow-backward";

function SvgDefs({ accentColor }: { accentColor: string }) {
  return (
    <defs>
      <marker
        id={ARROW_MARKER_ID}
        viewBox="0 0 10 6"
        refX="10"
        refY="3"
        markerWidth="8"
        markerHeight="6"
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 3 L 0 6 Z" fill={accentColor} />
      </marker>
      <marker
        id={ARROW_MARKER_BACK_ID}
        viewBox="0 0 10 6"
        refX="0"
        refY="3"
        markerWidth="8"
        markerHeight="6"
        orient="auto-start-reverse"
      >
        <path d="M 10 0 L 0 3 L 10 6 Z" fill={accentColor} />
      </marker>
    </defs>
  );
}

function GraphEdgeSvg({
  fromPos,
  toPos,
  fromShape,
  toShape,
  isActive,
  accentColor,
  flowDirection,
  label,
}: {
  fromPos: Position;
  toPos: Position;
  fromShape: "circle" | "rect";
  toShape: "circle" | "rect";
  isActive: boolean;
  accentColor: string;
  flowDirection: "forward" | "backward" | "none";
  label?: string;
}) {
  // Shorten the line to stop at node boundaries
  const dx = toPos.x - fromPos.x;
  const dy = toPos.y - fromPos.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return null;
  const ux = dx / len;
  const uy = dy / len;

  const fromOffset = fromShape === "rect" ? RECT_SIZE / 2 + 2 : NODE_RADIUS + 2;
  const toOffset = toShape === "rect" ? RECT_SIZE / 2 + 2 : NODE_RADIUS + 2;

  const x1 = fromPos.x + ux * fromOffset;
  const y1 = fromPos.y + uy * fromOffset;
  const x2 = toPos.x - ux * toOffset;
  const y2 = toPos.y - uy * toOffset;

  const isBackward = flowDirection === "backward" && isActive;
  const strokeColor = isActive ? accentColor : INACTIVE_COLOR;
  const strokeWidth = isActive ? 2 : 1.5;
  const markerId = isBackward ? ARROW_MARKER_BACK_ID : ARROW_MARKER_ID;
  const markerProp = isBackward
    ? { markerStart: `url(#${markerId})` }
    : { markerEnd: `url(#${markerId})` };

  // Label position at midpoint, offset above the line
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;

  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={isBackward ? "6 3" : undefined}
        {...markerProp}
        style={{ transition: "stroke 300ms, stroke-width 300ms" }}
      />
      {label && isActive && (
        <text
          x={mx}
          y={my - 8}
          textAnchor="middle"
          fontSize={9}
          fontFamily="monospace"
          fill={accentColor}
          fontWeight={600}
        >
          {label}
        </text>
      )}
    </g>
  );
}

function GraphNodeSvg({
  node,
  pos,
  isActive,
  accentColor,
  displayValue,
  delta,
}: {
  node: GraphNode;
  pos: Position;
  isActive: boolean;
  accentColor: string;
  displayValue?: string;
  delta?: { value: number; label: string };
}) {
  const shape = node.shape ?? "circle";
  const isInput = node.kind === "input";
  const strokeColor = isActive ? accentColor : INACTIVE_STROKE;
  const fillColor = isActive ? accentColor + "15" : "#ffffff";
  const strokeW = isActive ? 2.5 : 1.5;
  const dashArray = isInput ? "5 3" : undefined;

  // Render value lines (handle multiline with \n)
  const valueLines = displayValue ? displayValue.split("\n") : [];

  return (
    <g style={{ transition: "opacity 300ms" }}>
      {/* Node shape */}
      {shape === "circle" ? (
        <circle
          cx={pos.x}
          cy={pos.y}
          r={NODE_RADIUS}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={strokeW}
          strokeDasharray={dashArray}
          style={{ transition: "stroke 300ms, fill 300ms" }}
        />
      ) : (
        <rect
          x={pos.x - RECT_SIZE / 2}
          y={pos.y - RECT_SIZE / 2}
          width={RECT_SIZE}
          height={RECT_SIZE}
          rx={6}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={strokeW}
          strokeDasharray={dashArray}
          style={{ transition: "stroke 300ms, fill 300ms" }}
        />
      )}

      {/* Node label */}
      <text
        x={pos.x}
        y={pos.y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={16}
        fontWeight={700}
        fill={isActive ? accentColor : DEFAULT_STROKE}
        style={{ transition: "fill 300ms" }}
      >
        {node.label}
      </text>

      {/* Value below node */}
      {valueLines.length > 0 && (
        <g>
          {valueLines.map((line, i) => (
            <text
              key={i}
              x={pos.x}
              y={pos.y + (shape === "rect" ? RECT_SIZE / 2 : NODE_RADIUS) + 14 + i * 12}
              textAnchor="middle"
              fontSize={10}
              fontFamily="monospace"
              fill={isActive ? accentColor : "#6b7280"}
              fontWeight={500}
              style={{ transition: "fill 300ms" }}
            >
              {line}
            </text>
          ))}
        </g>
      )}

      {/* Delta arrow for update phase */}
      {delta && (
        <g>
          {/* Arrow indicator */}
          <text
            x={pos.x + (shape === "rect" ? RECT_SIZE / 2 : NODE_RADIUS) + 8}
            y={pos.y - 4}
            fontSize={14}
            fill={accentColor}
            fontWeight={700}
          >
            {delta.value > 0 ? "↑" : delta.value < 0 ? "↓" : "—"}
          </text>
          <text
            x={pos.x + (shape === "rect" ? RECT_SIZE / 2 : NODE_RADIUS) + 8}
            y={pos.y + 10}
            fontSize={9}
            fontFamily="monospace"
            fill={accentColor}
            fontWeight={600}
          >
            {delta.label}
          </text>
        </g>
      )}
    </g>
  );
}

// Output arrow extending from the Σ node
function OutputArrow({
  sumPos,
  isActive,
  accentColor,
  label,
}: {
  sumPos: Position;
  isActive: boolean;
  accentColor: string;
  label?: string;
}) {
  const startX = sumPos.x + RECT_SIZE / 2 + 2;
  const endX = startX + 40;
  const y = sumPos.y;
  const strokeColor = isActive ? accentColor : INACTIVE_COLOR;

  return (
    <g>
      <line
        x1={startX}
        y1={y}
        x2={endX}
        y2={y}
        stroke={strokeColor}
        strokeWidth={isActive ? 2 : 1.5}
        markerEnd={`url(#${ARROW_MARKER_ID})`}
        style={{ transition: "stroke 300ms" }}
      />
      <text
        x={endX + 8}
        y={y}
        dominantBaseline="central"
        fontSize={16}
        fontWeight={700}
        fill={isActive ? accentColor : DEFAULT_STROKE}
        style={{ transition: "fill 300ms" }}
      >
        ŷ
      </text>
      {label && (
        <text
          x={endX + 8}
          y={y + 16}
          fontSize={10}
          fontFamily="monospace"
          fill={isActive ? accentColor : "#6b7280"}
          fontWeight={500}
        >
          {label}
        </text>
      )}
    </g>
  );
}

export function ComputationGraph({ graph, highlight }: Props) {
  const positions = useMemo(
    () => computeLayout(graph.nodes),
    [graph.nodes]
  );

  const nodeMap = useMemo(() => {
    const map = new Map<string, GraphNode>();
    for (const n of graph.nodes) map.set(n.id, n);
    return map;
  }, [graph.nodes]);

  const accentColor = highlight.accentColor ?? INACTIVE_STROKE;
  const sumNode = positions["sum"];

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        width="100%"
        style={{ maxHeight: 250 }}
      >
        <SvgDefs accentColor={accentColor} />

        {/* Edges */}
        {graph.edges.map((edge) => {
          const fromNode = nodeMap.get(edge.from)!;
          const toNode = nodeMap.get(edge.to)!;
          return (
            <GraphEdgeSvg
              key={edge.id}
              fromPos={positions[edge.from]}
              toPos={positions[edge.to]}
              fromShape={fromNode.shape ?? "circle"}
              toShape={toNode.shape ?? "circle"}
              isActive={highlight.activeEdges.has(edge.id)}
              accentColor={accentColor}
              flowDirection={highlight.flowDirection}
              label={highlight.edgeValues[edge.id]}
            />
          );
        })}

        {/* Output arrow from Σ */}
        {sumNode && (
          <OutputArrow
            sumPos={sumNode}
            isActive={highlight.activeNodes.has("sum")}
            accentColor={accentColor}
          />
        )}

        {/* Nodes */}
        {graph.nodes.map((node) => (
          <GraphNodeSvg
            key={node.id}
            node={node}
            pos={positions[node.id]}
            isActive={highlight.activeNodes.has(node.id)}
            accentColor={accentColor}
            displayValue={highlight.nodeValues[node.id]}
            delta={highlight.nodeDeltas[node.id]}
          />
        ))}
      </svg>
    </div>
  );
}
