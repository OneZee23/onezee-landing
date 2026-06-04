import Redis from 'ioredis';

// Lazy Redis singleton for the likes counter.
// Likes are a non-critical enhancement: if REDIS_URL is unset or the server
// is unreachable, every helper returns a degraded result and the site keeps
// working (the like button simply hides). No request ever throws because of Redis.

let client: Redis | null | undefined;

export function getRedis(): Redis | null {
  if (client !== undefined) return client;

  const url = process.env.REDIS_URL;
  if (!url) {
    client = null;
    return client;
  }

  try {
    const redis = new Redis(url, {
      maxRetriesPerRequest: 2,
      enableOfflineQueue: false,
      connectTimeout: 1500,
      lazyConnect: false,
      // Give up reconnecting after a few tries instead of looping forever and
      // spamming logs when REDIS_URL is wrong/unreachable. Requests still
      // fail-soft (likes degrade), they just stop retrying.
      retryStrategy: (times) => (times > 5 ? null : Math.min(times * 200, 2000)),
    });
    // Swallow connection errors — likes degrade gracefully instead of crashing.
    redis.on('error', (err: Error) => {
      console.warn('[redis] connection error:', err.message);
    });
    client = redis;
  } catch (err) {
    console.warn('[redis] init failed:', (err as Error).message);
    client = null;
  }
  return client;
}
