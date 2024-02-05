import { sql } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import * as schema from './schema';

const initDB = () => drizzle(sql, { schema });

export const db = initDB()
