import { serverConfig } from "./index.ts";
import { Redis } from "ioredis";
import { logger } from "./logger.config.ts";

class RedisConnection {
	private static connection: Redis | null = null;

	private constructor() {
		logger.info("Initiating Redis connection...");
	}

	public static getConnectionObject(): Redis {
		if (!this.connection) {
			this.connection = new Redis({
				port: serverConfig.REDIS_SERVER_PORT,
				host: serverConfig.REDIS_SERVER_HOST,
				maxRetriesPerRequest: null,
			});
		}

		return this.connection;
	}
}

export { RedisConnection };
