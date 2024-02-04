import users from './src/data/users.json'
import teams from './src/data/teams.json'
import { User, UserStats } from "@/types";

export const getStatsForUser = async (user: User): Promise<UserStats> => {
  try {
    const response = await fetch(
      `https://events.princes-trust.org.uk/profile/report/fitnessactivity/${user.id}`, { method: 'GET', headers: { Accept: 'application/json' } }
    )
    
    const json = await response.json() as { steps: number[], x: string[] }
  
    const stats: UserStats = {
      total: json.steps[json.steps.length - 1] || 0,
    }
  
    return stats
  } catch (error) {
    console.error(error)
    return { total: 0 }
  }
}

const main = async () => {
  const stats = await Promise.all(users.map(async u => {
    return {
      user: u,
      stats: await getStatsForUser(u),
    }
  }))

  const teamStats = teams.map(t => {
    return {
      team: t,
      stats: stats.filter(s => s.user.teamId === t.id).reduce((acc, s) => acc + s.stats.total, 0)
    }
  })

  stats.sort((a,b) => b.stats.total - a.stats.total)

  const maxUserName = stats.reduce((acc, s) => s.user.firstName.length + s.user.lastName.length + 1 > acc ? s.user.firstName.length + s.user.lastName.length + 1 : acc, 0)
  stats.forEach(s => console.log(`${s.user.firstName} ${s.user.lastName}`.padStart(maxUserName, ' ') + ' - ' + s.stats.total.toLocaleString('en-GB')))
  console.log('\n')
  const maxTeamName = teamStats.reduce((acc, s) => s.team.name.length > acc ? s.team.name.length : acc, 0)
  teamStats.forEach(s => console.log(s.team.name.padStart(maxTeamName, ' ') + ' - ' + s.stats.toLocaleString('en-GB')))
}

main()
