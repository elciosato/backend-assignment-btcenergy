import { createClient, type RedisClientType } from "redis";

async function getRedisClient(
  redisClient: RedisClientType
): Promise<RedisClientType> {
  if (!redisClient || !redisClient.isReady) {
    redisClient = createClient();
    redisClient.on("error", (err) => console.error("Redis Client Error", err));
    redisClient.on("connect", () => console.log("Redis connected"));
    redisClient.on("ready", () => {
      console.log("Redis ready!");
    });

    await redisClient.connect();
  }
  return redisClient;
}

export { getRedisClient };
