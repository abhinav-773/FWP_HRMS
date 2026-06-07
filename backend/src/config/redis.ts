import Redis from 'ioredis';
import { env } from './env';

let redisClient: Redis | null = null;

if (env.REDIS_URL) {
  redisClient = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  redisClient.on('error', (err) => {
    console.error('❌ Redis Client Error:', err);
  });

  redisClient.on('connect', () => {
    console.log('✅ Connected to Redis successfully');
  });
} else {
  console.warn('⚠️ REDIS_URL not provided, caching will be disabled.');
}

export default redisClient;
