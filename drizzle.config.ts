import { defineConfig } from 'drizzle-kit';
import { dbConfig } from "./src/config/index.ts";

export default defineConfig({
    out: './src/db/migrations',
    schema: './src/db/schemas',
    dialect: 'mysql',
    dbCredentials: {
        url: dbConfig.DATABASE_URL,
    },
});
