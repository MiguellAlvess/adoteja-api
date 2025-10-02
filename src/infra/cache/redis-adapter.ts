import { createClient, type RedisClientType } from "redis"
import { Cache } from "../../application/ports/cache/cache.js"

export class RedisCacheAdapter implements Cache {
  private client: RedisClientType

  constructor(redisUrl: string) {
    this.client = createClient({ url: redisUrl })
    this.client.connect().catch((error) => {
      console.error("Redis connection error:", error)
    })
  }

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.client.get(key)
    if (!raw) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      return raw as unknown as T
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const json = JSON.stringify(value)
    if (ttlSeconds && ttlSeconds > 0) {
      await this.client.set(key, json, { EX: ttlSeconds })
    } else {
      await this.client.set(key, json)
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key)
  }
}
