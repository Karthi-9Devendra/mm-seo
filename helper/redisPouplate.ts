import redisClient from "@/lib/redis";

export async function getCachedDataRedis<T>(key: string): Promise<T | null> {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Redis GET error:", error);
    return null;
  }
}

export async function setCachedDataRedis<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  try {
    await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (error) {
    console.error("Redis SET error:", error);
  }
}