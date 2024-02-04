import { sql } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { migrate } from "drizzle-orm/postgres-js/migrator";

const initDB = () => {
  const db = drizzle(sql);
  migrate(db, { migrationsFolder: "drizzle" });
  return db
}

export const db = initDB()
