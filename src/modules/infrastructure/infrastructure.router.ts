import { Router } from 'express';
import { HealthController } from './controllers/health.controller';

const router = Router();
const healthController = new HealthController();

/**
 * Health Check Routes
 * 
 * Sistem bileşenlerinin sağlık durumunu kontrol eder
 */

// Basic health check
router.get('/health', (req, res) => healthController.basicHealth(req, res));

// Detailed health check (all components)
router.get('/health/detailed', (req, res) => healthController.detailedHealth(req, res));

// Database health check
router.get('/health/database', (req, res) => healthController.databaseHealth(req, res));

// Database tables info
router.get('/health/database/tables', (req, res) => healthController.databaseTables(req, res));

// Redis health check
router.get('/health/redis', (req, res) => healthController.redisHealth(req, res));

// Redis keys info
router.get('/health/redis/keys', (req, res) => healthController.redisKeys(req, res));

export { router as InfrastructureRouter };
