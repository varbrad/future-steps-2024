import { z } from 'zod';
import { procedure, router } from '..';
import { db } from '@/drizzle';
import { teams, users } from '@/drizzle/schema';
import jsonUsers from '@/data/users.json'
import jsonTeams from '@/data/teams.json'
import { getStatsForUser } from '@/utils/stats';
import { desc, eq, sql } from 'drizzle-orm';

export const trpcRouter = router({
  teams: procedure.query(async () => db.select({
      id: teams.id,
      name: teams.name,
      totalSteps: sql<number>`SUM(${users.steps}) as totalSteps`.mapWith(Number),
    })
    .from(teams)
    .leftJoin(users, eq(teams.id, users.teamId))
    .orderBy(desc(sql`totalSteps`))
    .groupBy(teams.id)
  ),

  users: procedure.query(() => db.select().from(users).orderBy(desc(users.steps))),

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