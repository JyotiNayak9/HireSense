import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 5,
  retryStrategy(times) {
    if (times > 5) return null;
    return Math.min(times * 500, 3000);
  },
  tls: REDIS_URL.startsWith('rediss://') ? {} : undefined,
  lazyConnect: true,
});

redis.on('connect', () => console.log('[REDIS] Connected'));
redis.on('error', (err) => {
  console.error('[REDIS_ERROR]', err);
});

async function connectWithRetry(maxAttempts = 3): Promise<void> {
  for (let i = 1; i <= maxAttempts; i++) {
    try {
      await redis.connect();
      console.log('[REDIS] Connection established');
      return;
    } catch (err) {
      console.error(`[REDIS] Connection attempt ${i}/${maxAttempts} failed:`, err);
      if (i === maxAttempts) throw err;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

connectWithRetry().catch((err) => {
  console.error('[REDIS] All connection attempts exhausted:', err.message);
});

export default redis;
