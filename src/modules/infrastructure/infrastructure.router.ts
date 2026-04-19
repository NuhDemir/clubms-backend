import { Router } from 'express';
import { prisma } from '../../shared/prisma/prisma.client';
import { HealthController } from './controllers/health.controller';
import { HealthService } from './services/health.service';

const router = Router();


// Dependency Injection
const healthService = new HealthService(prisma);
const healthController = new HealthController(healthService);

// Routes
router.get('/health', (req, res) => healthController.basicHealth(req, res));
router.get('/health/detailed', (req, res) => healthController.detailedHealth(req, res));
router.get('/health/database', (req, res) => healthController.databaseHealth(req, res));
router.get('/health/database/tables', (req, res) => healthController.databaseTables(req, res));
router.get('/health/redis', (req, res) => healthController.redisHealth(req, res));
router.get('/health/redis/keys', (req, res) => healthController.redisKeys(req, res));

export { router as InfrastructureRouter };
