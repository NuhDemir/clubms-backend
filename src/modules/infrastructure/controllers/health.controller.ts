import { Request, Response } from 'express';
import { IHealthService } from '../interfaces/IHealthService';

export class HealthController {
    constructor(private readonly healthService: IHealthService) { }

    async basicHealth(_req: Request, res: Response): Promise<void> {
        const result = await this.healthService.checkBasicHealth();
        res.status(200).json(result);
    }

    async detailedHealth(_req: Request, res: Response): Promise<void> {
        const result = await this.healthService.checkDetailedHealth();
        const statusCode = result.status === 'UP' ? 200 : 503;
        res.status(statusCode).json(result);
    }

    async databaseHealth(_req: Request, res: Response): Promise<void> {
        const result = await this.healthService.checkDatabaseHealth();
        const statusCode = result.status === 'UP' ? 200 : 503;
        res.status(statusCode).json(result);
    }

    async redisHealth(_req: Request, res: Response): Promise<void> {
        const result = await this.healthService.checkRedisHealth();
        const statusCode = result.status === 'UP' ? 200 : 503;
        res.status(statusCode).json(result);
    }

    async databaseTables(_req: Request, res: Response): Promise<void> {
        try {
            const tables = await this.healthService.getDatabaseTables();
            res.status(200).json({
                status: 'UP',
                message: 'Database tables retrieved successfully',
                count: tables.length,
                tables,
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

    async redisKeys(req: Request, res: Response): Promise<void> {
        try {
            const pattern = req.query.pattern as string || '*';
            const limit = parseInt(req.query.limit as string) || 100;

            const keys = await this.healthService.getRedisKeys(pattern, limit);

            res.status(200).json({
                status: 'UP',
                message: 'Redis keys retrieved successfully',
                pattern,
                totalKeys: keys.length,
                returnedKeys: keys.length,
                keys,
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
