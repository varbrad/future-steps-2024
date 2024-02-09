import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from '@/drizzle';

const performMigration = async () => {
  await migrate(db, { migrationsFolder: 'drizzle' })
}

performMigration()
