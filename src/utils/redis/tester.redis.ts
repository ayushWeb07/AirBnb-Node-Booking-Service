// 1. Test Redis connection directly
import { redis, redlock } from "../../config/redlock.config.ts";

const testRedisInitialization = async () => {
	const ping = await redis.ping();
	console.log("Redis ping:", ping); // should print PONG

	const testLock = await redlock.acquire(["lock:test"], 5000);
	console.log("Lock value in Redis:", await redis.get("lock:test")); // should print a UUID
	await testLock.release();
	console.log("After release:", await redis.get("lock:test")); // should print null
};

testRedisInitialization();
