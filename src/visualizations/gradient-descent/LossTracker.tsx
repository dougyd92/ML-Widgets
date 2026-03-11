interface Props {
  currentLoss: number;
  lossHistory: number[];
}

export function LossTracker({ currentLoss, lossHistory }: Props) {
  // SVG sparkline
  const width = 160;
  const height = 40;
  const padding = 2;

  let pathD = "";
  if (lossHistory.length > 1) {
    const maxLoss = Math.max(...lossHistory);
    const minLoss = Math.min(...lossHistory);
    const range = maxLoss - minLoss || 1;

    const points = lossHistory.map((loss, i) => {
      const x = padding + (i / (lossHistory.length - 1)) * (width - 2 * padding);
      const y = padding + ((maxLoss - loss) / range) * (height - 2 * padding);
      return `${x},${y}`;
    });
    pathD = `M${points.join("L")}`;
  }

  return (
    <div className="flex items-center gap-3">
      <div className="text-sm">
        <span className="text-gray-500 font-medium">MSE Loss:</span>{" "}
        <span className="font-mono font-semibold text-gray-800">
          {currentLoss.toFixed(3)}
        </span>
      </div>
      <svg
        width={width}
        height={height}
        className="bg-gray-100 rounded"
      >
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="1.5"
          />
        )}
      </svg>
    </div>
  );
}
