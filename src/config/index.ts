import "dotenv/config";

interface ServerConfig {
	PORT: number;
	BETTERSTACK_HEARTBEAT_URL: string;
	LOGTAIL_SOURCE_TOKEN: string;
	LOGTAIL_URL: string;
	SENTRY_DSN: string;
	REDIS_SERVER_HOST: string;
	REDIS_SERVER_PORT: number;
	REDIS_LOCK_TTL: number;
	BULLMQ_MAILER_QUEUE_NAME: string;
	BULLMQ_MAILER_PAYLOAD_NAME: string;
	BULLMQ_MAILER_ADD_EMAIL_ATTEMPTS: number;
	BULLMQ_MAILER_ADD_EMAIL_DELAY: number;
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
	REDIS_SERVER_HOST: process.env.REDIS_SERVER_HOST || "localhost",
	REDIS_SERVER_PORT: Number(process.env.REDIS_SERVER_PORT) || 6379,
	REDIS_LOCK_TTL: Number(process.env.REDIS_LOCK_TTL) || 1000,
	BULLMQ_MAILER_QUEUE_NAME:
		process.env.BULLMQ_MAILER_QUEUE_NAME || "queue-mailer",
	BULLMQ_MAILER_PAYLOAD_NAME:
		process.env.BULLMQ_MAILER_PAYLOAD_NAME || "payload-mailer",
	BULLMQ_MAILER_ADD_EMAIL_ATTEMPTS:
		Number(process.env.BULLMQ_MAILER_ADD_EMAIL_ATTEMPTS) || 3,
	BULLMQ_MAILER_ADD_EMAIL_DELAY:
		Number(process.env.BULLMQ_MAILER_ADD_EMAIL_DELAY) || 1000,
};

const dbConfig: DbConfig = {
	DATABASE_URL: process.env.DATABASE_URL || "",
};

export { serverConfig, dbConfig };
