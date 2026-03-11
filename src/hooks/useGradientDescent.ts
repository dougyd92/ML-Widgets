import { useState, useRef, useMemo, useCallback } from "react";
import { GDEngine } from "../engine/engine";
import { linearRegression } from "../engine/models/linearRegression";
import { createVanillaSgd } from "../engine/updateRules/vanillaSgd";
import { createSingleSample } from "../engine/batchStrategies/singleSample";
import { generateData } from "../engine/data";
import type { StepResult, DataPoint, Parameters, GDConfig } from "../engine/types";

const DEFAULT_DATA = generateData(10, 42);
const TOTAL_EPOCHS = 12;

export function useGradientDescent(config: GDConfig) {
  const engineRef = useRef<GDEngine | null>(null);
  const [history, setHistory] = useState<StepResult[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);

  // Initialize engine lazily
  if (engineRef.current === null) {
    engineRef.current = new GDEngine(
      linearRegression,
      createVanillaSgd(),
      createSingleSample(),
      DEFAULT_DATA,
      config.learningRate
    );
  }

  const engine = engineRef.current;
  const data: DataPoint[] = engine.getData();
  const maxSteps = TOTAL_EPOCHS * data.length;

  const currentStep: StepResult | null = useMemo(
    () => (currentStepIndex >= 0 ? history[currentStepIndex] : null),
    [history, currentStepIndex]
  );

  const currentParams: Parameters = useMemo(
    () => currentStep?.paramsAfter ?? linearRegression.initialParameters(),
    [currentStep]
  );

  const currentLoss: number = useMemo(() => {
    if (currentStep) return currentStep.lossAfter;
    return engine.computeFullLoss(linearRegression.initialParameters());
  }, [currentStep, engine]);

  const lossHistory: number[] = useMemo(
    () => history.slice(0, currentStepIndex + 1).map((s) => s.lossAfter),
    [history, currentStepIndex]
  );

  const currentEpoch: number = useMemo(() => {
    if (!currentStep) return 0;
    return Math.floor(currentStepIndex / data.length);
  }, [currentStep, currentStepIndex, data.length]);

  const sampleIndexInEpoch: number = useMemo(() => {
    if (!currentStep) return 0;
    return currentStepIndex % data.length;
  }, [currentStep, currentStepIndex, data.length]);

  const canGoBack = currentStepIndex > -1;
  const canGoForward = currentStepIndex < maxSteps - 1;

  const next = useCallback(() => {
    if (!canGoForward) return;

    const nextIndex = currentStepIndex + 1;

    if (nextIndex < history.length) {
      // Replay existing history
      setCurrentStepIndex(nextIndex);
    } else {
      // Compute new step
      // Ensure engine state matches where we are
      if (currentStep) {
        engine.setParams(currentStep.paramsAfter);
      } else {
        engine.reset();
      }
      engine.setLearningRate(config.learningRate);

      const result = engine.step();
      setHistory((prev) => [...prev.slice(0, nextIndex), result]);
      setCurrentStepIndex(nextIndex);
    }
  }, [canGoForward, currentStepIndex, history.length, currentStep, engine, config.learningRate]);

  const prev = useCallback(() => {
    if (!canGoBack) return;
    setCurrentStepIndex((i) => i - 1);
  }, [canGoBack]);

  const reset = useCallback(() => {
    engine.reset();
    setHistory([]);
    setCurrentStepIndex(-1);
  }, [engine]);

  const setLearningRate = useCallback(
    (_lr: number) => {
      // Truncate forward history from current position
      // Future steps will use the new LR (passed via config to next())
      setHistory((prev) => prev.slice(0, currentStepIndex + 1));
    },
    [currentStepIndex]
  );

  return {
    data,
    currentStep,
    currentParams,
    currentLoss,
    lossHistory,
    currentEpoch,
    sampleIndexInEpoch,
    totalEpochs: TOTAL_EPOCHS,
    samplesPerEpoch: data.length,
    stepNumber: currentStepIndex + 1,
    totalSteps: maxSteps,
    canGoBack,
    canGoForward,
    next,
    prev,
    reset,
    setLearningRate,
  };
}
