import { sql } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { migrate } from "drizzle-orm/postgres-js/migrator";

const performMigration = async () => {
  const db = drizzle(sql);
  await migrate(db, { migrationsFolder: "drizzle" });
  return db
}

performMigration()
