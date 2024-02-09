import { describe, it, expect } from 'vitest'
import { calculateStepsPerDay } from './stats'

describe('calculateStepsPerDay', () => {
  it('should return an array of steps per day for a perfect case', () => {
    const steps = [11_185, 20_683, 32_087, 41_305, 57_265, 70_943, 81_951, 85_229]
    const x = ['2024-02-01', '2024-02-02', '2024-02-03', '2024-02-04', '2024-02-05', '2024-02-06', '2024-02-07', '2024-02-08']

    expect(calculateStepsPerDay(x, steps)).toEqual([
      { day: '2024-02-01', steps: 11_185 },
      { day: '2024-02-02', steps: 9_498 },
      { day: '2024-02-03', steps: 11_404 },
      { day: '2024-02-04', steps: 9_218 },
      { day: '2024-02-05', steps: 15_960 },
      { day: '2024-02-06', steps: 13_678 },
      { day: '2024-02-07', steps: 11_008 },
      { day: '2024-02-08', steps: 3_278 },
    ])
  })

  it('should return an empty array if x & steps are empty', () => {
    expect(calculateStepsPerDay([], [])).toEqual([])
  })

  it('should return days missing if nothing reported for days', () => {
    const steps = [1000, 3000, 5000]
    const x = ['2024-02-01', '2024-02-03', '2024-02-06']

    expect(calculateStepsPerDay(x, steps)).toEqual([
      { day: '2024-02-01', steps: 1000 },
      { day: '2024-02-03', steps: 2000 },
      { day: '2024-02-06', steps: 2000 },
    ])
  })

  it('should return diff', () => {
    const x = ['2024-02-01', '2024-02-03', '2024-02-06']
    const steps = [1000, 9000, 28_712]

    expect(calculateStepsPerDay(x, steps)).toEqual([
      { day: '2024-02-01', steps: 1000 },
      { day: '2024-02-03', steps: 8000 },
      { day: '2024-02-06', steps: 19_712 },
    ])
  })
})