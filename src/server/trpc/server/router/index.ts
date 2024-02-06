import { z } from 'zod';
import { procedure, router } from '..';
import { db } from '@/drizzle';
import { teams, users } from '@/drizzle/schema';
import jsonUsers from '@/data/users.json'
import jsonTeams from '@/data/teams.json'
import { getStatsForUser } from '@/utils/stats';
import { desc, eq } from 'drizzle-orm';
import { mixpanel } from '@/server/mixpanel';

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
        team: true
      },
      orderBy: desc(users.steps)
    })
  }),

  sync: procedure.mutation(async () => {
    mixpanel.track('tRPC', { procedure: 'sync', type: 'mutation' })

    mixpanel.track('Sync - Delete Data')
    await db.delete(users)
    await db.delete(teams)
    mixpanel.track('Sync - Delete Data Complete')

    mixpanel.track('Sync - Insert Teams & Users')
    await db.insert(teams).values(jsonTeams.map(t => ({ id: t.id, name: t.name })))
    await db.insert(users).values(jsonUsers.map(u => ({ id: u.id, firstName: u.firstName, lastName: u.lastName, teamId: u.teamId })))
    mixpanel.track('Sync - Insert Teams & Users Complete')

    for (const u of jsonUsers) {
      const stats = await getStatsForUser(u)
      mixpanel.track('Sync - Update User', { id: u.id, name: u.firstName + ' ' + u.lastName, steps: stats.total })
      await db.update(users).set({ steps: stats.total }).where(eq(users.id, u.id))
    }

    return true
  })
});

// export type definition of API
export type TrpcRouter = typeof trpcRouter;