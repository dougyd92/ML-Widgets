// @vitest-environment node
import { generateXorData } from '../xorData'

describe('generateXorData', () => {
  it('generates 4 * pointsPerCluster points', () => {
    expect(generateXorData(5)).toHaveLength(20)
    expect(generateXorData(3)).toHaveLength(12)
  })

  it('all points have features array of length 2', () => {
    const data = generateXorData(5, 42)
    for (const p of data) {
      expect(p.features).toBeDefined()
      expect(p.features).toHaveLength(2)
    }
  })

  it('labels are 0 or 1 only', () => {
    const data = generateXorData(5, 42)
    for (const p of data) {
      expect(p.y === 0 || p.y === 1).toBe(true)
    }
  })

  it('has both classes', () => {
    const data = generateXorData(5, 42)
    const labels = new Set(data.map(p => p.y))
    expect(labels.has(0)).toBe(true)
    expect(labels.has(1)).toBe(true)
  })

  it('is deterministic with same seed', () => {
    const a = generateXorData(5, 42)
    const b = generateXorData(5, 42)
    expect(a).toEqual(b)
  })

  it('produces different data with different seeds', () => {
    const a = generateXorData(5, 42)
    const b = generateXorData(5, 99)
    expect(a).not.toEqual(b)
  })
})
