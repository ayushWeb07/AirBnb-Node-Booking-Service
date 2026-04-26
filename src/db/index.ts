import { drizzle } from "drizzle-orm/mysql2";
import { dbConfig } from "../config/index.ts";

const db = drizzle(dbConfig.DATABASE_URL);

export { db };