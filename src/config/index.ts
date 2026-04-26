import "dotenv/config";

interface ServerConfig {
  PORT: number;
  BETTERSTACK_HEARTBEAT_URL: string;
  LOGTAIL_SOURCE_TOKEN: string;
  LOGTAIL_URL: string;
  SENTRY_DSN: string;
}

const serverConfig: ServerConfig = {
  PORT: Number(process.env.PORT) || 3000,
  BETTERSTACK_HEARTBEAT_URL: process.env.BETTERSTACK_HEARTBEAT_URL || "",
  LOGTAIL_SOURCE_TOKEN: process.env.LOGTAIL_SOURCE_TOKEN || "",
  LOGTAIL_URL: process.env.LOGTAIL_URL || "",
  SENTRY_DSN: process.env.SENTRY_DSN || "",
};

export { serverConfig };
