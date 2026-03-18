import { useState, useCallback, useEffect } from "react";
import { useGradientDescent } from "./hooks/useGradientDescent";
import { useAutoPlay } from "./hooks/useAutoPlay";
import { GDVisualizer } from "./GDVisualizer";
import { StepControls } from "./StepControls";
import { LossTracker } from "./LossTracker";
import { EpochIndicator } from "./EpochIndicator";
import { ConfigPanel } from "./ConfigPanel";
import type { GDConfig } from "@/engine/types";

export function GradientDescentPage() {
  const BASE_SPEED_MS = 1000;
  const [config, setConfig] = useState<GDConfig>({
    learningRate: 0.01,
    totalEpochs: 12,
    autoPlaySpeed: 1,
    batchSize: 1,
  });
  const [isPlaying, setIsPlaying] = useState(false);

  const gd = useGradientDescent(config);

  const handleToggleAutoPlay = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  const autoPlayMs = BASE_SPEED_MS / config.autoPlaySpeed;
  useAutoPlay(isPlaying, autoPlayMs, gd.next, gd.canGoForward);

  useEffect(() => {
    if (isPlaying && !gd.canGoForward) {
      setIsPlaying(false);
    }
  }, [isPlaying, gd.canGoForward]);

  const activeIndices = gd.currentStep?.sampleIndices ?? [];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Config */}
      <ConfigPanel
        learningRate={config.learningRate}
        speedMultiplier={config.autoPlaySpeed}
        batchSize={config.batchSize}
        onLearningRateChange={(lr) => {
          setConfig((c) => ({ ...c, learningRate: lr }));
          gd.setLearningRate(lr);
        }}
        onSpeedChange={(multiplier) =>
          setConfig((c) => ({ ...c, autoPlaySpeed: multiplier }))
        }
        onBatchSizeChange={(size) => {
          setConfig((c) => ({ ...c, batchSize: size }));
          gd.setBatchSize(size);
          setIsPlaying(false);
        }}
      />

      {/* Main visualization area */}
      <div className="flex-1 min-h-0 p-4 flex flex-col">
        <GDVisualizer
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
