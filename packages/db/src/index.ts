import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema';

const connectionString =
  process.env.DATABASE_URL ?? 'postgresql://formstack:formstack@localhost:5432/formstack';

/**
 * Use a singleton client so HMR (and serverless) doesn't open a new pool on
 * every reload.
 */
declare global {
  // eslint-disable-next-line no-var
  var __formstackPg: ReturnType<typeof postgres> | undefined;
}

const client = global.__formstackPg ?? postgres(connectionString, { max: 10 });
if (process.env.NODE_ENV !== 'production') global.__formstackPg = client;

export const db = drizzle(client, { schema });
export type Database = typeof db;

export * from './schema';
