import { Redis } from "ioredis";

let redisClient: Redis | null = null;
let redisPubClient: Redis | null = null;
let redisSubClient: Redis | null = null;

export async function createRedisClient(): Promise<Redis> {
	if (redisClient) {
		return redisClient;
	}

	const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
	
	redisClient = new Redis(redisUrl);

	redisClient.on("error", (err: Error) => {
		console.error("Redis Client Error:", err);
	});

	redisClient.on("connect", () => {
		console.log("Redis Client Connected");
	});

	redisClient.on("disconnect", () => {
		console.log("Redis Client Disconnected");
	});
	
	return redisClient;
}

export async function createRedisPubSubClients(): Promise<{ pub: Redis; sub: Redis }> {
	if (redisPubClient && redisSubClient) {
		return { pub: redisPubClient, sub: redisSubClient };
	}

	const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
	
	redisPubClient = new Redis(redisUrl);
	redisSubClient = new Redis(redisUrl);

	return { pub: redisPubClient, sub: redisSubClient };
}

export async function getRedisClient(): Promise<Redis> {
	if (!redisClient) {
		return await createRedisClient();
	}
	return redisClient;
}

export async function closeRedisClients(): Promise<void> {
	const clients = [redisClient, redisPubClient, redisSubClient].filter(Boolean);
	await Promise.all(clients.map(client => client?.quit()));
	redisClient = null;
	redisPubClient = null;
	redisSubClient = null;
}
