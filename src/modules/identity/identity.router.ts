import { Router } from 'express';
import { login, register, getMe } from './controllers/auth.controller';
import { getAllUsers, getUserById, suspendUser } from './controllers/user.controller';
import { assignGlobalRole, getGlobalRole } from './controllers/role.controller';
import { authMiddleware } from '../../core/middleware/auth.middleware';
import { loadGlobalRole } from '../../core/middleware/loadGlobalRole.middleware';
import { requireGlobalRole } from '../../core/middleware/rbac.middleware';

const router = Router();

// Auth routes
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', authMiddleware, getMe);

// User routes - authMiddleware + loadGlobalRole + requireGlobalRole
router.get('/users', authMiddleware, loadGlobalRole, requireGlobalRole('SUPER_ADMIN'), getAllUsers);
router.get('/users/:id', authMiddleware, getUserById);
router.patch('/users/:id/suspend', authMiddleware, loadGlobalRole, requireGlobalRole('SUPER_ADMIN'), suspendUser);

// Role routes
router.post('/roles/global', authMiddleware, loadGlobalRole, requireGlobalRole('SUPER_ADMIN'), assignGlobalRole);
router.get('/roles/global/:userId', authMiddleware, loadGlobalRole, requireGlobalRole('SUPER_ADMIN'), getGlobalRole);

export { router as IdentityRouter };