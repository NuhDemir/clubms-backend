import { Request, Response, NextFunction } from 'express';
import { admin as getAdmin } from '../../shared/firebase/firebase.admin';
import { AppError } from '../../modules/infrastructure/errors/AppError';

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith('Bearer ')) {
            throw AppError.unauthorized('Token bulunamadı');
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = await getAdmin().auth().verifyIdToken(token);
            req.user = {
                uid: decoded.uid,
                email: decoded.email ?? ''
            };
            next();
        } catch (error) {
            throw AppError.unauthorized('Geçersiz token');
        }
    } catch (error) {
        next(error);
    }
};
