import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { DataPoint, Parameters } from "../engine/types";

interface Props {
  data: DataPoint[];
  activeIndices: number[];
  params: Parameters;
}

// Custom dot renderer for highlighting active points
function renderDot(
  props: any,
  activeIndices: number[],
  data: DataPoint[]
) {
  const { cx, cy, payload } = props;
  const dataIndex = data.findIndex(
    (d) => d.x === payload.x && d.y === payload.y
  );
  const isActive = activeIndices.includes(dataIndex);

  return (
    <circle
      key={`dot-${dataIndex}`}
      cx={cx}
      cy={cy}
      r={isActive ? 7 : 4}
      fill={isActive ? "#ef4444" : "#3b82f6"}
      stroke={isActive ? "#dc2626" : "#2563eb"}
      strokeWidth={isActive ? 2 : 1}
      style={{ transition: "all 300ms ease-out" }}
    />
  );
}

export function ScatterPlot({ data, activeIndices, params }: Props) {
  const w0 = params.values.w0;
  const w1 = params.values.w1;

  // Compute axis domain
  const xs = data.map((d) => d.x);
  const ys = data.map((d) => d.y);
  const xMin = Math.min(...xs) - 0.5;
  const xMax = Math.max(...xs) + 0.5;

  // Include regression line endpoints in y range
  const lineY1 = w0 + w1 * xMin;
  const lineY2 = w0 + w1 * xMax;
  const allYs = [...ys, lineY1, lineY2];
  const yMin = Math.min(...allYs) - 1;
  const yMax = Math.max(...allYs) + 1;

  // Regression line as two points
  const lineData = [
    { x: xMin, y: lineY1 },
    { x: xMax, y: lineY2 },
  ];

  // Residual line data
  const activePoint =
    activeIndices.length > 0 ? data[activeIndices[0]] : null;
  const activePrediction = activePoint
    ? w0 + w1 * activePoint.x
    : null;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          type="number"
          dataKey="x"
          domain={[xMin, xMax]}
          name="x"
          tick={{ fontSize: 12 }}
          label={{ value: "x", position: "bottom", fontSize: 13 }}
        />
        <YAxis
          type="number"
          dataKey="y"
          domain={[yMin, yMax]}
          name="y"
          tick={{ fontSize: 12 }}
          label={{
            value: "y",
            angle: -90,
            position: "insideLeft",
            fontSize: 13,
          }}
        />

        {/* Regression line */}
        <Scatter
          data={lineData}
          line={{ stroke: "#f97316", strokeWidth: 2 }}
          shape={() => <></>}
          legendType="none"
          isAnimationActive={false}
        />

        {/* Residual dashed line */}
        {activePoint && activePrediction !== null && (
          <ReferenceLine
            segment={[
              { x: activePoint.x, y: activePoint.y },
              { x: activePoint.x, y: activePrediction },
            ]}
            stroke="#ef4444"
            strokeDasharray="4 4"
            strokeWidth={2}
          />
        )}

        {/* Data points */}
        <Scatter
          data={data}
          shape={(props: any) => renderDot(props, activeIndices, data)}
          isAnimationActive={false}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
