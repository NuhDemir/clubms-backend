import { Router } from 'express';
import { login, register, getMe } from './controllers/auth.controller';
import { authMiddleware } from '../../core/middleware/auth.middleware';


const router = Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', authMiddleware, getMe);

export { router as IdentityRouter };