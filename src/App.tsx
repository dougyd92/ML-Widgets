import { useState, useCallback, useEffect } from "react";
import { useGradientDescent } from "./hooks/useGradientDescent";
import { useAutoPlay } from "./hooks/useAutoPlay";
import { Visualizer } from "./components/Visualizer";
import { StepControls } from "./components/StepControls";
import { LossTracker } from "./components/LossTracker";
import { EpochIndicator } from "./components/EpochIndicator";
import { ConfigPanel } from "./components/ConfigPanel";
import type { GDConfig } from "./engine/types";

function App() {
  const BASE_SPEED_MS = 1000;
  const [config, setConfig] = useState<GDConfig>({
    learningRate: 0.01,
    totalEpochs: 12,
    autoPlaySpeed: 1, // multiplier: 1x = BASE_SPEED_MS
  });
  const [isPlaying, setIsPlaying] = useState(false);

  const gd = useGradientDescent(config);

  const handleToggleAutoPlay = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  // Stop auto-play when we can't go forward
  const autoPlayMs = BASE_SPEED_MS / config.autoPlaySpeed;
  useAutoPlay(isPlaying, autoPlayMs, gd.next, gd.canGoForward);

  // Stop playing when reaching the end
  useEffect(() => {
    if (isPlaying && !gd.canGoForward) {
      setIsPlaying(false);
    }
  }, [isPlaying, gd.canGoForward]);

  const activeIndices = gd.currentStep?.sampleIndices ?? [];

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <h1 className="text-lg font-bold text-gray-800">
          Gradient Descent Step-by-Step
        </h1>
        <p className="text-xs text-gray-500">
          Vanilla SGD on Linear Regression (y = w₀ + w₁·x)
        </p>
      </div>

      {/* Config */}
      <ConfigPanel
        learningRate={config.learningRate}
        speedMultiplier={config.autoPlaySpeed}
        onLearningRateChange={(lr) => {
          setConfig((c) => ({ ...c, learningRate: lr }));
          gd.setLearningRate(lr);
        }}
        onSpeedChange={(multiplier) =>
          setConfig((c) => ({ ...c, autoPlaySpeed: multiplier }))
        }
      />

      {/* Main visualization area */}
      <div className="flex-1 min-h-0 p-4 flex flex-col">
        <Visualizer
          data={gd.data}
          activeIndices={activeIndices}
          params={gd.currentParams}
          stepResult={gd.currentStep}
          visibleComputationSteps={gd.visibleComputationSteps}
          showResidualLine={gd.showResidualLine}
          stepNumber={gd.stepNumber}
          totalSteps={gd.totalSteps}
          epoch={gd.currentEpoch}
          sampleIndexInEpoch={gd.sampleIndexInEpoch}
          samplesPerEpoch={gd.samplesPerEpoch}
          subStep={gd.subStep}
          subStepCount={gd.subStepCount}
        />
      </div>

      {/* Bottom controls */}
      <div className="bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between">
        <StepControls
          onNext={gd.next}
          onPrev={gd.prev}
          onReset={() => {
            gd.reset();
            setIsPlaying(false);
          }}
          onToggleAutoPlay={handleToggleAutoPlay}
          canGoBack={gd.canGoBack}
          canGoForward={gd.canGoForward}
          isPlaying={isPlaying}
        />
        <div className="flex items-center gap-6">
          <LossTracker
            currentLoss={gd.currentLoss}
            lossHistory={gd.lossHistory}
          />
          <EpochIndicator
            epoch={gd.currentEpoch}
            totalEpochs={gd.totalEpochs}
            sampleIndex={gd.sampleIndexInEpoch}
            samplesPerEpoch={gd.samplesPerEpoch}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
