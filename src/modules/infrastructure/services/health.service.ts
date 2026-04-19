import { redis } from '../../../shared/redis/redis.client';
import {
    IHealthService,
    IHealthCheck,
    IDetailedHealthCheck,
    IDatabaseInfo,
    IRedisInfo
} from '../interfaces/IHealthService';

/**
 * Health Service
 * 
 * SOLID Principles:
 * - Single Responsibility: Sadece health check logic'inden sorumlu
 * - Open/Closed: Yeni health check'ler eklenebilir, mevcut kod değişmez
 * - Dependency Inversion: Interface'e bağımlı, concrete Prisma'ya değil
 */

export class HealthService implements IHealthService {
    constructor(private readonly prisma: any) { }

    async checkBasicHealth(): Promise<IHealthCheck> {
        return {
            status: 'UP',
            message: 'ClubMS API is running',
            timestamp: new Date().toISOString()
        };
    }

    async checkDetailedHealth(): Promise<IDetailedHealthCheck> {
        const [databaseCheck, redisCheck] = await Promise.allSettled([
            this.checkDatabaseConnection(),
            this.checkRedisConnection()
        ]);

        const checks = {
            api: {
                status: 'UP' as const,
                message: 'API server is running',
                timestamp: new Date().toISOString()
            },
            database: databaseCheck.status === 'fulfilled'
                ? databaseCheck.value
                : { status: 'DOWN' as const, message: 'Database check failed', responseTime: 0, timestamp: new Date().toISOString() },
            redis: redisCheck.status === 'fulfilled'
                ? redisCheck.value
                : { status: 'DOWN' as const, message: 'Redis check failed', responseTime: 0, timestamp: new Date().toISOString() }
        };

        const allUp = checks.database.status === 'UP' && checks.redis.status === 'UP';
        const overallStatus = allUp ? 'UP' : 'DEGRADED';

        return {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            checks
        };
    }

    async checkDatabaseHealth(): Promise<IHealthCheck & { details?: IDatabaseInfo }> {
        try {
            const start = Date.now();
            await this.prisma.$queryRaw`SELECT 1 as test`;

            const result: any = await this.prisma.$queryRaw`
                SELECT 
                    current_database() as database,
                    current_user as user,
                    version() as version,
                    pg_database_size(current_database()) as size_bytes
            `;

            const end = Date.now();
            const info = result[0];

            return {
                status: 'UP',
                message: 'Database connection successful',
                responseTime: end - start,
                timestamp: new Date().toISOString(),
                details: {
                    database: info.database,
                    user: info.user,
                    version: info.version.split(',')[0],
                    sizeBytes: parseInt(info.size_bytes),
                    sizeMB: (parseInt(info.size_bytes) / 1024 / 1024).toFixed(2)
                }
            };
        } catch (error: any) {
            return {
                status: 'DOWN',
                message: error.message || 'Database connection failed',
                timestamp: new Date().toISOString()
            };
        }
    }

    async checkRedisHealth(): Promise<IHealthCheck & { details?: IRedisInfo }> {
        try {
            const start = Date.now();
            const pingResult = await redis.ping();
            const info = await redis.info();
            const infoLines = info.split('\r\n');

            const redisInfo: any = {};
            infoLines.forEach(line => {
                if (line.includes(':')) {
                    const [key, value] = line.split(':');
                    if (['redis_version', 'used_memory_human', 'connected_clients', 'uptime_in_days'].includes(key)) {
                        redisInfo[key] = value;
                    }
                }
            });

            const testKey = 'health_check_test';
            const testValue = Date.now().toString();
            await redis.set(testKey, testValue, 'EX', 10);
            const getValue = await redis.get(testKey);

            const end = Date.now();

            return {
                status: 'UP',
                message: 'Redis connection successful',
                responseTime: end - start,
                timestamp: new Date().toISOString(),
                details: {
                    ping: pingResult,
                    version: redisInfo.redis_version,
                    memoryUsed: redisInfo.used_memory_human,
                    connectedClients: redisInfo.connected_clients,
                    uptimeDays: redisInfo.uptime_in_days,
                    readWriteTest: getValue === testValue ? 'PASS' : 'FAIL'
                }
            };
        } catch (error: any) {
            return {
                status: 'DOWN',
                message: error.message || 'Redis connection failed',
                timestamp: new Date().toISOString()
            };
        }
    }

    async getDatabaseTables(): Promise<{ name: string; size: string }[]> {
        const tables: any = await this.prisma.$queryRaw`
            SELECT 
                table_name,
                pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as size
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY pg_total_relation_size(quote_ident(table_name)) DESC
        `;

        return tables.map((t: any) => ({
            name: t.table_name,
            size: t.size
        }));
    }

    async getRedisKeys(pattern: string = '*', limit: number = 100): Promise<any[]> {
        const keys = await redis.keys(pattern);
        const limitedKeys = keys.slice(0, limit);

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

        return keysWithInfo;
    }

    // Private helper methods
    private async checkDatabaseConnection(): Promise<IHealthCheck> {
        try {
            const start = Date.now();
            await this.prisma.$queryRaw`SELECT 1`;
            const end = Date.now();

            return {
                status: 'UP',
                message: 'Database connection successful',
                responseTime: end - start,
                timestamp: new Date().toISOString()
            };
        } catch (error: any) {
            return {
                status: 'DOWN',
                message: error.message || 'Database connection failed',
                responseTime: 0,
                timestamp: new Date().toISOString()
            };
        }
    }

    private async checkRedisConnection(): Promise<IHealthCheck> {
        try {
            const start = Date.now();
            await redis.ping();
            const end = Date.now();

            return {
                status: 'UP',
                message: 'Redis connection successful',
                responseTime: end - start,
                timestamp: new Date().toISOString()
            };
        } catch (error: any) {
            return {
                status: 'DOWN',
                message: error.message || 'Redis connection failed',
                responseTime: 0,
                timestamp: new Date().toISOString()
            };
        }
    }
}
