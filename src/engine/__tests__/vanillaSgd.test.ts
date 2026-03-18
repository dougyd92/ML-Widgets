// @vitest-environment node
import { createVanillaSgd } from '../updateRules/vanillaSgd'
import type { Parameters } from '../types'

describe('vanillaSgd', () => {
  it('applies w - lr * grad correctly', () => {
    const sgd = createVanillaSgd()
    sgd.init(['w0', 'w1'])

    const params: Parameters = { values: { w0: 1, w1: 2 } }
    const gradients = { w0: 0.5, w1: -1 }
    const result = sgd.update(params, gradients, 0.1)

    expect(result.values.w0).toBeCloseTo(0.95) // 1 - 0.1*0.5
    expect(result.values.w1).toBeCloseTo(2.1)  // 2 - 0.1*(-1)
  })

  it('does not mutate input params', () => {
    const sgd = createVanillaSgd()
    sgd.init(['w0', 'w1'])

    const params: Parameters = { values: { w0: 1, w1: 2 } }
    sgd.update(params, { w0: 0.5, w1: -1 }, 0.1)

    expect(params.values.w0).toBe(1)
    expect(params.values.w1).toBe(2)
  })

  it('returns same values with zero learning rate', () => {
    const sgd = createVanillaSgd()
    sgd.init(['w0', 'w1'])

    const params: Parameters = { values: { w0: 1, w1: 2 } }
    const result = sgd.update(params, { w0: 10, w1: -5 }, 0)

    expect(result.values.w0).toBe(1)
    expect(result.values.w1).toBe(2)
  })

  it('describeUpdate returns update phase steps', () => {
    const sgd = createVanillaSgd()
    sgd.init(['w0', 'w1'])

    const params: Parameters = { values: { w0: 1, w1: 2 } }
    const steps = sgd.describeUpdate(params, { w0: 0.5, w1: -1 }, 0.1)

    expect(steps).toHaveLength(2)
    for (const step of steps) {
      expect(step.phase).toBe('update')
    }
  })

  it('clone returns an independent instance', () => {
    const sgd1 = createVanillaSgd()
    const sgd2 = sgd1.clone()

    expect(sgd2.name).toBe(sgd1.name)
    // They are independent objects
    expect(sgd2).not.toBe(sgd1)
  })
})
