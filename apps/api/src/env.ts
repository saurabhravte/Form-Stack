// Load environment variables BEFORE any other module is evaluated.
// This file must be the FIRST import in index.ts. ESM hoists imports,
// so dotenv config calls placed inline in index.ts run AFTER controllers

import { config } from 'dotenv';
import path from 'node:path';

// Monorepo root .env (apps/api/src -> ../../../.env)
config({ path: path.resolve(__dirname, '../../../.env') });
// Fallback: .env in the current working directory (e.g. apps/api/.env)
config();