import { serverConfig } from "./index.ts";
import Redis from "ioredis";
import Redlock from "redlock";

// create the redis client
const redis = new Redis(serverConfig.REDIS_SERVER_URL);

const redlock = new Redlock([redis], {
	driftFactor: 0.01,
	retryCount: 10,
	retryDelay: 200,
	retryJitter: 200,
});

export { redlock };
