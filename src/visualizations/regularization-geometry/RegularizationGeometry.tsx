import { useState, useRef, useEffect, useCallback } from "react";

const TAU = 2 * Math.PI;

// Draw elliptical contours centered at (cx, cy) with semi-axes (a, b) rotated by angle theta
function drawContours(ctx: CanvasRenderingContext2D, cx: number, cy: number, a: number, b: number, theta: number, levels: number[], color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  levels.forEach((level, i) => {
    ctx.globalAlpha = 0.25 + 0.12 * i;
    ctx.beginPath();
    for (let t = 0; t <= TAU + 0.01; t += 0.02) {
      const ex = a * level * Math.cos(t);
      const ey = b * level * Math.sin(t);
      const rx = ex * Math.cos(theta) - ey * Math.sin(theta) + cx;
      const ry = ex * Math.sin(theta) + ey * Math.cos(theta) + cy;
      if (t === 0) ctx.moveTo(rx, ry);
      else ctx.lineTo(rx, ry);
    }
    ctx.stroke();
  });
  ctx.globalAlpha = 1;
}

// Draw filled contours for a nicer look
function drawFilledContours(ctx: CanvasRenderingContext2D, cx: number, cy: number, a: number, b: number, theta: number, levels: number[], baseColor: string) {
  for (let i = levels.length - 1; i >= 0; i--) {
    const level = levels[i];
    const alpha = 0.04 + 0.025 * i;
    ctx.fillStyle = baseColor;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    for (let t = 0; t <= TAU + 0.01; t += 0.02) {
      const ex = a * level * Math.cos(t);
      const ey = b * level * Math.sin(t);
      const rx = ex * Math.cos(theta) - ey * Math.sin(theta) + cx;
      const ry = ex * Math.sin(theta) + ey * Math.cos(theta) + cy;
      if (t === 0) ctx.moveTo(rx, ry);
      else ctx.lineTo(rx, ry);
    }
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawConstraint(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, type: string, fillColor: string, strokeColor: string) {
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = strokeColor;
  ctx.fillStyle = fillColor;
  ctx.globalAlpha = 0.15;

  if (type === "l2") {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(cx, cy - radius);
    ctx.lineTo(cx + radius, cy);
    ctx.lineTo(cx, cy + radius);
    ctx.lineTo(cx - radius, cy);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawAxes(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  // horizontal
  ctx.beginPath();
  ctx.moveTo(cx - size, cy);
  ctx.lineTo(cx + size, cy);
  ctx.stroke();
  // vertical
  ctx.beginPath();
  ctx.moveTo(cx, cy - size);
  ctx.lineTo(cx, cy + size);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawPoint(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, fill: string, stroke: string, label?: string, labelOffset?: { x?: number; y?: number; align?: CanvasTextAlign }) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, TAU);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.stroke();

  if (label) {
    ctx.fillStyle = "#1a1a2e";
    ctx.font = "bold 13px 'DM Sans', sans-serif";
    ctx.textAlign = labelOffset?.align || "left";
    ctx.fillText(label, x + (labelOffset?.x || 8), y + (labelOffset?.y || -8));
  }
}

function drawAxisLabels(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  ctx.fillStyle = "#666";
  ctx.font = "italic 15px 'DM Sans', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("w\u2081", cx + size - 8, cy + 22);
  ctx.textAlign = "center";
  ctx.fillText("w\u2082", cx + 14, cy - size + 10);
}

// For L2: project OLS point onto circle
function findContactPointL2(olsX: number, olsY: number, radius: number) {
  const dist = Math.sqrt(olsX * olsX + olsY * olsY);
  if (dist <= radius) return { x: olsX, y: olsY };
  return { x: (olsX / dist) * radius, y: (olsY / dist) * radius };
}

function findContactPointL1(olsX: number, olsY: number, radius: number, a: number, b: number, theta: number) {
  // Find the point on the L1 diamond (|x|+|y| = radius) that minimizes
  // elliptical distance to (olsX, olsY) with semi-axes a, b and rotation theta.
  //
  // For each of the 4 diamond edges, the loss is quadratic in the edge parameter t,
  // so we solve d/dt[loss] = 0 analytically and clamp to [0, radius].

  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);
  const a2 = a * a;
  const b2 = b * b;

  let bestX = 0;
  let bestY = 0;
  let bestLoss = Infinity;

  const edges = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

  for (const [sx, sy] of edges) {
    // Edge parameterization: x = sx * t, y = sy * (radius - t), t in [0, radius]
    // Loss components are linear in t, so loss is quadratic in t.
    const rxSlope = sx * cosT - sy * sinT;
    const rxIntercept = -olsX * cosT + (sy * radius - olsY) * sinT;
    const rySlope = -sx * sinT - sy * cosT;
    const ryIntercept = olsX * sinT + (sy * radius - olsY) * cosT;

    const denom = (rxSlope * rxSlope) / a2 + (rySlope * rySlope) / b2;
    let tOpt;
    if (Math.abs(denom) < 1e-12) {
      tOpt = 0;
    } else {
      const numer = -(rxSlope * rxIntercept / a2 + rySlope * ryIntercept / b2);
      tOpt = numer / denom;
    }

    // Clamp to valid edge range
    tOpt = Math.max(0, Math.min(radius, tOpt));

    const x = sx * tOpt;
    const y = sy * (radius - tOpt);

    // Compute loss at this point
    const dx = x - olsX;
    const dy = y - olsY;
    const rx = dx * cosT + dy * sinT;
    const ry = -dx * sinT + dy * cosT;
    const loss = (rx * rx) / a2 + (ry * ry) / b2;

    if (loss < bestLoss) {
      bestLoss = loss;
      bestX = x;
      bestY = y;
    }
  }

  return { x: bestX, y: bestY };
}

function Panel({ type, width, height, lambda }: { type: "l1" | "l2"; width: number; height: number; lambda: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const plotSize = Math.min(width, height) * 0.4;

    const olsRawX = 0.85;
    const olsRawY = 0.15;
    const olsPixelX = cx + olsRawX * plotSize;
    const olsPixelY = cy - olsRawY * plotSize;

    const contourA = plotSize * 0.25;
    const contourB = plotSize * 0.08;
    const theta = -15 * Math.PI / 180;
    const levels = [0.6, 1.2, 1.9, 2.7, 3.6, 4.6, 5.8, 7.0, 8.5];

    const maxRadius = plotSize * 1;
    const minRadius = plotSize * 0.2;
    const constraintRadius = maxRadius - (maxRadius - minRadius) * lambda;

    const isL2 = type === "l2";
    const constraintFill = isL2 ? "#4a90d9" : "#d94a4a";
    const constraintStroke = isL2 ? "#2c5f99" : "#992c2c";
    const contourColor = "#1a1a2e";

    drawAxes(ctx, cx, cy, plotSize + 15);
    drawAxisLabels(ctx, cx, cy, plotSize + 15);

    drawFilledContours(ctx, olsPixelX, olsPixelY, contourA, contourB, theta, levels, contourColor);
    drawContours(ctx, olsPixelX, olsPixelY, contourA, contourB, theta, levels, contourColor);
    drawConstraint(ctx, cx, cy, constraintRadius, type, constraintFill, constraintStroke);

    let contact;
    if (isL2) {
      contact = findContactPointL2(olsRawX * plotSize, -olsRawY * plotSize, constraintRadius);
    } else {
      contact = findContactPointL1(olsRawX * plotSize, -olsRawY * plotSize, constraintRadius, contourA, contourB, theta);
    }

    const contactPixelX = cx + contact.x;
    const contactPixelY = cy + contact.y;

    const olsInConstraint = isL2
      ? Math.sqrt((olsRawX * plotSize) ** 2 + (olsRawY * plotSize) ** 2) <= constraintRadius
      : Math.abs(olsRawX * plotSize) + Math.abs(olsRawY * plotSize) <= constraintRadius;

    drawPoint(ctx, olsPixelX, olsPixelY, 6, "#e8c547", "#b8962a", "OLS solution", { x: 8, y: -10 });

    if (!olsInConstraint) {
      drawPoint(
        ctx,
        contactPixelX,
        contactPixelY,
        7,
        isL2 ? "#4a90d9" : "#d94a4a",
        isL2 ? "#2c5f99" : "#7a1a1a",
        isL2 ? "Ridge solution" : "Lasso solution",
        {
          x: type === "l1" && Math.abs(contact.y) < 5 ? 10 : -10,
          y: 18,
          align: type === "l1" && Math.abs(contact.y) < 5 ? "left" : "right",
        }
      );

      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = "#888";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(olsPixelX, olsPixelY);
      ctx.lineTo(contactPixelX, contactPixelY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (!isL2 && !olsInConstraint && Math.abs(contact.y) < 5) {
      ctx.fillStyle = "#992c2c";
      ctx.font = "bold 12px 'DM Sans', sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("w\u2082 = 0 (eliminated!)", contactPixelX + 10, contactPixelY + 34);
    }

    ctx.fillStyle = "#1a1a2e";
    ctx.font = "bold 18px 'DM Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(isL2 ? "L2 (Ridge) \u2014 Circle" : "L1 (Lasso) \u2014 Diamond", cx, 28);

    ctx.fillStyle = "#666";
    ctx.font = "14px 'DM Sans', sans-serif";
    ctx.fillText(
      isL2
        ? "Smooth boundary \u2192 coefficients shrink, never zero"
        : "Corners on axes \u2192 coefficients can hit exactly zero",
      cx,
      48
    );
  }, [type, width, height, lambda, dpr]);

  useEffect(() => {
    draw();
  }, [draw]);

  return <canvas ref={canvasRef} style={{ display: "block" }} />;
}

export default function RegularizationGeometry() {
  const [lambda, setLambda] = useState(0.55);

  return (
    <div
      style={{
        background: "#f5f2eb",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        padding: "24px",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&display=swap"
        rel="stylesheet"
      />

      <h1
        style={{
          fontSize: "26px",
          fontWeight: 700,
          color: "#1a1a2e",
          marginBottom: "4px",
          letterSpacing: "-0.5px",
        }}
      >
        Why L1 Produces Sparsity and L2 Doesn't
      </h1>
      <p
        style={{
          fontSize: "15px",
          color: "#666",
          marginBottom: "28px",
          maxWidth: "700px",
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        The regularized solution is where the loss contours (ellipses centered at the OLS
        solution) first touch the constraint region. The diamond's corners sit on the axes,
        so contact tends to zero out a coefficient.
      </p>

      <div
        style={{
          display: "flex",
          gap: "32px",
          marginBottom: "28px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "12px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            border: "1px solid #ddd",
          }}
        >
          <Panel type="l2" width={380} height={380} lambda={lambda} />
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "12px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            border: "1px solid #ddd",
          }}
        >
          <Panel type="l1" width={380} height={380} lambda={lambda} />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          background: "#fff",
          padding: "16px 28px",
          borderRadius: "10px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          border: "1px solid #ddd",
        }}
      >
        <label
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#1a1a2e",
            whiteSpace: "nowrap",
          }}
        >
          Regularization strength ({"\u03BB"}):
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={lambda}
          onChange={(e) => setLambda(parseFloat(e.target.value))}
          style={{
            width: "240px",
            accentColor: "#555",
            cursor: "pointer",
          }}
        />
        <span
          style={{
            fontSize: "14px",
            color: "#666",
            minWidth: "80px",
          }}
        >
          {lambda < 0.01
            ? "None"
            : lambda < 0.15
            ? "Weak"
            : lambda < 0.4
            ? "Moderate"
            : lambda < 0.7
            ? "Strong"
            : "Very strong"}
        </span>
      </div>

      <div
        style={{
          marginTop: "20px",
          display: "flex",
          gap: "32px",
          fontSize: "13px",
          color: "#888",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#e8c547",
              border: "2px solid #b8962a",
            }}
          />
          OLS (unregularized)
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#4a90d9",
              border: "2px solid #2c5f99",
            }}
          />
          Ridge solution
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#d94a4a",
              border: "2px solid #7a1a1a",
            }}
          />
          Lasso solution
        </div>
      </div>
    </div>
  );
}
