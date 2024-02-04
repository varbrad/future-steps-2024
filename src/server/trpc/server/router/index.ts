import { z } from 'zod';
import { procedure, router } from '..';
import { db } from '@/drizzle';
import { teams, users } from '@/drizzle/schema';
import jsonUsers from '@/data/users.json'
import jsonTeams from '@/data/teams.json'

export const trpcRouter = router({
  teams: procedure.query(() => {
    return db.select().from(teams)
  }),

  users: procedure.query(() => {
    return db.select().from(users)
  }),

  sync: procedure.mutation(async () => {
    const syncTeams = await db.insert(teams).values(jsonTeams.map(t => ({ id: t.id, name: t.name }))).onConflictDoNothing()
    const syncUsers = await db.insert(users).values(jsonUsers.map(u => ({ id: u.id, firstName: u.firstName, lastName: u.lastName }))).onConflictDoNothing()
  })
});

// export type definition of API
export type TrpcRouter = typeof trpcRouter;