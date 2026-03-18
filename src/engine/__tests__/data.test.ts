// @vitest-environment node
import { generateData } from '../data'

describe('generateData', () => {
  it('returns 10 points by default', () => {
    const data = generateData()
    expect(data).toHaveLength(10)
  })

  it('returns requested number of points', () => {
    expect(generateData(5, 42)).toHaveLength(5)
    expect(generateData(20, 42)).toHaveLength(20)
  })

  it('spreads x from 0.5 to 4.5', () => {
    const data = generateData()
    expect(data[0].x).toBeCloseTo(0.5, 1)
    expect(data[data.length - 1].x).toBeCloseTo(4.5, 1)
  })

  it('generates y approximately following y = 2x + 1', () => {
    const data = generateData()
    for (const point of data) {
      const expected = 2 * point.x + 1
      expect(Math.abs(point.y - expected)).toBeLessThanOrEqual(0.76) // noise ±0.75 + rounding
    }
  })

  it('is deterministic with the same seed', () => {
    const data1 = generateData(10, 42)
    const data2 = generateData(10, 42)
    expect(data1).toEqual(data2)
  })

  it('produces different data with different seeds', () => {
    const data1 = generateData(10, 42)
    const data2 = generateData(10, 99)
    const ys1 = data1.map(p => p.y)
    const ys2 = data2.map(p => p.y)
    expect(ys1).not.toEqual(ys2)
  })

  it('returns DataPoint objects with x and y', () => {
    const data = generateData()
    for (const point of data) {
      expect(point).toHaveProperty('x')
      expect(point).toHaveProperty('y')
      expect(typeof point.x).toBe('number')
      expect(typeof point.y).toBe('number')
    }
  })
})
