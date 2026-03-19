// @vitest-environment node
import { linearRegression } from '../models/linearRegression'
import type { Parameters } from '../types'

describe('linearRegression model', () => {
  const model = linearRegression

  describe('predict', () => {
    it('computes w0 + w1 * x', () => {
      const params: Parameters = { values: { w0: 1, w1: 2 } }
      expect(model.predict(params, { x: 3, y: 0 })).toBe(7) // 1 + 2*3
    })

    it('returns 0 with zero params', () => {
      const params: Parameters = { values: { w0: 0, w1: 0 } }
      expect(model.predict(params, { x: 5, y: 0 })).toBe(0)
    })

    it('handles negative params', () => {
      const params: Parameters = { values: { w0: -1, w1: -0.5 } }
      expect(model.predict(params, { x: 4, y: 0 })).toBe(-3) // -1 + (-0.5)*4
    })
  })

  describe('initialParameters', () => {
    it('returns zeros for w0 and w1', () => {
      const params = model.initialParameters()
      expect(params.values.w0).toBe(0)
      expect(params.values.w1).toBe(0)
    })
  })

  describe('parameterNames', () => {
    it('is [w0, w1]', () => {
      expect(model.parameterNames).toEqual(['w0', 'w1'])
    })
  })

  describe('computeGradients', () => {
    it('computes correct gradients for a single point', () => {
      const params: Parameters = { values: { w0: 0, w1: 0 } }
      const points = [{ x: 1, y: 3 }]
      const result = model.computeGradients(params, points)

      // prediction = 0 + 0*1 = 0, residual = 0 - 3 = -3
      expect(result.prediction).toBe(0)
      expect(result.residual).toBe(-3)
      // dw0 = 2*(-3) = -6, dw1 = 2*(-3)*1 = -6
      expect(result.gradients.w0).toBe(-6)
      expect(result.gradients.w1).toBe(-6)
      // loss = (-3)^2 = 9
      expect(result.loss).toBe(9)
    })

    it('computes correct gradients with non-zero params', () => {
      const params: Parameters = { values: { w0: 1, w1: 2 } }
      const points = [{ x: 2, y: 4 }]
      const result = model.computeGradients(params, points)

      // prediction = 1 + 2*2 = 5, residual = 5 - 4 = 1
      expect(result.prediction).toBe(5)
      expect(result.residual).toBe(1)
      // dw0 = 2*1 = 2, dw1 = 2*1*2 = 4
      expect(result.gradients.w0).toBe(2)
      expect(result.gradients.w1).toBe(4)
      expect(result.loss).toBe(1)
    })
  })

  describe('describeForwardPass', () => {
    it('returns steps with forward and residual phases', () => {
      const params: Parameters = { values: { w0: 1, w1: 2 } }
      const points = [{ x: 3, y: 5 }]
      const steps = model.describeForwardPass(params, points)

      expect(steps).toHaveLength(2)
      expect(steps[0].phase).toBe('forward')
      expect(steps[1].phase).toBe('residual')
    })
  })

  describe('describeGradients', () => {
    it('returns steps with gradient phase', () => {
      const params: Parameters = { values: { w0: 1, w1: 2 } }
      const points = [{ x: 3, y: 5 }]
      const steps = model.describeGradients(params, points)

      expect(steps).toHaveLength(2)
      expect(steps[0].phase).toBe('gradient')
      expect(steps[1].phase).toBe('gradient')
    })
  })
})
