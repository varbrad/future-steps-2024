import { procedure, router } from '..';
import { db } from '@/drizzle';
import { actionHistory, stepHistory, teams, users } from '@/drizzle/schema';
import jsonUsers from '@/data/users.json'
import jsonTeams from '@/data/teams.json'
import { calculateStepsPerDay, getStatsForUser } from '@/utils/stats';
import { desc, eq } from 'drizzle-orm';
import { mixpanel } from '@/server/mixpanel';
import { TRPCError } from '@trpc/server';
import { JSDOM } from 'jsdom'

const updateAction = (action: string, runTimeMs: number) => {
  const lastRun = new Date()
  return db.insert(actionHistory).values({
    id: action,
    lastRun,
    runTimeMs,
  }).onConflictDoUpdate({
    target: actionHistory.id,
    set: {
      lastRun,
      runTimeMs,
    },
  })

}

const syncUsername = async (userId: number, username: string) => {
  const existingUser = await db.query.users.findFirst({ where: eq(users.id, userId) })
  if (!existingUser) return
  await db.update(users).set({ username }).where(eq(users.id, userId))
}
const syncUsernames = async () => {
  const start = performance.now()
  const promises = jsonUsers.map(u => syncUsername(u.id, u.username))
  await Promise.all(promises)
  const end = performance.now()
  await updateAction('sync.usernames', end - start)
  return true
}

const getDonation = async (username: string) => {
  const response = await fetch(`https://events.princes-trust.org.uk/fundraisers/${username}/future-steps`, { method: 'GET' })
  const text = await response.text()

  const dom = new JSDOM(text)
  const donation = dom.window.document.querySelector('.iveRaised > .money > strong')?.textContent?.replace('£', '')

  return donation !== undefined ? Number(donation) : null
}

const syncDonations = async () => {
  const start = performance.now()
  const allUsers = await db.query.users.findMany({ columns: { id: true, username: true } })

  const promises = allUsers.map(async (user) => {
    const donationPounds = user.username ? await getDonation(user.username) : null
    await db.update(users).set({ donationPounds }).where(eq(users.id, user.id))
  })

  await Promise.all(promises)

  const end = performance.now()
  await updateAction('sync.donations', end - start)
  return true
}

const syncTeam = async (team: typeof jsonTeams[0]) => {
  const existingTeam = await db.query.teams.findFirst({ where: eq(teams.id, team.id) })
  if (!existingTeam) {
    mixpanel.track('CreateTeam', { id: team.id, name: team.name })
    await db.insert(teams).values({ id: team.id, name: team.name })
    return
  } else {
    if (existingTeam.name === team.name) {
      return
    }
    mixpanel.track('UpdateTeam', { id: team.id, name: team.name })
    await db.update(teams).set({ name: team.name }).where(eq(teams.id, team.id))
  }
}

const updateUser = async (user: typeof jsonUsers[0]) => {
  const existingUser = await db.query.users.findFirst({ where: eq(users.id, user.id), with: { history: true } })
  if (!existingUser) {
    mixpanel.track('CreateUser', { id: user.id, name: user.firstName + ' ' + user.lastName })
    const stats = await getStatsForUser({ id: user.id })
    await db.insert(users).values({ id: user.id, firstName: user.firstName, lastName: user.lastName, teamId: user.teamId, steps: stats.total })
    if (stats.x.length > 0) {
      await db.insert(stepHistory).values(stats.x.map((x, ix) => ({
        x: x,
        steps: stats.steps[ix],
        userId: user.id,
      })))
    }
    return
  } else {
    const stats = await getStatsForUser({ id: user.id })
    if (stats.total !== existingUser.steps) {
      mixpanel.track('UpdateUser', { id: user.id, name: user.firstName + ' ' + user.lastName, total: stats.total })
      await db.update(users).set({ steps: stats.total }).where(eq(users.id, user.id))
    }

    await db.delete(stepHistory).where(eq(stepHistory.userId, user.id))
    mixpanel.track('UpdateStepHistory', { id: user.id, name: user.firstName + ' ' + user.lastName, x: stats.x, steps: stats.steps })
    if (stats.x.length > 0) {
      await db.insert(stepHistory).values(stats.x.map((x, ix) => ({
        x: x,
        steps: stats.steps[ix],
        userId: user.id,
      })))
    }
  }
}

const syncData = async () => {
  mixpanel.track('tRPC', { procedure: 'sync', type: 'mutation' })

  const start = performance.now()

  // Try and create any missing teams, or update if already existing
  const teamPromises = jsonTeams.map(syncTeam)
  await Promise.all(teamPromises)

  // Try and create any missing users, or update if already existing
  const userPromises = jsonUsers.map(updateUser)
  await Promise.all(userPromises)

  // Sync usernames
  // await syncUsernames()

  // // Sync donations
  // await syncDonations()

  const end = performance.now()
  mixpanel.track('SyncComplete')
  await updateAction('sync.now', end - start)

  return true
}

export const trpcRouter = router({
  teams: procedure.query(async () => {
      mixpanel.track('tRPC', { procedure: 'teams', type: 'query' })

      const ts = await db.query.teams.findMany({
        with: {
          users: true,
        }
      })
      
      return ts.map(t => ({
        id: t.id,
        name: t.name,
        totalSteps: t.users.reduce((acc, u) => acc + u.steps, 0),
        users: t.users.slice().sort((a, b) => a.firstName.localeCompare(b.firstName)),
      })).sort((a, b) => b.totalSteps - a.totalSteps)
    }
  ),

  users: procedure.query(() => {
    mixpanel.track('tRPC', { procedure: 'users', type: 'query' })

    return db.query.users.findMany({
      with: {
        team: true,
        history: true,
      },
      orderBy: desc(users.steps)
    })
  }),

  donations: procedure.query(async () => {
    mixpanel.track('tRPC', { procedure: 'donations', type: 'query' })
    const teamList = await db.query.teams.findMany({
      columns: {
        id: true,
        name: true,
      },
      with: {
        users: true,
      }
    })
    const userDonations = await db.query.users.findMany({
      with: {
        team: true,
      },
      orderBy: desc(users.donationPounds)
    })

    const teams = teamList.map(t => ({
      ...t,
      donations: userDonations.filter(u => u.teamId === t.id).reduce((acc, u) => acc + (u.donationPounds ?? 0), 0),
    })).sort((a,b) => b.donations - a.donations).filter(t => t.donations > 0)

    return { users: userDonations.filter(u => (u.donationPounds ?? 0) > 0), teams }
  }),

  dailySteps: procedure.query(async () => {
    const users = await db.query.users.findMany({
      with: {
        history: true,
        team: true,
      }
    })

    const userSteps = users.map(u => ({
      user: u,
      dailySteps: calculateStepsPerDay(
        u.history.map(h => h.x),
        u.history.map(h => h.steps),
      ),
    }))

    const allTime = userSteps.flatMap(u => {
      return u.dailySteps.map((s, ix) => ({
        day: s.day,
        steps: s.steps,
        user: u.user,
      }))
    }).sort((a, b) => b.steps - a.steps)

    const maxStepsMap = new Map<string, (typeof allTime)[number]>()
    allTime.forEach(s => {
      const existing = maxStepsMap.get(s.day)
      if (!existing || s.steps > existing.steps) {
        maxStepsMap.set(s.day, s)
      }
    })

    const perDay = Array.from(maxStepsMap.values()).sort((a, b) => a.day.localeCompare(b.day))

    return { allTime: allTime.slice(0, 10), perDay }
  }),

  actionHistories: procedure.query(() => db.query.actionHistory.findMany()),

  sync: router({
    now: procedure.mutation(syncData),
    usernames: procedure.mutation(syncUsernames),
    donations: procedure.mutation(syncDonations),
    cron: procedure.query(async ({ ctx: { isVercelCronJob, trace }}) => {
      if (!isVercelCronJob) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
        })
      }

      mixpanel.track('CronSync Begin', { trace })
      const result = await syncData()
      mixpanel.track('CronSync Complete', { trace })
      return result
    })
  })
});

// export type definition of API
export type TrpcRouter = typeof trpcRouter;