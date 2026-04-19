import Redis from 'ioredis';

class RedisClient {
    private static instance: Redis | null = null;

    static getInstance(): Redis {
        if (!RedisClient.instance) {
            const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

            RedisClient.instance = new Redis(redisUrl, {
                maxRetriesPerRequest: null, // BullMQ için gerekli
                enableReadyCheck: false,
                retryStrategy: (times: number) => {
                    const delay = Math.min(times * 50, 2000);
                    return delay;
                }
            });

            RedisClient.instance.on('connect', () => {
                console.log('✅ Redis connected');
            });

            RedisClient.instance.on('error', (err) => {
                console.error('❌ Redis error:', err);
            });
        }

        return RedisClient.instance;
    }

    static async ping(): Promise<string> {
        const instance = RedisClient.getInstance();
        return await instance.ping();
    }

    static async disconnect(): Promise<void> {
        if (RedisClient.instance) {
            await RedisClient.instance.quit();
            RedisClient.instance = null;
            console.log('✅ Redis disconnected');
        }
    }
}

export const redis = RedisClient.getInstance();
export const redisClient = RedisClient;
