import { relations, sql } from 'drizzle-orm';
import { integer, sqliteTable, text, primaryKey } from 'drizzle-orm/sqlite-core';

export const teams = sqliteTable('teams', {
  id: integer('id').primaryKey(),
  name: text('name', { length: 256 }),
});

export const teamRelations = relations(teams, ({ many }) => ({
  users: many(users),
}));

export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  username: text('username', { length: 256 }).unique(),
  firstName: text('first_name', { length: 256 }).notNull(),
  lastName: text('last_name', { length: 256 }).notNull(),

  steps: integer('steps').notNull().default(0),
  donationPounds: integer('donationPounds'),

  teamId: integer('team_id').references(() => teams.id),
})

export const userRelations = relations(users, ({ one, many }) => ({
  team: one(teams, { fields: [users.teamId], references: [teams.id] }),
  history: many(stepHistory),
}))

export const stepHistory = sqliteTable('step_histories', {
  x: text('x', { length: 256 }).notNull(),
  steps: integer('steps').notNull(),

  userId: integer('user_id').notNull().references(() => users.id),
}, (t) => ({
  primaryKey: primaryKey({ columns: [t.x, t.userId] }),
}))

export const stepHistoryRelations = relations(stepHistory, ({ one }) => ({
  user: one(users, { fields: [stepHistory.userId], references: [users.id] }),
}))

export const actionHistory = sqliteTable('action_histories', {
  id: text('id', { length: 256 }).primaryKey(),
  lastRun: integer('last_run', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  runTimeMs: integer('run_time_ms'),
})