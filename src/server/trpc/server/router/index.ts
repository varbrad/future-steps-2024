import { z } from 'zod';
import { procedure, router } from '..';
import { db } from '@/drizzle';
import { teams, users } from '@/drizzle/schema';
import jsonUsers from '@/data/users.json'
import jsonTeams from '@/data/teams.json'
import { getStatsForUser } from '@/utils/stats';
import { eq } from 'drizzle-orm';

export const trpcRouter = router({
  teams: procedure.query(() => {
    return db.select().from(teams)
  }),

  users: procedure.query(() => {
    return db.select().from(users)
  }),

  sync: procedure.mutation(async () => {
    await db.insert(teams).values(jsonTeams.map(t => ({ id: t.id, name: t.name }))).onConflictDoNothing()
    await db.insert(users).values(jsonUsers.map(u => ({ id: u.id, firstName: u.firstName, lastName: u.lastName }))).onConflictDoNothing().returning()

    for (const u of jsonUsers) {
      const stats = await getStatsForUser(u)
      console.log(u, stats)
      await db.update(users).set({ steps: stats.total }).where(eq(users.id, u.id))
    }

    return true
  })
});

// export type definition of API
export type TrpcRouter = typeof trpcRouter;