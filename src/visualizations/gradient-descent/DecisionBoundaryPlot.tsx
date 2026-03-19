import { useRef, useEffect, useMemo } from "react";
import type { VisualizationPanelProps } from "./modelKit";
import type { DataPoint } from "@/engine/types";

const GRID_RES = 150;
const PADDING = 0.3;

function computeDomain(data: DataPoint[]) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of data) {
    const [x1, x2] = p.features ?? [p.x, 0];
    if (x1 < minX) minX = x1;
    if (x1 > maxX) maxX = x1;
    if (x2 < minY) minY = x2;
    if (x2 > maxY) maxY = x2;
  }
  return {
    x1Min: minX - PADDING,
    x1Max: maxX + PADDING,
    x2Min: minY - PADDING,
    x2Max: maxY + PADDING,
  };
}

function lerpColor(p: number): [number, number, number] {
  // blue (p=0) → white (p=0.5) → red (p=1)
  if (p <= 0.5) {
    const t = p / 0.5;
    return [
      Math.round(59 + (255 - 59) * t),   // R: 59→255
      Math.round(130 + (255 - 130) * t),  // G: 130→255
      Math.round(246 + (255 - 246) * t),  // B: 246→255
    ];
  } else {
    const t = (p - 0.5) / 0.5;
    return [
      Math.round(255 - (255 - 239) * t),  // R: 255→239
      Math.round(255 - (255 - 68) * t),   // G: 255→68
      Math.round(255 - (255 - 68) * t),   // B: 255→68
    ];
  }
}

export function DecisionBoundaryPlot({
  data,
  activeIndices,
  params,
  model,
}: VisualizationPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const domain = useMemo(() => computeDomain(data), [data]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width;
    const H = canvas.height;

    // Draw decision boundary heatmap
    const imgData = ctx.createImageData(GRID_RES, GRID_RES);
    for (let row = 0; row < GRID_RES; row++) {
      for (let col = 0; col < GRID_RES; col++) {
        const x1 = domain.x1Min + (col / (GRID_RES - 1)) * (domain.x1Max - domain.x1Min);
        const x2 = domain.x2Max - (row / (GRID_RES - 1)) * (domain.x2Max - domain.x2Min); // y-axis flipped
        const p = model.predict(params, { x: x1, y: 0, features: [x1, x2] });
        const [r, g, b] = lerpColor(p);
        const idx = (row * GRID_RES + col) * 4;
        imgData.data[idx] = r;
        imgData.data[idx + 1] = g;
        imgData.data[idx + 2] = b;
        imgData.data[idx + 3] = 255;
      }
    }

    // Scale heatmap to canvas
    const offscreen = new OffscreenCanvas(GRID_RES, GRID_RES);
    const offCtx = offscreen.getContext("2d")!;
    offCtx.putImageData(imgData, 0, 0);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(offscreen, 0, 0, W, H);

    // Draw data points
    const activeSet = new Set(activeIndices);
    for (let i = 0; i < data.length; i++) {
      const [x1, x2] = data[i].features ?? [data[i].x, 0];
      const label = data[i].y;
      const isActive = activeSet.has(i);

      const cx = ((x1 - domain.x1Min) / (domain.x1Max - domain.x1Min)) * W;
      const cy = ((domain.x2Max - x2) / (domain.x2Max - domain.x2Min)) * H;
      const radius = isActive ? 8 : 5;

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = label > 0.5 ? "#dc2626" : "#2563eb";
      ctx.fill();
      ctx.strokeStyle = isActive ? "#ffffff" : "#1f2937";
      ctx.lineWidth = isActive ? 3 : 1.5;
      ctx.stroke();
    }
  }, [data, activeIndices, params, model, domain]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        className="max-w-full max-h-full"
        style={{ objectFit: "contain", aspectRatio: "1" }}
      />
    </div>
  );
}
