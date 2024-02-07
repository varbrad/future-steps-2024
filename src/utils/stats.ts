import { User, UserStats } from "@/types"

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