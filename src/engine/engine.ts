import type {
  Model,
  UpdateRule,
  BatchStrategy,
  DataPoint,
  Parameters,
  StepResult,
  ComputationStep,
} from "./types";

export class GDEngine {
  private model: Model;
  private updateRule: UpdateRule;
  private batchStrategy: BatchStrategy;
  private data: DataPoint[];
  private params: Parameters;
  private stepCount: number;
  private learningRate: number;

  constructor(
    model: Model,
    updateRule: UpdateRule,
    batchStrategy: BatchStrategy,
    data: DataPoint[],
    learningRate: number
  ) {
    this.model = model;
    this.updateRule = updateRule;
    this.batchStrategy = batchStrategy;
    this.data = data;
    this.learningRate = learningRate;

    this.params = model.initialParameters();
    this.updateRule.init(model.parameterNames);
    this.batchStrategy.init(data);
    this.stepCount = 0;
  }

  step(): StepResult {
    const paramsBefore = { values: { ...this.params.values } };
    const lossBefore = this.computeFullLoss(this.params);

    const { points, indices } = this.batchStrategy.nextBatch();
    const epoch = this.batchStrategy.currentEpoch();

    const gradResult = this.model.computeGradients(this.params, points);

    // Build computation steps for the UI
    const computationSteps: ComputationStep[] = [];

    // Current parameters (model-specific formatting)
    computationSteps.push(this.model.describeParams(this.params));

    // Forward pass and error
    computationSteps.push(
      ...this.model.describeForwardPass(this.params, points)
    );

    // Gradients
    computationSteps.push(
      ...this.model.describeGradients(this.params, points)
    );

    // Apply update
    const paramsAfter = this.updateRule.update(
      this.params,
      gradResult.gradients,
      this.learningRate
    );

    // Update description
    computationSteps.push(
      ...this.updateRule.describeUpdate(
        this.params,
        gradResult.gradients,
        this.learningRate
      )
    );

    this.params = paramsAfter;
    this.stepCount++;

    const lossAfter = this.computeFullLoss(this.params);

    return {
      stepNumber: this.stepCount,
      epoch: this.batchStrategy.epochComplete()
        ? epoch
        : this.batchStrategy.currentEpoch(),
      sampleIndices: indices,
      paramsBefore,
      paramsAfter: { values: { ...paramsAfter.values } },
      prediction: gradResult.prediction,
      residual: gradResult.residual,
      predictions: [...gradResult.predictions],
      residuals: [...gradResult.residuals],
      gradients: { ...gradResult.gradients },
      lossBefore,
      lossAfter,
      computationSteps,
    };
  }

  computeFullLoss(params: Parameters): number {
    const predictions: number[] = [];
    const targets: number[] = [];
    for (const point of this.data) {
      predictions.push(this.model.predict(params, point));
      targets.push(point.y);
    }
    return this.model.computeLoss(predictions, targets);
  }

  getCurrentParams(): Parameters {
    return { values: { ...this.params.values } };
  }

  setParams(params: Parameters) {
    this.params = { values: { ...params.values } };
  }

  setLearningRate(lr: number) {
    this.learningRate = lr;
  }

  getData(): DataPoint[] {
    return this.data;
  }

  getModel(): Model {
    return this.model;
  }

  setBatchStrategy(strategy: BatchStrategy) {
    this.batchStrategy = strategy;
    this.batchStrategy.init(this.data);
    this.stepCount = 0;
  }

  reset() {
    this.params = this.model.initialParameters();
    this.batchStrategy.reset();
    this.stepCount = 0;
  }
}
