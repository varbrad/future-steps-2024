import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_DATABASE_TOKEN

if (!url || !authToken) {
  throw new Error('TURSO_DATABASE_URL and TURSO_DATABASE_TOKEN must be set')
}

const initDB = () => {
  const client = createClient({ url, authToken })
  return drizzle(client, { schema })
}

export const db = initDB()
