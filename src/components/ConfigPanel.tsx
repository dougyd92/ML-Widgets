import { useState } from "react";

interface Props {
  learningRate: number;
  autoPlaySpeed: number;
  onLearningRateChange: (lr: number) => void;
  onSpeedChange: (speed: number) => void;
}

export function ConfigPanel({
  learningRate,
  autoPlaySpeed,
  onLearningRateChange,
  onSpeedChange,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white border-b border-gray-200">
      <button
        className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`transition-transform ${isOpen ? "rotate-90" : ""}`}>
          ▶
        </span>
        Settings
        <span className="text-xs text-gray-400 ml-2">
          α = {learningRate} | Speed: {autoPlaySpeed}ms
        </span>
      </button>
      {isOpen && (
        <div className="px-4 py-3 flex items-center gap-8 border-t border-gray-100">
          <label className="flex items-center gap-3 text-sm">
            <span className="text-gray-600 font-medium whitespace-nowrap">
              Learning rate (α):
            </span>
            <input
              type="range"
              min="0.001"
              max="0.1"
              step="0.001"
              value={learningRate}
              onChange={(e) => onLearningRateChange(parseFloat(e.target.value))}
              className="w-32"
            />
            <span className="font-mono text-xs w-12">{learningRate}</span>
          </label>
          <label className="flex items-center gap-3 text-sm">
            <span className="text-gray-600 font-medium whitespace-nowrap">
              Auto-play speed:
            </span>
            <input
              type="range"
              min="100"
              max="3000"
              step="100"
              value={autoPlaySpeed}
              onChange={(e) => onSpeedChange(parseInt(e.target.value))}
              className="w-32"
            />
            <span className="font-mono text-xs w-16">{autoPlaySpeed}ms</span>
          </label>
        </div>
      )}
    </div>
  );
}
