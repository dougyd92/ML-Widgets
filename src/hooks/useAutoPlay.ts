import { useEffect, useRef } from "react";

export function useAutoPlay(
  isPlaying: boolean,
  speedMs: number,
  onStep: () => void,
  canGoForward: boolean
) {
  const onStepRef = useRef(onStep);
  onStepRef.current = onStep;

  useEffect(() => {
    if (!isPlaying || !canGoForward) return;

    const id = setInterval(() => {
      onStepRef.current();
    }, speedMs);

    return () => clearInterval(id);
  }, [isPlaying, speedMs, canGoForward]);
}
