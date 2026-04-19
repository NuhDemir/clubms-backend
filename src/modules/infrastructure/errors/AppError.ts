export class AppError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number,
        public readonly errorCode: string = 'INTERNAL_ERROR'
    ) {
        super(message);
        this.name = 'AppError';
        Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(message: string, errorCode: string = 'BAD_REQUEST'): AppError {
        return new AppError(message, 400, errorCode);
    }

    static unauthorized(message: string = 'Yetkisiz erişim', errorCode: string = 'UNAUTHORIZED'): AppError {
        return new AppError(message, 401, errorCode);
    }

    static forbidden(message: string = 'Yetersiz yetki', errorCode: string = 'FORBIDDEN'): AppError {
        return new AppError(message, 403, errorCode);
    }

    static notFound(message: string = 'Kaynak bulunamadı', errorCode: string = 'NOT_FOUND'): AppError {
        return new AppError(message, 404, errorCode);
    }

    static conflict(message: string, errorCode: string = 'CONFLICT'): AppError {
        return new AppError(message, 409, errorCode);
    }

    static internal(message: string = 'Sunucu hatası', errorCode: string = 'INTERNAL_ERROR'): AppError {
        return new AppError(message, 500, errorCode);
    }
}
