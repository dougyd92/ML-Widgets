import { useState } from "react";

const SPEED_STEPS = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 5];

function formatMultiplier(m: number): string {
  return Number.isInteger(m) ? `${m}x` : `${m}x`;
}

interface Props {
  learningRate: number;
  speedMultiplier: number;
  onLearningRateChange: (lr: number) => void;
  onSpeedChange: (multiplier: number) => void;
}

export function ConfigPanel({
  learningRate,
  speedMultiplier,
  onLearningRateChange,
  onSpeedChange,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  // Map slider position (0..SPEED_STEPS.length-1) to multiplier
  const sliderIndex = SPEED_STEPS.indexOf(speedMultiplier);
  const currentIndex = sliderIndex >= 0 ? sliderIndex : SPEED_STEPS.indexOf(1);

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
          α = {learningRate} | Speed: {formatMultiplier(speedMultiplier)}
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
              min="0"
              max={SPEED_STEPS.length - 1}
              step="1"
              value={currentIndex}
              onChange={(e) => onSpeedChange(SPEED_STEPS[parseInt(e.target.value)])}
              className="w-32"
            />
            <span className="font-mono text-xs w-12">
              {formatMultiplier(speedMultiplier)}
            </span>
          </label>
        </div>
      )}
    </div>
  );
}
