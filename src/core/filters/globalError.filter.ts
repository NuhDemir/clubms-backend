import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../modules/infrastructure/errors/AppError';
import { ZodError } from 'zod';

export const globalErrorFilter = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // AppError - özel hata sınıfımız
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.errorCode,
                message: err.message,
                statusCode: err.statusCode
            }
        });
        return;
    }

    // ZodError - validasyon hataları
    if (err instanceof ZodError) {
        res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: err.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', '),
                statusCode: 400,
                details: err.issues
            }
        });
        return;
    }

    // Genel hatalar
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: 'Sunucu hatası',
            statusCode: 500
        }
    });
};
