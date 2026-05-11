import { Queue } from "bullmq";
import { RedisConnection } from "../config/redis.config.ts";
import { serverConfig } from "../config/index.ts";

const mailerQueue = new Queue(serverConfig.BULLMQ_MAILER_QUEUE_NAME, {
	connection: RedisConnection.getConnectionObject(),
});

export { mailerQueue };
