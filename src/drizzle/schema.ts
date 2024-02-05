import { relations } from 'drizzle-orm';
import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';

export const teams = pgTable('teams', {
  id: integer('id').primaryKey(),
  name: varchar('name', { length: 256 }),
});

export const teamRelations = relations(teams, ({ many }) => ({
  users: many(users),
}));

export const users = pgTable('users', {
  id: integer('id').primaryKey(),
  firstName: varchar('first_name', { length: 256 }).notNull(),
  lastName: varchar('last_name', { length: 256 }).notNull(),

  steps: integer('steps').notNull().default(0),

  teamId: integer('team_id').references(() => teams.id),
})

export const userRelations = relations(users, ({ one }) => ({
  team: one(teams, { fields: [users.teamId], references: [teams.id] }),
}))