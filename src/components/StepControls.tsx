interface Props {
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  onToggleAutoPlay: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  isPlaying: boolean;
}

export function StepControls({
  onNext,
  onPrev,
  onReset,
  onToggleAutoPlay,
  canGoBack,
  canGoForward,
  isPlaying,
}: Props) {
  const btnBase =
    "px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400";
  const btnPrimary = `${btnBase} bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500`;
  const btnSecondary = `${btnBase} bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400`;

  return (
    <div className="flex items-center gap-2">
      <button className={btnSecondary} onClick={onReset} disabled={!canGoBack}>
        ⏮ Reset
      </button>
      <button className={btnSecondary} onClick={onPrev} disabled={!canGoBack}>
        ◀ Previous
      </button>
      <button className={btnPrimary} onClick={onNext} disabled={!canGoForward}>
        Next ▶
      </button>
      <button
        className={`${btnBase} ${
          isPlaying
            ? "bg-amber-500 text-white hover:bg-amber-600"
            : "bg-green-600 text-white hover:bg-green-700"
        } disabled:bg-gray-300 disabled:text-gray-500`}
        onClick={onToggleAutoPlay}
        disabled={!canGoForward && !isPlaying}
      >
        {isPlaying ? "⏸ Pause" : "▶ Auto-play"}
      </button>
    </div>
  );
}
