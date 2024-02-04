import { integer, pgEnum, pgTable, serial, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

export const teams = pgTable('teams', {
  id: integer('id').primaryKey(),
  name: varchar('name', { length: 256 }),
});

export const users = pgTable('users', {
  id: integer('id').primaryKey(),
  firstName: varchar('first_name', { length: 256 }),
  lastName: varchar('last_name', { length: 256 }),
})
