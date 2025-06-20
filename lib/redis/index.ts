import { Redis } from "@upstash/redis"

// Initialize Upstash Redis client
export const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

// Redis key prefixes for organization
export const REDIS_KEYS = {
  SESSION: "session:",
  RATE_LIMIT: "rate_limit:",
  USER_CACHE: "user:",
} as const
