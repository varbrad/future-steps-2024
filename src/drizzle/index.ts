import { sql } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';

const initDB = () => drizzle(sql);

export const db = initDB()
