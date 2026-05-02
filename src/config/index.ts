import "dotenv/config";

interface ServerConfig {
	PORT: number;
	BETTERSTACK_HEARTBEAT_URL: string;
	LOGTAIL_SOURCE_TOKEN: string;
	LOGTAIL_URL: string;
	SENTRY_DSN: string;
	REDIS_SERVER_URL: string;
	REDIS_LOCK_TTL: number;
}

interface DbConfig {
	DATABASE_URL: string;
}

const serverConfig: ServerConfig = {
	PORT: Number(process.env.PORT) || 3000,
	BETTERSTACK_HEARTBEAT_URL: process.env.BETTERSTACK_HEARTBEAT_URL || "",
	LOGTAIL_SOURCE_TOKEN: process.env.LOGTAIL_SOURCE_TOKEN || "",
	LOGTAIL_URL: process.env.LOGTAIL_URL || "",
	SENTRY_DSN: process.env.SENTRY_DSN || "",
	REDIS_SERVER_URL: process.env.REDIS_SERVER_URL || "redis://localhost:6379",
	REDIS_LOCK_TTL: Number(process.env.REDIS_LOCK_TTL) || 1000,
};

const dbConfig: DbConfig = {
	DATABASE_URL: process.env.DATABASE_URL || "",
};

export { serverConfig, dbConfig };
