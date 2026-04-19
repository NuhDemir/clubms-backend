import { Request, Response, NextFunction } from 'express';
import { IMembershipRepository } from '../../modules/clubs/interfaces/IMembershipRepository';
import { IUserRepository } from '../../modules/identity/interfaces/IUserRepository';

/**
 * authMiddleware'den sonra çalışmalı
 * req.user.uid'den kullanıcıyı bulup, belirtilen clubId için rolü req.clubRole'e yükler
 * 
 * Kullanım: loadClubRole('clubId') veya loadClubRole('id')
 * Route parametresinden clubId'yi alır
 */
export const loadClubRole = (clubIdParam: string = 'clubId') => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user) {
                next();
                return;
            }

            const clubId = req.params[clubIdParam] as string;
            if (!clubId) {
                next();
                return;
            }

            const userRepository = req.container.resolve<IUserRepository>('userRepository');
            const membershipRepository = req.container.resolve<IMembershipRepository>('membershipRepository');

            // Firebase UID'den kullanıcıyı bul
            const user = await userRepository.findByFirebaseUid(req.user.uid);

            if (user) {
                // Kulübdeki rolü yükle
                const membership = await membershipRepository.findByClubAndUser(clubId, user.id);
                req.clubRole = membership ? membership.role : undefined;
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};
