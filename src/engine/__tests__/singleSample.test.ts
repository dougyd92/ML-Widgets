// @vitest-environment node
import { createSingleSample } from '../batchStrategies/singleSample'
import { generateData } from '../data'

describe('singleSample batch strategy', () => {
  const data = generateData(10, 42)

  function freshStrategy() {
    const strategy = createSingleSample()
    strategy.init(data)
    return strategy
  }

  it('returns a single point per batch', () => {
    const strategy = freshStrategy()
    const batch = strategy.nextBatch()
    expect(batch.points).toHaveLength(1)
    expect(batch.indices).toHaveLength(1)
  })

  it('starts at epoch 0', () => {
    const strategy = freshStrategy()
    expect(strategy.currentEpoch()).toBe(0)
  })

  it('completes an epoch after n samples', () => {
    const strategy = freshStrategy()
    for (let i = 0; i < 9; i++) {
      strategy.nextBatch()
      expect(strategy.epochComplete()).toBe(false)
    }
    strategy.nextBatch() // 10th call
    expect(strategy.epochComplete()).toBe(true)
  })

  it('increments epoch counter after completing an epoch', () => {
    const strategy = freshStrategy()
    for (let i = 0; i < 10; i++) {
      strategy.nextBatch()
    }
    expect(strategy.currentEpoch()).toBe(1)
  })

  it('visits all indices exactly once per epoch', () => {
    const strategy = freshStrategy()
    const indices = new Set<number>()
    for (let i = 0; i < 10; i++) {
      const batch = strategy.nextBatch()
      indices.add(batch.indices[0])
    }
    expect(indices.size).toBe(10)
    for (let i = 0; i < 10; i++) {
      expect(indices.has(i)).toBe(true)
    }
  })

  it('produces deterministic order from init', () => {
    const s1 = freshStrategy()
    const s2 = freshStrategy()
    const order1 = Array.from({ length: 10 }, () => s1.nextBatch().indices[0])
    const order2 = Array.from({ length: 10 }, () => s2.nextBatch().indices[0])
    expect(order1).toEqual(order2)
  })

  it('shuffles differently across epochs', () => {
    const strategy = freshStrategy()
    const epoch0 = Array.from({ length: 10 }, () => strategy.nextBatch().indices[0])
    const epoch1 = Array.from({ length: 10 }, () => strategy.nextBatch().indices[0])
    // Same set of indices but (very likely) different order
    expect(new Set(epoch0)).toEqual(new Set(epoch1))
    expect(epoch0).not.toEqual(epoch1)
  })

  it('reset restores initial state', () => {
    const strategy = freshStrategy()
    const firstOrder = Array.from({ length: 5 }, () => strategy.nextBatch().indices[0])

    strategy.reset()
    expect(strategy.currentEpoch()).toBe(0)
    const afterReset = Array.from({ length: 5 }, () => strategy.nextBatch().indices[0])
    expect(afterReset).toEqual(firstOrder)
  })

  it('clone returns an independent instance', () => {
    const s1 = freshStrategy()
    const s2 = s1.clone()
    s2.init(data)

    // Advancing s1 does not affect s2
    s1.nextBatch()
    s1.nextBatch()
    const s2Batch = s2.nextBatch()
    expect(s2Batch.indices).toHaveLength(1)
    expect(s2.currentEpoch()).toBe(0)
  })
})
