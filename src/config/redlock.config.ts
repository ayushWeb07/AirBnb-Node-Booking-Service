import { serverConfig } from "./index.ts";
import Redis from "ioredis";
import Redlock from "redlock";

// create the redis client
const redis = new Redis({
	port: serverConfig.REDIS_SERVER_PORT,
	host: serverConfig.REDIS_SERVER_HOST,
});

const redlock = new Redlock([redis], {
	driftFactor: 0.01,
	retryCount: 10,
	retryDelay: 200,
	retryJitter: 200,
});

export { redis, redlock };
