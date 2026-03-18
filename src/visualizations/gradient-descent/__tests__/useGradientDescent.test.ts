import { renderHook, act } from '@testing-library/react'
import { useGradientDescent } from '../hooks/useGradientDescent'
import type { GDConfig } from '@/engine/types'

const defaultConfig: GDConfig = {
  learningRate: 0.01,
  totalEpochs: 12,
  autoPlaySpeed: 1,
}

function renderGD(config: GDConfig = defaultConfig) {
  return renderHook(({ config }) => useGradientDescent(config), {
    initialProps: { config },
  })
}

describe('useGradientDescent', () => {
  describe('initial state', () => {
    it('starts with stepNumber 0 and subStep 0', () => {
      const { result } = renderGD()
      expect(result.current.stepNumber).toBe(0)
      expect(result.current.subStep).toBe(0)
    })

    it('has no current step', () => {
      const { result } = renderGD()
      expect(result.current.currentStep).toBeNull()
    })

    it('currentParams has w0=0 and w1=0', () => {
      const { result } = renderGD()
      expect(result.current.currentParams.values.w0).toBe(0)
      expect(result.current.currentParams.values.w1).toBe(0)
    })

    it('canGoBack is false, canGoForward is true', () => {
      const { result } = renderGD()
      expect(result.current.canGoBack).toBe(false)
      expect(result.current.canGoForward).toBe(true)
    })

    it('visibleComputationSteps is empty', () => {
      const { result } = renderGD()
      expect(result.current.visibleComputationSteps).toEqual([])
    })

    it('lossHistory is empty', () => {
      const { result } = renderGD()
      expect(result.current.lossHistory).toEqual([])
    })
  })

  describe('next() navigation', () => {
    it('first next() moves to step 1, subStep 0', () => {
      const { result } = renderGD()
      act(() => result.current.next())

      expect(result.current.stepNumber).toBe(1)
      expect(result.current.subStep).toBe(0)
      expect(result.current.currentStep).not.toBeNull()
    })

    it('advances subStep 0→1→2→3→4 within a step', () => {
      const { result } = renderGD()
      act(() => result.current.next()) // → step 1, subStep 0

      for (let expected = 1; expected <= 4; expected++) {
        act(() => result.current.next())
        expect(result.current.subStep).toBe(expected)
        expect(result.current.stepNumber).toBe(1) // still on step 1
      }
    })

    it('after subStep 4, next() advances to next step at subStep 0', () => {
      const { result } = renderGD()
      // Go to step 1, subStep 4
      act(() => result.current.next()) // step 1, sub 0
      for (let i = 0; i < 4; i++) act(() => result.current.next()) // sub 1→4

      expect(result.current.subStep).toBe(4)
      expect(result.current.stepNumber).toBe(1)

      act(() => result.current.next()) // → step 2, sub 0
      expect(result.current.stepNumber).toBe(2)
      expect(result.current.subStep).toBe(0)
    })
  })

  describe('prev() navigation', () => {
    it('prev() from initial state is a no-op', () => {
      const { result } = renderGD()
      act(() => result.current.prev())
      expect(result.current.stepNumber).toBe(0)
      expect(result.current.subStep).toBe(0)
    })

    it('decrements subStep within a step', () => {
      const { result } = renderGD()
      act(() => result.current.next()) // step 1, sub 0
      act(() => result.current.next()) // sub 1
      act(() => result.current.next()) // sub 2

      act(() => result.current.prev()) // sub 1
      expect(result.current.subStep).toBe(1)
      expect(result.current.stepNumber).toBe(1)
    })

    it('from subStep 0, goes to previous step at subStep 4', () => {
      const { result } = renderGD()
      // Advance to step 2, sub 0
      act(() => result.current.next()) // step 1, sub 0
      for (let i = 0; i < 4; i++) act(() => result.current.next()) // sub 1→4
      act(() => result.current.next()) // step 2, sub 0

      expect(result.current.stepNumber).toBe(2)
      expect(result.current.subStep).toBe(0)

      act(() => result.current.prev()) // → step 1, sub 4
      expect(result.current.stepNumber).toBe(1)
      expect(result.current.subStep).toBe(4)
    })
  })

  describe('computed values', () => {
    it('visibleComputationSteps grows with subStep', () => {
      const { result } = renderGD()
      act(() => result.current.next()) // step 1, sub 0

      const countAt0 = result.current.visibleComputationSteps.length
      expect(countAt0).toBeGreaterThan(0) // at least 'params' phase

      act(() => result.current.next()) // sub 1
      expect(result.current.visibleComputationSteps.length).toBeGreaterThan(countAt0)
    })

    it('showResidualLine is true only at subSteps 2 and 3', () => {
      const { result } = renderGD()
      act(() => result.current.next()) // step 1, sub 0

      expect(result.current.showResidualLine).toBe(false) // sub 0
      act(() => result.current.next()) // sub 1
      expect(result.current.showResidualLine).toBe(false)
      act(() => result.current.next()) // sub 2
      expect(result.current.showResidualLine).toBe(true)
      act(() => result.current.next()) // sub 3
      expect(result.current.showResidualLine).toBe(true)
      act(() => result.current.next()) // sub 4
      expect(result.current.showResidualLine).toBe(false)
    })

    it('currentParams shows paramsBefore for subSteps 0-3, paramsAfter for subStep 4', () => {
      const { result } = renderGD()
      act(() => result.current.next()) // step 1, sub 0

      const step = result.current.currentStep!
      // subSteps 0-3 → paramsBefore
      expect(result.current.currentParams.values).toEqual(step.paramsBefore.values)

      // Advance to subStep 4
      for (let i = 0; i < 4; i++) act(() => result.current.next())
      expect(result.current.subStep).toBe(4)
      expect(result.current.currentParams.values).toEqual(step.paramsAfter.values)
    })

    it('currentLoss shows lossBefore for subSteps 0-3, lossAfter for subStep 4', () => {
      const { result } = renderGD()
      act(() => result.current.next()) // step 1, sub 0

      const step = result.current.currentStep!
      expect(result.current.currentLoss).toBe(step.lossBefore)

      for (let i = 0; i < 4; i++) act(() => result.current.next())
      expect(result.current.currentLoss).toBe(step.lossAfter)
    })

    it('lossHistory grows with completed steps', () => {
      const { result } = renderGD()
      expect(result.current.lossHistory).toHaveLength(0)

      act(() => result.current.next()) // step 1
      expect(result.current.lossHistory).toHaveLength(1)

      // Complete step 1 and go to step 2
      for (let i = 0; i < 4; i++) act(() => result.current.next())
      act(() => result.current.next()) // step 2
      expect(result.current.lossHistory).toHaveLength(2)

      // Complete step 2 and go to step 3
      for (let i = 0; i < 4; i++) act(() => result.current.next())
      act(() => result.current.next()) // step 3
      expect(result.current.lossHistory).toHaveLength(3)
    })
  })

  describe('setLearningRate', () => {
    it('truncates forward history', () => {
      const { result } = renderGD()

      // Advance 3 full steps
      for (let step = 0; step < 3; step++) {
        act(() => result.current.next()) // new step
        for (let i = 0; i < 4; i++) act(() => result.current.next()) // sub 1→4
      }
      expect(result.current.lossHistory).toHaveLength(3)

      // Go back to step 1
      act(() => result.current.prev()) // step 3 sub 3
      for (let i = 0; i < 4; i++) act(() => result.current.prev())
      // Now at step 2, sub 4
      for (let i = 0; i < 5; i++) act(() => result.current.prev())
      // Now at step 1, sub 4

      act(() => result.current.setLearningRate(0.05))

      // Forward history after step 1 should be truncated
      // lossHistory should only contain step 1
      expect(result.current.lossHistory).toHaveLength(1)
    })
  })

  describe('reset', () => {
    it('returns to initial state', () => {
      const { result } = renderGD()

      // Advance a few steps
      act(() => result.current.next())
      act(() => result.current.next())
      act(() => result.current.next())

      act(() => result.current.reset())

      expect(result.current.stepNumber).toBe(0)
      expect(result.current.subStep).toBe(0)
      expect(result.current.currentStep).toBeNull()
      expect(result.current.canGoBack).toBe(false)
      expect(result.current.lossHistory).toEqual([])
    })
  })

  describe('boundary conditions', () => {
    it('canGoForward becomes false at the last step, last subStep', () => {
      const { result } = renderGD()
      const totalSteps = result.current.totalSteps // 120

      // Fast-forward to the last step
      for (let step = 0; step < totalSteps; step++) {
        act(() => result.current.next()) // advances to new step at sub 0
        if (step < totalSteps - 1) {
          // Skip sub-steps for speed (go directly to next step)
          for (let i = 0; i < 4; i++) act(() => result.current.next())
        }
      }

      // Now at last step, sub 0 — should still be able to go forward through sub-steps
      expect(result.current.stepNumber).toBe(totalSteps)
      expect(result.current.canGoForward).toBe(true)

      // Advance through remaining sub-steps
      for (let i = 0; i < 4; i++) act(() => result.current.next())
      expect(result.current.subStep).toBe(4)
      expect(result.current.canGoForward).toBe(false)
    })
  })
})
