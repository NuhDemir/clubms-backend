import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../modules/infrastructure/errors/AppError';

/**
 * Global rol kontrolü - SUPER_ADMIN, SKS_MANAGER, USER
 */
export const requireGlobalRole = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            const userRole = req.globalRole;

            if (!userRole || !roles.includes(userRole)) {
                throw AppError.forbidden('Yetersiz yetki');
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Kulüp rol kontrolü - PRESIDENT, VICE_PRESIDENT, MEMBER, PENDING
 */
export const requireClubRole = (clubIdParam: string, ...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            const clubRole = req.clubRole;

            if (!clubRole || !roles.includes(clubRole)) {
                throw AppError.forbidden('Kulüp yetkisi yetersiz');
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Kulüp rol hiyerarşisi kontrolü
 * Örnek: requireMinClubRole('MEMBER') → MEMBER, VICE_PRESIDENT, PRESIDENT kabul eder
 */
export const requireMinClubRole = (minRole: string) => {
    const hierarchy = ['PENDING', 'MEMBER', 'VICE_PRESIDENT', 'PRESIDENT'];

    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            const userRole = req.clubRole;

            if (!userRole) {
                throw AppError.forbidden('Kulüp üyeliği bulunamadı');
            }

            const userRoleIndex = hierarchy.indexOf(userRole);
            const minRoleIndex = hierarchy.indexOf(minRole);

            if (userRoleIndex < minRoleIndex) {
                throw AppError.forbidden('Yetersiz kulüp yetkisi');
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};
