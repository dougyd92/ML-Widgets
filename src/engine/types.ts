export interface DataPoint {
  x: number;
  y: number;
}

export interface Parameters {
  values: Record<string, number>;
}

export interface GradientResult {
  prediction: number;
  residual: number;
  predictions: number[];
  residuals: number[];
  gradients: Record<string, number>;
  loss: number;
}

export type ComputationPhase = 'params' | 'forward' | 'residual' | 'gradient' | 'update';

export interface ComputationStep {
  label: string;
  expression: string;
  color?: string;
  phase: ComputationPhase;
}

export interface Model {
  name: string;
  parameterNames: string[];
  initialParameters(): Parameters;
  predict(params: Parameters, x: number): number;
  computeGradients(params: Parameters, points: DataPoint[]): GradientResult;
  describeForwardPass(params: Parameters, points: DataPoint[]): ComputationStep[];
  describeGradients(params: Parameters, points: DataPoint[]): ComputationStep[];
}

export interface UpdateRule {
  name: string;
  init(parameterNames: string[]): void;
  update(
    params: Parameters,
    gradients: Record<string, number>,
    lr: number
  ): Parameters;
  describeUpdate(
    params: Parameters,
    gradients: Record<string, number>,
    lr: number
  ): ComputationStep[];
  clone(): UpdateRule;
}

export interface BatchStrategy {
  name: string;
  init(data: DataPoint[]): void;
  nextBatch(): { points: DataPoint[]; indices: number[] };
  epochComplete(): boolean;
  reset(): void;
  currentEpoch(): number;
  clone(): BatchStrategy;
}

export interface StepResult {
  stepNumber: number;
  epoch: number;
  sampleIndices: number[];
  paramsBefore: Parameters;
  paramsAfter: Parameters;
  prediction: number;
  residual: number;
  predictions: number[];
  residuals: number[];
  gradients: Record<string, number>;
  lossBefore: number;
  lossAfter: number;
  computationSteps: ComputationStep[];
}

export interface GDConfig {
  learningRate: number;
  totalEpochs: number;
  autoPlaySpeed: number;
  batchSize: number;
}
