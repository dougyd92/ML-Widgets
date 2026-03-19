// @vitest-environment node
import { neuralNetwork } from '../models/neuralNetwork'
import { generateXorData } from '../xorData'
import type { Parameters } from '../types'

describe('neuralNetwork model', () => {
  const model = neuralNetwork

  describe('initialParameters', () => {
    it('has 9 parameters', () => {
      const params = model.initialParameters()
      expect(Object.keys(params.values)).toHaveLength(9)
    })

    it('matches parameterNames', () => {
      const params = model.initialParameters()
      for (const name of model.parameterNames) {
        expect(params.values[name]).toBeDefined()
      }
    })
  })

  describe('predict', () => {
    it('returns a value between 0 and 1 (sigmoid output)', () => {
      const params = model.initialParameters()
      const point = { x: 0.5, y: 0, features: [0.5, 0.5] }
      const pred = model.predict(params, point)
      expect(pred).toBeGreaterThan(0)
      expect(pred).toBeLessThan(1)
    })

    it('returns different values for different inputs', () => {
      const params = model.initialParameters()
      const p1 = model.predict(params, { x: 0, y: 0, features: [0, 0] })
      const p2 = model.predict(params, { x: 1, y: 0, features: [1, 1] })
      expect(p1).not.toBe(p2)
    })
  })

  describe('computeLoss', () => {
    it('returns 0 for perfect predictions', () => {
      const loss = model.computeLoss([0.999, 0.001], [1, 0])
      expect(loss).toBeLessThan(0.01)
    })

    it('returns high loss for bad predictions', () => {
      const loss = model.computeLoss([0.01, 0.99], [1, 0])
      expect(loss).toBeGreaterThan(2)
    })
  })

  describe('computeGradients', () => {
    it('returns gradients for all 9 parameters', () => {
      const params = model.initialParameters()
      const points = [{ x: 0, y: 1, features: [0, 1] }]
      const result = model.computeGradients(params, points)

      expect(Object.keys(result.gradients)).toHaveLength(9)
      for (const name of model.parameterNames) {
        expect(typeof result.gradients[name]).toBe('number')
        expect(Number.isFinite(result.gradients[name])).toBe(true)
      }
    })

    it('returns predictions and residuals arrays', () => {
      const params = model.initialParameters()
      const points = [
        { x: 0, y: 1, features: [0, 1] },
        { x: 1, y: 0, features: [1, 0] },
      ]
      const result = model.computeGradients(params, points)

      expect(result.predictions).toHaveLength(2)
      expect(result.residuals).toHaveLength(2)
    })

    it('analytic gradients match numerical gradients', () => {
      const params = model.initialParameters()
      const points = generateXorData(2, 42) // 8 points

      const analytic = model.computeGradients(params, points)
      const eps = 1e-5

      for (const name of model.parameterNames) {
        // Forward
        const paramsPlus: Parameters = { values: { ...params.values, [name]: params.values[name] + eps } }
        const paramsMinus: Parameters = { values: { ...params.values, [name]: params.values[name] - eps } }

        const predPlus = points.map(p => model.predict(paramsPlus, p))
        const predMinus = points.map(p => model.predict(paramsMinus, p))
        const targets = points.map(p => p.y)

        const lossPlus = model.computeLoss(predPlus, targets)
        const lossMinus = model.computeLoss(predMinus, targets)

        const numerical = (lossPlus - lossMinus) / (2 * eps)
        const analyticGrad = analytic.gradients[name]

        const relError = Math.abs(numerical - analyticGrad) / (Math.abs(numerical) + Math.abs(analyticGrad) + 1e-8)
        expect(relError).toBeLessThan(1e-4)
      }
    })
  })

  describe('training convergence', () => {
    it('loss decreases over many steps on XOR data', () => {
      const data = generateXorData(5, 42)
      let params = model.initialParameters()
      const lr = 0.5

      const initialPreds = data.map(p => model.predict(params, p))
      const initialLoss = model.computeLoss(initialPreds, data.map(p => p.y))

      for (let i = 0; i < 200; i++) {
        const result = model.computeGradients(params, data)
        const newValues = { ...params.values }
        for (const name of model.parameterNames) {
          newValues[name] -= lr * result.gradients[name]
        }
        params = { values: newValues }
      }

      const finalPreds = data.map(p => model.predict(params, p))
      const finalLoss = model.computeLoss(finalPreds, data.map(p => p.y))

      expect(finalLoss).toBeLessThan(initialLoss)
    })
  })

  describe('describeForwardPass', () => {
    it('returns steps with forward and residual phases', () => {
      const params = model.initialParameters()
      const points = [{ x: 0, y: 1, features: [0, 1] }]
      const steps = model.describeForwardPass(params, points)

      const phases = steps.map(s => s.phase)
      expect(phases).toContain('forward')
      expect(phases).toContain('residual')
    })
  })

  describe('describeGradients', () => {
    it('returns steps with gradient phase', () => {
      const params = model.initialParameters()
      const points = [{ x: 0, y: 1, features: [0, 1] }]
      const steps = model.describeGradients(params, points)

      expect(steps.length).toBeGreaterThan(0)
      for (const step of steps) {
        expect(step.phase).toBe('gradient')
      }
    })
  })

  describe('describeParams', () => {
    it('returns a step with params phase', () => {
      const params = model.initialParameters()
      const step = model.describeParams(params)
      expect(step.phase).toBe('params')
      expect(step.expression).toContain('W_h')
      expect(step.expression).toContain('W_o')
    })
  })
})
