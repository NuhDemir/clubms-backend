import { Request, Response, NextFunction } from 'express';
import { IGlobalRoleRepository } from '../../modules/identity/interfaces/IGlobalRoleRepository';
import { IUserRepository } from '../../modules/identity/interfaces/IUserRepository';

/**
 * authMiddleware'den sonra çalışmalı
 * req.user.uid'den kullanıcıyı bulup globalRole'ü req.globalRole'e yükler
 */
export const loadGlobalRole = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            next();
            return;
        }

        const userRepository = req.container.resolve<IUserRepository>('userRepository');
        const globalRoleRepository = req.container.resolve<IGlobalRoleRepository>('globalRoleRepository');

        // Firebase UID'den kullanıcıyı bul
        const user = await userRepository.findByFirebaseUid(req.user.uid);

        if (user) {
            // Global rolü yükle
            const role = await globalRoleRepository.findByUserId(user.id);
            req.globalRole = role || 'USER'; // Default: USER
        }

        next();
    } catch (error) {
        next(error);
    }
};
