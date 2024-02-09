import { User, UserStats } from "@/types"

export const calculateStepsPerDay = (x: string[], steps: number[]): { day: string, steps: number }[] => {
  const returnVal: { day: string, steps: number }[] = []

  for (let i = 0; i < x.length; ++i) {
    const day = x[i]
    const stepCount = i === 0 ? steps[i] : steps[i] - steps[i - 1]
    returnVal.push({ day, steps: stepCount })
  }

  return returnVal
}

export const getStatsForUser = async (user: Pick<User, 'id'>): Promise<UserStats> => {
  try {
    const response = await fetch(
      `https://events.princes-trust.org.uk/profile/report/fitnessactivity/${user.id}`, { method: 'GET', headers: { Accept: 'application/json' } }
    )
    
    const json = await response.json() as { steps: number[], x: string[] }

    const stats: UserStats = {
      total: json.steps[json.steps.length - 1] || 0,
      x: json.x,
      steps: json.steps,
    }
  
    return stats
  } catch (error) {
    console.error(error)
    return { total: 0, x: [], steps: [] }
  }
}