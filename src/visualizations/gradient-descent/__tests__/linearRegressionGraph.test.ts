// @vitest-environment node
import {
  LINEAR_REGRESSION_GRAPH,
  computeHighlightState,
} from '../linearRegressionGraph'
import { GDEngine } from '@/engine/engine'
import { linearRegression } from '@/engine/models/linearRegression'
import { createVanillaSgd } from '@/engine/updateRules/vanillaSgd'
import { createSingleSample } from '@/engine/batchStrategies/singleSample'
import { generateData } from '@/engine/data'
import type { StepResult, DataPoint } from '@/engine/types'

// Create a real StepResult for testing
function createFixture(): { stepResult: StepResult; samplePoint: DataPoint } {
  const data = generateData(10, 42)
  const engine = new GDEngine(
    linearRegression,
    createVanillaSgd(),
    createSingleSample(),
    data,
    0.01
  )
  const stepResult = engine.step()
  const samplePoint = data[stepResult.sampleIndices[0]]
  return { stepResult, samplePoint }
}

describe('LINEAR_REGRESSION_GRAPH definition', () => {
  it('has 5 nodes', () => {
    expect(LINEAR_REGRESSION_GRAPH.nodes).toHaveLength(5)
  })

  it('has 4 edges', () => {
    expect(LINEAR_REGRESSION_GRAPH.edges).toHaveLength(4)
  })

  it('all edge references point to valid node ids', () => {
    const nodeIds = new Set(LINEAR_REGRESSION_GRAPH.nodes.map(n => n.id))
    for (const edge of LINEAR_REGRESSION_GRAPH.edges) {
      expect(nodeIds.has(edge.from)).toBe(true)
      expect(nodeIds.has(edge.to)).toBe(true)
    }
  })

  it('contains expected node ids', () => {
    const ids = LINEAR_REGRESSION_GRAPH.nodes.map(n => n.id)
    expect(ids).toContain('input-bias')
    expect(ids).toContain('input-x1')
    expect(ids).toContain('w0')
    expect(ids).toContain('w1')
    expect(ids).toContain('sum')
  })
})

describe('computeHighlightState', () => {
  it('returns safe defaults for null stepResult', () => {
    const state = computeHighlightState(0, null, null)
    expect(state.activeNodes.size).toBe(0)
    expect(state.activeEdges.size).toBe(0)
    expect(state.nodeValues.w0).toBe('0.000')
    expect(state.nodeValues.w1).toBe('0.000')
    expect(state.flowDirection).toBe('none')
  })

  describe('with a real step result', () => {
    const { stepResult, samplePoint } = createFixture()

    it('subStep 0 (params): highlights only w0, w1 with blue accent', () => {
      const state = computeHighlightState(0, stepResult, samplePoint)
      expect(state.activeNodes).toEqual(new Set(['w0', 'w1']))
      expect(state.activeEdges.size).toBe(0)
      expect(state.flowDirection).toBe('none')
      expect(state.accentColor).toBe('#3b82f6')
      expect(state.nodeValues.w0).toBeDefined()
      expect(state.nodeValues.w1).toBeDefined()
    })

    it('subStep 1 (forward): all nodes/edges active, forward flow, blue accent', () => {
      const state = computeHighlightState(1, stepResult, samplePoint)
      expect(state.activeNodes.size).toBe(5)
      expect(state.activeEdges.size).toBe(4)
      expect(state.flowDirection).toBe('forward')
      expect(state.accentColor).toBe('#3b82f6')
      expect(state.nodeValues.sum).toContain('ŷ')
      expect(state.nodeValues['input-bias']).toBe('1')
    })

    it('subStep 2 (residual): red accent, shows residual in sum', () => {
      const state = computeHighlightState(2, stepResult, samplePoint)
      expect(state.activeNodes.size).toBe(5)
      expect(state.accentColor).toBe('#ef4444')
      expect(state.nodeValues.sum).toContain('residual')
      expect(state.flowDirection).toBe('forward')
    })

    it('subStep 3 (gradient): backward flow, purple accent, edge gradient labels', () => {
      const state = computeHighlightState(3, stepResult, samplePoint)
      expect(state.activeNodes.size).toBe(5)
      expect(state.activeEdges.size).toBe(4)
      expect(state.flowDirection).toBe('backward')
      expect(state.accentColor).toBe('#8b5cf6')
      expect(state.edgeValues['w0-to-sum']).toContain('∂L/∂w₀')
      expect(state.edgeValues['w1-to-sum']).toContain('∂L/∂w₁')
    })

    it('subStep 4 (update): only w0/w1, green accent, shows deltas', () => {
      const state = computeHighlightState(4, stepResult, samplePoint)
      expect(state.activeNodes).toEqual(new Set(['w0', 'w1']))
      expect(state.activeEdges.size).toBe(0)
      expect(state.flowDirection).toBe('none')
      expect(state.accentColor).toBe('#22c55e')
      expect(state.nodeDeltas.w0).toBeDefined()
      expect(state.nodeDeltas.w1).toBeDefined()
      expect(typeof state.nodeDeltas.w0.value).toBe('number')
      expect(state.nodeDeltas.w0.label).toMatch(/^[+-]/)
    })

    it('default case (subStep > 4): returns empty state', () => {
      const state = computeHighlightState(99, stepResult, samplePoint)
      expect(state.activeNodes.size).toBe(0)
      expect(state.activeEdges.size).toBe(0)
      expect(state.flowDirection).toBe('none')
    })
  })
})
