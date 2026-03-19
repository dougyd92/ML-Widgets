// @vitest-environment node
import { GDEngine } from '../engine'
import { neuralNetwork } from '../models/neuralNetwork'
import { createVanillaSgd } from '../updateRules/vanillaSgd'
import { createMiniBatch } from '../batchStrategies/miniBatch'
import { generateXorData } from '../xorData'

function createEngine(lr = 0.5, batchSize = 4) {
  const data = generateXorData(5, 42)
  return new GDEngine(
    neuralNetwork,
    createVanillaSgd(),
    createMiniBatch(batchSize),
    data,
    lr
  )
}

describe('GDEngine with Neural Network', () => {
  it('returns a valid StepResult', () => {
    const engine = createEngine()
    const result = engine.step()

    expect(result.stepNumber).toBe(1)
    expect(result.sampleIndices.length).toBeGreaterThan(0)
    expect(typeof result.prediction).toBe('number')
    expect(typeof result.residual).toBe('number')
    expect(typeof result.lossBefore).toBe('number')
    expect(typeof result.lossAfter).toBe('number')
    expect(result.computationSteps.length).toBeGreaterThan(0)
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

  it('loss decreases over training', () => {
    const engine = createEngine()
    const firstStep = engine.step()
    let lastStep = firstStep
    for (let i = 1; i < 100; i++) {
      lastStep = engine.step()
    }
    expect(lastStep.lossAfter).toBeLessThan(firstStep.lossBefore)
  })

  it('works with single-sample SGD', () => {
    const engine = createEngine(0.5, 1)
    const result = engine.step()
    expect(result.sampleIndices).toHaveLength(1)
    expect(result.predictions).toHaveLength(1)
  })

  it('works with full-batch', () => {
    const engine = createEngine(0.5, 20)
    const result = engine.step()
    expect(result.sampleIndices).toHaveLength(20)
    expect(result.predictions).toHaveLength(20)
  })
})
