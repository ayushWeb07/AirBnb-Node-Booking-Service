import Redlock from "redlock";
import { RedisConnection } from "./redis.config.ts";

const redlock = new Redlock([RedisConnection.getConnectionObject()], {
	driftFactor: 0.01,
	retryCount: 10,
	retryDelay: 200,
	retryJitter: 200,
});

export { redlock };
