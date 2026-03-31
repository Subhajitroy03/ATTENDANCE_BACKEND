import { drizzle } from 'drizzle-orm/node-postgres/driver';
import * as schema from "./schema.js";
import dotenv from 'dotenv';
dotenv.config();
import { Pool } from 'pg';
import { logger } from '../config/logger.js';
export { eq, and, ne } from "drizzle-orm";

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
}

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false
});

pool.on("error", (err:Error) => {
    logger.error(`Unexpected PG pool error: ${err.message}`);
});

export const db = drizzle(pool, { schema });