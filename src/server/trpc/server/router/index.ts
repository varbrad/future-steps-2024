import { z } from 'zod';
import { procedure, router } from '..';
import { db } from '@/drizzle';
import { teams } from '@/drizzle/schema';
import jsonUsers from '@/data/users.json'
import jsonTeams from '@/data/teams.json'

export const trpcRouter = router({
  teams: procedure.query(() => {
    return db.select().from(teams)
  }),

  sync: procedure.mutation(async () => {
    const syncTeams = await db.insert(teams).values(jsonTeams.map(t => ({ id: t.id, name: t.name })))
  })
});

// export type definition of API
export type TrpcRouter = typeof trpcRouter;