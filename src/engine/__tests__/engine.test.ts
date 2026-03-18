// @vitest-environment node
import { GDEngine } from '../engine'
import { linearRegression } from '../models/linearRegression'
import { createVanillaSgd } from '../updateRules/vanillaSgd'
import { createSingleSample } from '../batchStrategies/singleSample'
import { generateData } from '../data'

function createEngine(lr = 0.01) {
  const data = generateData(10, 42)
  return new GDEngine(
    linearRegression,
    createVanillaSgd(),
    createSingleSample(),
    data,
    lr
  )
}

describe('GDEngine', () => {
  describe('step', () => {
    it('returns a valid StepResult with all required fields', () => {
      const engine = createEngine()
      const result = engine.step()

      expect(result.stepNumber).toBe(1)
      expect(result.epoch).toBeGreaterThanOrEqual(0)
      expect(result.sampleIndices).toBeInstanceOf(Array)
      expect(result.paramsBefore.values).toHaveProperty('w0')
      expect(result.paramsBefore.values).toHaveProperty('w1')
      expect(result.paramsAfter.values).toHaveProperty('w0')
      expect(result.paramsAfter.values).toHaveProperty('w1')
      expect(typeof result.prediction).toBe('number')
      expect(typeof result.residual).toBe('number')
      expect(typeof result.lossBefore).toBe('number')
      expect(typeof result.lossAfter).toBe('number')
      expect(result.computationSteps.length).toBeGreaterThan(0)
    })

    it('increments step number', () => {
      const engine = createEngine()
      expect(engine.step().stepNumber).toBe(1)
      expect(engine.step().stepNumber).toBe(2)
      expect(engine.step().stepNumber).toBe(3)
    })

    it('chains params: paramsAfter of step N equals paramsBefore of step N+1', () => {
      const engine = createEngine()
      const step1 = engine.step()
      const step2 = engine.step()
      const step3 = engine.step()

      expect(step2.paramsBefore.values).toEqual(step1.paramsAfter.values)
      expect(step3.paramsBefore.values).toEqual(step2.paramsAfter.values)
    })

    it('computationSteps contains all 5 phases', () => {
      const engine = createEngine()
      const result = engine.step()
      const phases = result.computationSteps.map(s => s.phase)

      expect(phases).toContain('params')
      expect(phases).toContain('forward')
      expect(phases).toContain('residual')
      expect(phases).toContain('gradient')
      expect(phases).toContain('update')
    })
  })

  describe('training convergence', () => {
    it('loss decreases over many steps', () => {
      const engine = createEngine()
      const firstStep = engine.step()
      let lastStep = firstStep
      for (let i = 1; i < 50; i++) {
        lastStep = engine.step()
      }
      expect(lastStep.lossAfter).toBeLessThan(firstStep.lossBefore)
    })
  })

  describe('computeFullLoss', () => {
    it('computes MSE over all data points', () => {
      const engine = createEngine()
      const params = engine.getCurrentParams()
      const data = engine.getData()

      // Manual MSE with w0=0, w1=0: sum((0 - y_i)^2) / n
      let expectedLoss = 0
      for (const point of data) {
        const pred = params.values.w0 + params.values.w1 * point.x
        expectedLoss += (pred - point.y) ** 2
      }
      expectedLoss /= data.length

      expect(engine.computeFullLoss(params)).toBeCloseTo(expectedLoss)
    })
  })

  describe('reset', () => {
    it('restores initial parameters and step count', () => {
      const engine = createEngine()
      const initialParams = engine.getCurrentParams()

      engine.step()
      engine.step()
      engine.step()

      engine.reset()
      expect(engine.getCurrentParams().values).toEqual(initialParams.values)
      expect(engine.step().stepNumber).toBe(1) // step count reset
    })
  })

  describe('setParams', () => {
    it('overrides current parameters', () => {
      const engine = createEngine()
      engine.setParams({ values: { w0: 5, w1: 10 } })
      const params = engine.getCurrentParams()
      expect(params.values.w0).toBe(5)
      expect(params.values.w1).toBe(10)
    })
  })

  describe('setLearningRate', () => {
    it('changes update magnitude in subsequent steps', () => {
      const engine1 = createEngine(0.001)
      const engine2 = createEngine(0.1)

      const step1 = engine1.step()
      const step2 = engine2.step()

      // Larger LR → larger parameter change
      const delta1 = Math.abs(step1.paramsAfter.values.w0 - step1.paramsBefore.values.w0)
      const delta2 = Math.abs(step2.paramsAfter.values.w0 - step2.paramsBefore.values.w0)
      expect(delta2).toBeGreaterThan(delta1)
    })
  })
})
