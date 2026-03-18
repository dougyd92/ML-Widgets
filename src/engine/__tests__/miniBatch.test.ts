// @vitest-environment node
import { createMiniBatch } from '../batchStrategies/miniBatch'
import { generateData } from '../data'

const data = generateData(10, 42)

describe('createMiniBatch', () => {
  describe('batch size 1 (SGD)', () => {
    it('returns 1 point per batch', () => {
      const strategy = createMiniBatch(1)
      strategy.init(data)

      const batch = strategy.nextBatch()
      expect(batch.points).toHaveLength(1)
      expect(batch.indices).toHaveLength(1)
    })

    it('takes 10 steps to complete an epoch', () => {
      const strategy = createMiniBatch(1)
      strategy.init(data)

      for (let i = 0; i < 9; i++) {
        strategy.nextBatch()
        expect(strategy.epochComplete()).toBe(false)
      }
      strategy.nextBatch()
      expect(strategy.epochComplete()).toBe(true)
    })

    it('visits all 10 indices in one epoch', () => {
      const strategy = createMiniBatch(1)
      strategy.init(data)

      const visited = new Set<number>()
      for (let i = 0; i < 10; i++) {
        const { indices } = strategy.nextBatch()
        visited.add(indices[0])
      }
      expect(visited.size).toBe(10)
    })
  })

  describe('batch size 4', () => {
    it('returns 4 points for first two batches, 2 for the last', () => {
      const strategy = createMiniBatch(4)
      strategy.init(data)

      const b1 = strategy.nextBatch()
      expect(b1.points).toHaveLength(4)
      expect(b1.indices).toHaveLength(4)

      const b2 = strategy.nextBatch()
      expect(b2.points).toHaveLength(4)
      expect(b2.indices).toHaveLength(4)

      const b3 = strategy.nextBatch()
      expect(b3.points).toHaveLength(2)
      expect(b3.indices).toHaveLength(2)
    })

    it('takes 3 steps to complete an epoch', () => {
      const strategy = createMiniBatch(4)
      strategy.init(data)

      strategy.nextBatch()
      expect(strategy.epochComplete()).toBe(false)
      strategy.nextBatch()
      expect(strategy.epochComplete()).toBe(false)
      strategy.nextBatch()
      expect(strategy.epochComplete()).toBe(true)
    })

    it('visits all 10 indices in one epoch', () => {
      const strategy = createMiniBatch(4)
      strategy.init(data)

      const visited = new Set<number>()
      for (let i = 0; i < 3; i++) {
        const { indices } = strategy.nextBatch()
        for (const idx of indices) visited.add(idx)
      }
      expect(visited.size).toBe(10)
    })
  })

  describe('batch size 10 (full batch)', () => {
    it('returns all 10 points in one batch', () => {
      const strategy = createMiniBatch(10)
      strategy.init(data)

      const batch = strategy.nextBatch()
      expect(batch.points).toHaveLength(10)
      expect(batch.indices).toHaveLength(10)
    })

    it('completes epoch in 1 step', () => {
      const strategy = createMiniBatch(10)
      strategy.init(data)

      strategy.nextBatch()
      expect(strategy.epochComplete()).toBe(true)
    })
  })

  describe('epoch counting', () => {
    it('increments epoch after each full pass (batch size 4)', () => {
      const strategy = createMiniBatch(4)
      strategy.init(data)

      expect(strategy.currentEpoch()).toBe(0)

      // Epoch 0: 3 batches
      for (let i = 0; i < 3; i++) strategy.nextBatch()
      expect(strategy.currentEpoch()).toBe(1)

      // Epoch 1: 3 batches
      for (let i = 0; i < 3; i++) strategy.nextBatch()
      expect(strategy.currentEpoch()).toBe(2)
    })
  })

  describe('reset', () => {
    it('restores initial state', () => {
      const strategy = createMiniBatch(4)
      strategy.init(data)

      // Advance through some batches
      for (let i = 0; i < 5; i++) strategy.nextBatch()
      expect(strategy.currentEpoch()).toBeGreaterThan(0)

      strategy.reset()
      expect(strategy.currentEpoch()).toBe(0)
      expect(strategy.epochComplete()).toBe(false)
    })

    it('produces same sequence after reset (deterministic)', () => {
      const strategy = createMiniBatch(4)
      strategy.init(data)

      const firstRun: number[][] = []
      for (let i = 0; i < 3; i++) {
        firstRun.push(strategy.nextBatch().indices)
      }

      strategy.reset()

      for (let i = 0; i < 3; i++) {
        const { indices } = strategy.nextBatch()
        expect(indices).toEqual(firstRun[i])
      }
    })
  })

  describe('name', () => {
    it('is "Single Sample (SGD)" for batch size 1', () => {
      expect(createMiniBatch(1).name).toBe('Single Sample (SGD)')
    })

    it('includes batch size for larger batches', () => {
      expect(createMiniBatch(4).name).toBe('Mini-Batch (4)')
    })
  })
})
