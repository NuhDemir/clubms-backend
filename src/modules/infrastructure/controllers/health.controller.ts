import { Request, Response } from 'express';
import { redis } from '@shared/redis/redis.client';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Health Check Controller
 * 
 * Sistem bileşenlerinin sağlık durumunu kontrol eder:
 * - API Server
 * - PostgreSQL Database
 * - Redis Cache
 */

export class HealthController {
    /**
     * Basit health check
     * GET /health
     */
    async basicHealth(req: Request, res: Response): Promise<void> {
        res.status(200).json({
            status: 'UP',
            message: 'ClubMS API is running',
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Detaylı health check
     * GET /health/detailed
     */
    async detailedHealth(req: Request, res: Response): Promise<void> {
        const checks = {
            api: { status: 'UP', message: 'API server is running' },
            database: { status: 'UNKNOWN', message: '', responseTime: 0 },
            redis: { status: 'UNKNOWN', message: '', responseTime: 0 }
        };

        // Database check
        try {
            const dbStart = Date.now();
            await prisma.$queryRaw`SELECT 1`;
            const dbEnd = Date.now();

            checks.database = {
                status: 'UP',
                message: 'Database connection successful',
                responseTime: dbEnd - dbStart
            };
        } catch (error: any) {
            checks.database = {
                status: 'DOWN',
                message: error.message || 'Database connection failed',
                responseTime: 0
            };
        }

        // Redis check
        try {
            const redisStart = Date.now();
            await redis.ping();
            const redisEnd = Date.now();

            checks.redis = {
                status: 'UP',
                message: 'Redis connection successful',
                responseTime: redisEnd - redisStart
            };
        } catch (error: any) {
            checks.redis = {
                status: 'DOWN',
                message: error.message || 'Redis connection failed',
                responseTime: 0
            };
        }

        // Overall status
        const allUp = checks.database.status === 'UP' && checks.redis.status === 'UP';
        const overallStatus = allUp ? 'UP' : 'DEGRADED';

        res.status(allUp ? 200 : 503).json({
            status: overallStatus,
            timestamp: new Date().toISOString(),
            checks
        });
    }

    /**
     * Database health check
     * GET /health/database
     */
    async databaseHealth(req: Request, res: Response): Promise<void> {
        try {
            const start = Date.now();

            // Test query
            await prisma.$queryRaw`SELECT 1 as test`;

            // Get database info
            const result = await prisma.$queryRaw<any[]>`
                SELECT 
                    current_database() as database,
                    current_user as user,
                    version() as version,
                    pg_database_size(current_database()) as size_bytes
            `;

            const end = Date.now();
            const info = result[0];

            res.status(200).json({
                status: 'UP',
                message: 'Database connection successful',
                responseTime: end - start,
                details: {
                    database: info.database,
                    user: info.user,
                    version: info.version.split(',')[0], // Sadece PostgreSQL versiyonu
                    sizeBytes: parseInt(info.size_bytes),
                    sizeMB: (parseInt(info.size_bytes) / 1024 / 1024).toFixed(2)
                },
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            res.status(503).json({
                status: 'DOWN',
                message: 'Database connection failed',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Redis health check
     * GET /health/redis
     */
    async redisHealth(req: Request, res: Response): Promise<void> {
        try {
            const start = Date.now();

            // Ping test
            const pingResult = await redis.ping();

            // Get Redis info
            const info = await redis.info();
            const infoLines = info.split('\r\n');

            // Parse relevant info
            const redisInfo: any = {};
            infoLines.forEach(line => {
                if (line.includes(':')) {
                    const [key, value] = line.split(':');
                    if (['redis_version', 'used_memory_human', 'connected_clients', 'uptime_in_days'].includes(key)) {
                        redisInfo[key] = value;
                    }
                }
            });

            // Test set/get
            const testKey = 'health_check_test';
            const testValue = Date.now().toString();
            await redis.set(testKey, testValue, 'EX', 10);
            const getValue = await redis.get(testKey);

            const end = Date.now();

            res.status(200).json({
                status: 'UP',
                message: 'Redis connection successful',
                responseTime: end - start,
                details: {
                    ping: pingResult,
                    version: redisInfo.redis_version,
                    memoryUsed: redisInfo.used_memory_human,
                    connectedClients: redisInfo.connected_clients,
                    uptimeDays: redisInfo.uptime_in_days,
                    readWriteTest: getValue === testValue ? 'PASS' : 'FAIL'
                },
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            res.status(503).json({
                status: 'DOWN',
                message: 'Redis connection failed',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Database tables check
     * GET /health/database/tables
     */
    async databaseTables(req: Request, res: Response): Promise<void> {
        try {
            const tables = await prisma.$queryRaw<any[]>`
                SELECT 
                    table_name,
                    pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as size
                FROM information_schema.tables
                WHERE table_schema = 'public'
                ORDER BY pg_total_relation_size(quote_ident(table_name)) DESC
            `;

            res.status(200).json({
                status: 'UP',
                message: 'Database tables retrieved successfully',
                count: tables.length,
                tables: tables.map(t => ({
                    name: t.table_name,
                    size: t.size
                })),
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            res.status(503).json({
                status: 'DOWN',
                message: 'Failed to retrieve database tables',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Redis keys check
     * GET /health/redis/keys
     */
    async redisKeys(req: Request, res: Response): Promise<void> {
        try {
            const pattern = req.query.pattern as string || '*';
            const limit = parseInt(req.query.limit as string) || 100;

            // Get keys matching pattern
            const keys = await redis.keys(pattern);
            const limitedKeys = keys.slice(0, limit);

            // Get memory usage for each key
            const keysWithInfo = await Promise.all(
                limitedKeys.map(async (key) => {
                    const type = await redis.type(key);
                    const ttl = await redis.ttl(key);
                    const memory = await redis.memory('USAGE', key);

                    return {
                        key,
                        type,
                        ttl: ttl === -1 ? 'no expiry' : `${ttl}s`,
                        memoryBytes: memory
                    };
                })
            );

            res.status(200).json({
                status: 'UP',
                message: 'Redis keys retrieved successfully',
                pattern,
                totalKeys: keys.length,
                returnedKeys: limitedKeys.length,
                keys: keysWithInfo,
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            res.status(503).json({
                status: 'DOWN',
                message: 'Failed to retrieve Redis keys',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
}
