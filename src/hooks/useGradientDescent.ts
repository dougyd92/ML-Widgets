import { useState, useRef, useMemo, useCallback } from "react";
import { GDEngine } from "../engine/engine";
import { linearRegression } from "../engine/models/linearRegression";
import { createVanillaSgd } from "../engine/updateRules/vanillaSgd";
import { createSingleSample } from "../engine/batchStrategies/singleSample";
import { generateData } from "../engine/data";
import type { StepResult, DataPoint, Parameters, GDConfig, ComputationStep, ComputationPhase } from "../engine/types";

const DEFAULT_DATA = generateData(10, 42);
const TOTAL_EPOCHS = 12;
const SUB_STEP_COUNT = 5;
const PHASE_ORDER: ComputationPhase[] = ['params', 'forward', 'residual', 'gradient', 'update'];

export function useGradientDescent(config: GDConfig) {
  const engineRef = useRef<GDEngine | null>(null);
  const [history, setHistory] = useState<StepResult[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [subStep, setSubStep] = useState(0);

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

  const currentParams: Parameters = useMemo(() => {
    if (!currentStep) return linearRegression.initialParameters();
    return subStep >= SUB_STEP_COUNT - 1 ? currentStep.paramsAfter : currentStep.paramsBefore;
  }, [currentStep, subStep]);

  const currentLoss: number = useMemo(() => {
    if (!currentStep) return engine.computeFullLoss(linearRegression.initialParameters());
    return subStep >= SUB_STEP_COUNT - 1 ? currentStep.lossAfter : currentStep.lossBefore;
  }, [currentStep, subStep, engine]);

  const visibleComputationSteps: ComputationStep[] = useMemo(() => {
    if (!currentStep) return [];
    const visiblePhases = new Set(PHASE_ORDER.slice(0, subStep + 1));
    return currentStep.computationSteps.filter(s => visiblePhases.has(s.phase));
  }, [currentStep, subStep]);

  const showResidualLine = subStep >= 2 && subStep <= 3;

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
  const canGoForward = currentStepIndex < maxSteps - 1 || (currentStepIndex === maxSteps - 1 && subStep < SUB_STEP_COUNT - 1);

  const next = useCallback(() => {
    // Advance within current step's sub-steps
    if (currentStep && subStep < SUB_STEP_COUNT - 1) {
      setSubStep(s => s + 1);
      return;
    }

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
    setSubStep(0);
  }, [canGoForward, currentStepIndex, history.length, currentStep, engine, config.learningRate, subStep]);

  const prev = useCallback(() => {
    if (subStep > 0) {
      setSubStep(s => s - 1);
      return;
    }
    if (!canGoBack) return;
    setCurrentStepIndex((i) => i - 1);
    setSubStep(SUB_STEP_COUNT - 1);
  }, [subStep, canGoBack]);

  const reset = useCallback(() => {
    engine.reset();
    setHistory([]);
    setCurrentStepIndex(-1);
    setSubStep(0);
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
    subStep,
    subStepCount: SUB_STEP_COUNT,
    visibleComputationSteps,
    showResidualLine,
    next,
    prev,
    reset,
    setLearningRate,
  };
}
