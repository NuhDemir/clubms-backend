import Redis from 'ioredis';

/**
 * Redis Client Singleton
 * 
 * Supports two configuration methods:
 * 1. REDIS_URL (e.g., redis://:password@host:port)
 * 2. Separate REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
 * 
 * Render uses separate variables, local dev can use either.
 */

class RedisClient {
    private static instance: Redis | null = null;

    static getInstance(): Redis {
        if (!RedisClient.instance) {
            // Priority 1: Use REDIS_URL if available (local development)
            if (process.env.REDIS_URL) {
                console.log('📡 Connecting to Redis using REDIS_URL...');
                RedisClient.instance = new Redis(process.env.REDIS_URL, {
                    maxRetriesPerRequest: null, // BullMQ için gerekli
                    enableReadyCheck: false,
                    retryStrategy: (times: number) => {
                        const delay = Math.min(times * 50, 2000);
                        return delay;
                    }
                });
            }
            // Priority 2: Use separate host/port/password (Render production)
            else {
                const host = process.env.REDIS_HOST || 'localhost';
                const port = parseInt(process.env.REDIS_PORT || '6379', 10);
                const password = process.env.REDIS_PASSWORD || undefined;

                console.log(`📡 Connecting to Redis at ${host}:${port}...`);

                RedisClient.instance = new Redis({
                    host,
                    port,
                    password,
                    maxRetriesPerRequest: null, // BullMQ için gerekli
                    enableReadyCheck: false,
                    retryStrategy: (times: number) => {
                        const delay = Math.min(times * 50, 2000);
                        return delay;
                    }
                });
            }

            RedisClient.instance.on('connect', () => {
                console.log('✅ Redis connected successfully');
            });

            RedisClient.instance.on('ready', () => {
                console.log('✅ Redis ready to accept commands');
            });

            RedisClient.instance.on('error', (err) => {
                console.error('❌ Redis connection error:', err.message);
            });

            RedisClient.instance.on('close', () => {
                console.log('⚠️  Redis connection closed');
            });

            RedisClient.instance.on('reconnecting', () => {
                console.log('🔄 Redis reconnecting...');
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
            console.log('✅ Redis disconnected gracefully');
        }
    }

    static async getInfo(): Promise<{ host: string; port: number; status: string }> {
        const instance = RedisClient.getInstance();
        const status = instance.status;

        return {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
            status
        };
    }
}

export const redis = RedisClient.getInstance();
export const redisClient = RedisClient;

