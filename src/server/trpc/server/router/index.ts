import { z } from 'zod';
import { procedure, router } from '..';
import { db } from '@/drizzle';
import { stepHistory, teams, users } from '@/drizzle/schema';
import jsonUsers from '@/data/users.json'
import jsonTeams from '@/data/teams.json'
import { calculateStepsPerDay, getStatsForUser } from '@/utils/stats';
import { desc, eq } from 'drizzle-orm';
import { mixpanel } from '@/server/mixpanel';
import { isEqual } from 'lodash';
import { TRPCError } from '@trpc/server';

const syncData = async () => {
  mixpanel.track('tRPC', { procedure: 'sync', type: 'mutation' })

  // Try and create any missing teams, or update if already existing
  for (const team of jsonTeams) {
    const existingTeam = await db.query.teams.findFirst({ where: eq(teams.id, team.id) })
    if (!existingTeam) {
      mixpanel.track('CreateTeam', { id: team.id, name: team.name })
      await db.insert(teams).values({ id: team.id, name: team.name })
      continue  
    } else {
      if (existingTeam.name === team.name) {
        continue
      }
      mixpanel.track('UpdateTeam', { id: team.id, name: team.name })
      await db.update(teams).set({ name: team.name }).where(eq(teams.id, team.id))
    }
  }

  // Try and create any missing users, or update if already existing
  for (const user of jsonUsers) {
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
      continue
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

  mixpanel.track('SyncComplete')

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

  sync: router({
    now: procedure.mutation(syncData),
    cron: procedure.query(async ({ ctx: { isVercelCronJob }}) => {
      if (!isVercelCronJob) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
        })
      }

      return await syncData()
    })
  })
});

// export type definition of API
export type TrpcRouter = typeof trpcRouter;