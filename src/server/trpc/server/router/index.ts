import { z } from 'zod';
import { procedure, router } from '..';
import { db } from '@/drizzle';
import { teams, users } from '@/drizzle/schema';
import jsonUsers from '@/data/users.json'
import jsonTeams from '@/data/teams.json'
import { getStatsForUser } from '@/utils/stats';
import { desc, eq, sql } from 'drizzle-orm';

export const trpcRouter = router({
  // teams: procedure.query(async () => db.select({
  //     id: teams.id,
  //     name: teams.name,
  //     totalSteps: sql<number>`COALESCE(SUM(${users.steps}), 0) as totalSteps`.mapWith(v => Number(v || 0)),
  //   })
  //   .from(teams)
  //   .leftJoin(users, eq(teams.id, users.teamId))
  //   .orderBy(desc(sql`totalSteps`))
  //   .groupBy(teams.id)
  // ),
  teams: procedure.query(async () => {
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

  users: procedure.query(() => db.query.users.findMany({
    with: {
      team: true
    },
    orderBy: desc(users.steps)
  })),

  sync: procedure.mutation(async () => {
    await db.delete(users)
    await db.delete(teams)

    await db.insert(teams).values(jsonTeams.map(t => ({ id: t.id, name: t.name })))
    await db.insert(users).values(jsonUsers.map(u => ({ id: u.id, firstName: u.firstName, lastName: u.lastName, teamId: u.teamId })))

    for (const u of jsonUsers) {
      const stats = await getStatsForUser(u)
      await db.update(users).set({ steps: stats.total }).where(eq(users.id, u.id))
    }

    return true
  })
});

// export type definition of API
export type TrpcRouter = typeof trpcRouter;