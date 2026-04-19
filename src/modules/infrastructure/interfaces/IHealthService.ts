/**
 * Health Service Interface
 * 
 * SOLID Principles:
 * - Interface Segregation: Her servis kendi interface'ini tanımlar
 * - Dependency Inversion: Concrete class'lara değil interface'lere bağımlılık
 */

export interface IHealthCheck {
    status: 'UP' | 'DOWN' | 'DEGRADED' | 'UNKNOWN';
    message: string;
    responseTime?: number;
    timestamp: string;
}

export interface IDetailedHealthCheck {
    status: 'UP' | 'DOWN' | 'DEGRADED';
    timestamp: string;
    checks: {
        api: IHealthCheck;
        database: IHealthCheck;
        redis: IHealthCheck;
    };
}

export interface IDatabaseInfo {
    database: string;
    user: string;
    version: string;
    sizeBytes: number;
    sizeMB: string;
}

export interface IRedisInfo {
    ping: string;
    version: string;
    memoryUsed: string;
    connectedClients: string;
    uptimeDays: string;
    readWriteTest: 'PASS' | 'FAIL';
}

export interface IHealthService {
    checkBasicHealth(): Promise<IHealthCheck>;
    checkDetailedHealth(): Promise<IDetailedHealthCheck>;
    checkDatabaseHealth(): Promise<IHealthCheck & { details?: IDatabaseInfo }>;
    checkRedisHealth(): Promise<IHealthCheck & { details?: IRedisInfo }>;
    getDatabaseTables(): Promise<{ name: string; size: string }[]>;
    getRedisKeys(pattern: string, limit: number): Promise<any[]>;
}
