// @vitest-environment node
import {
  NEURAL_NETWORK_GRAPH,
  computeNNHighlightState,
} from '../neuralNetworkGraph'
import { GDEngine } from '@/engine/engine'
import { neuralNetwork } from '@/engine/models/neuralNetwork'
import { createVanillaSgd } from '@/engine/updateRules/vanillaSgd'
import { createMiniBatch } from '@/engine/batchStrategies/miniBatch'
import { generateXorData } from '@/engine/xorData'
import type { StepResult, DataPoint } from '@/engine/types'

function createFixture(): { stepResult: StepResult; samplePoints: DataPoint[] } {
  const data = generateXorData(5, 42)
  const engine = new GDEngine(
    neuralNetwork,
    createVanillaSgd(),
    createMiniBatch(1),
    data,
    0.5
  )
  const stepResult = engine.step()
  const samplePoints = stepResult.sampleIndices.map(i => data[i])
  return { stepResult, samplePoints }
}

describe('NEURAL_NETWORK_GRAPH definition', () => {
  it('has 5 nodes', () => {
    expect(NEURAL_NETWORK_GRAPH.nodes).toHaveLength(5)
  })

  it('has 6 edges', () => {
    expect(NEURAL_NETWORK_GRAPH.edges).toHaveLength(6)
  })

  it('all edge references point to valid node ids', () => {
    const nodeIds = new Set(NEURAL_NETWORK_GRAPH.nodes.map(n => n.id))
    for (const edge of NEURAL_NETWORK_GRAPH.edges) {
      expect(nodeIds.has(edge.from)).toBe(true)
      expect(nodeIds.has(edge.to)).toBe(true)
    }
  })
})

describe('computeNNHighlightState', () => {
  it('returns safe defaults for null stepResult', () => {
    const state = computeNNHighlightState(0, null, [])
    expect(state.activeNodes.size).toBe(0)
    expect(state.activeEdges.size).toBe(0)
    expect(state.flowDirection).toBe('none')
  })

  describe('with a real step result', () => {
    const { stepResult, samplePoints } = createFixture()

    it('subStep 0 (params): shows weight values', () => {
      const state = computeNNHighlightState(0, stepResult, samplePoints)
      expect(state.activeNodes.size).toBeGreaterThan(0)
      expect(state.flowDirection).toBe('none')
      expect(state.accentColor).toBe('#3b82f6')
    })

    it('subStep 1 (forward): all nodes active, forward flow', () => {
      const state = computeNNHighlightState(1, stepResult, samplePoints)
      expect(state.activeNodes.size).toBe(5)
      expect(state.activeEdges.size).toBe(6)
      expect(state.flowDirection).toBe('forward')
      expect(state.accentColor).toBe('#3b82f6')
    })

    it('subStep 2 (residual): red accent', () => {
      const state = computeNNHighlightState(2, stepResult, samplePoints)
      expect(state.activeNodes.size).toBe(5)
      expect(state.accentColor).toBe('#ef4444')
      expect(state.flowDirection).toBe('forward')
    })

    it('subStep 3 (gradient): backward flow, purple accent', () => {
      const state = computeNNHighlightState(3, stepResult, samplePoints)
      expect(state.activeNodes.size).toBe(5)
      expect(state.activeEdges.size).toBe(6)
      expect(state.flowDirection).toBe('backward')
      expect(state.accentColor).toBe('#8b5cf6')
    })

    it('subStep 4 (update): green accent, shows deltas', () => {
      const state = computeNNHighlightState(4, stepResult, samplePoints)
      expect(state.activeNodes.size).toBeGreaterThan(0)
      expect(state.flowDirection).toBe('none')
      expect(state.accentColor).toBe('#22c55e')
    })

    it('default case returns empty state', () => {
      const state = computeNNHighlightState(99, stepResult, samplePoints)
      expect(state.activeNodes.size).toBe(0)
      expect(state.flowDirection).toBe('none')
    })
  })
})
