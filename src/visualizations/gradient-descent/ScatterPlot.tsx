import { useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { DataPoint } from "@/engine/types";
import type { VisualizationPanelProps } from "./modelKit";

type Props = VisualizationPanelProps;

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

// Compute a stable axis domain from data points only (called once via useMemo)
function computeFixedDomain(data: DataPoint[]) {
  const xs = data.map((d) => d.x);
  const ys = data.map((d) => d.y);
  const dataXMin = Math.min(...xs);
  const dataXMax = Math.max(...xs);
  const dataYMin = Math.min(...ys);
  const dataYMax = Math.max(...ys);

  // Round to nice numbers with generous padding for the regression line
  const xMin = Math.floor(dataXMin - 0.5);
  const xMax = Math.ceil(dataXMax + 0.5);
  const yRange = dataYMax - dataYMin;
  const yMin = Math.floor(dataYMin - yRange * 0.3);
  const yMax = Math.ceil(dataYMax + yRange * 0.3);

  return { xMin, xMax, yMin, yMax };
}

export function ScatterPlot({ data, activeIndices, params, showResidualLine }: Props) {
  // Note: `model` prop available but not used — LR scatter plot uses params directly
  const w0 = params.values.w0;
  const w1 = params.values.w1;

  // Fixed domain based on data only — doesn't shift as params change
  const { xMin, xMax, yMin, yMax } = useMemo(() => computeFixedDomain(data), [data]);

  // Regression line as two points
  const lineData = [
    { x: xMin, y: w0 + w1 * xMin },
    { x: xMax, y: w0 + w1 * xMax },
  ];

  // Residual line data for all active batch points
  const activePoints = activeIndices.map((i) => data[i]).filter(Boolean);
  const batchSize = activePoints.length;

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
          allowDataOverflow
          name="y"
          tick={{ fontSize: 12 }}
          tickFormatter={(v: number) => String(Math.round(v * 10) / 10)}
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

        {/* Residual dashed lines */}
        {showResidualLine && activePoints.map((point, i) => {
          const pred = w0 + w1 * point.x;
          return (
            <ReferenceLine
              key={`residual-${i}`}
              segment={[
                { x: point.x, y: point.y },
                { x: point.x, y: pred },
              ]}
              stroke="#ef4444"
              strokeDasharray="4 4"
              strokeWidth={2}
              strokeOpacity={batchSize > 1 ? 0.6 : 1}
            />
          );
        })}

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
