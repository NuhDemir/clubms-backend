import { Request, Response, NextFunction } from 'express';
import { AttendanceService } from '../services/attendance.service';
import { CheckInQRSchema } from '../dtos/CheckInQR.dto';
import { CheckInGPSSchema } from '../dtos/CheckInGPS.dto';
import { AppError } from '../../infrastructure/errors/AppError';
import { IUserRepository } from '../../identity/interfaces/IUserRepository';

export const attendEvent = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw AppError.unauthorized('Kullanıcı bilgisi bulunamadı');
        }

        const eventId = req.params.id as string;
        const attendanceService = req.container.resolve<AttendanceService>('attendanceService');
        const userRepository = req.container.resolve<IUserRepository>('userRepository');

        const user = await userRepository.findByFirebaseUid(req.user.uid);
        if (!user) {
            throw AppError.notFound('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
        }

        const attendance = await attendanceService.attendEvent({
            eventId,
            userId: user.id,
            checkInMethod: 'MANUAL'
        });

        res.status(201).json({
            success: true,
            message: 'Etkinliğe katıldınız',
            data: {
                eventId: attendance.eventId,
                userId: attendance.userId,
                checkInMethod: attendance.checkInMethod,
                joinedAt: attendance.joinedAt
            }
        });
    } catch (error) {
        next(error);
    }
};

export const leaveEvent = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw AppError.unauthorized('Kullanıcı bilgisi bulunamadı');
        }

        const eventId = req.params.id as string;
        const attendanceService = req.container.resolve<AttendanceService>('attendanceService');
        const userRepository = req.container.resolve<IUserRepository>('userRepository');

        const user = await userRepository.findByFirebaseUid(req.user.uid);
        if (!user) {
            throw AppError.notFound('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
        }

        await attendanceService.leaveEvent(eventId, user.id);

        res.status(200).json({
            success: true,
            message: 'Etkinlikten ayrıldınız'
        });
    } catch (error) {
        next(error);
    }
};

export const getEventAttendees = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const eventId = req.params.id as string;
        const attendanceService = req.container.resolve<AttendanceService>('attendanceService');

        const attendees = await attendanceService.getEventAttendees(eventId);

        res.status(200).json({
            success: true,
            data: attendees.map(a => ({
                eventId: a.eventId,
                userId: a.userId,
                checkInMethod: a.checkInMethod,
                joinedAt: a.joinedAt
            }))
        });
    } catch (error) {
        next(error);
    }
};

export const getMyAttendances = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw AppError.unauthorized('Kullanıcı bilgisi bulunamadı');
        }

        const attendanceService = req.container.resolve<AttendanceService>('attendanceService');
        const userRepository = req.container.resolve<IUserRepository>('userRepository');

        const user = await userRepository.findByFirebaseUid(req.user.uid);
        if (!user) {
            throw AppError.notFound('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
        }

        const attendances = await attendanceService.getUserAttendances(user.id);

        res.status(200).json({
            success: true,
            data: attendances.map(a => ({
                eventId: a.eventId,
                userId: a.userId,
                checkInMethod: a.checkInMethod,
                joinedAt: a.joinedAt
            }))
        });
    } catch (error) {
        next(error);
    }
};

export const checkInQR = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw AppError.unauthorized('Kullanıcı bilgisi bulunamadı');
        }

        const eventId = req.params.id as string;
        const dto = CheckInQRSchema.parse(req.body);
        const attendanceService = req.container.resolve<AttendanceService>('attendanceService');
        const userRepository = req.container.resolve<IUserRepository>('userRepository');

        const user = await userRepository.findByFirebaseUid(req.user.uid);
        if (!user) {
            throw AppError.notFound('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
        }

        const attendance = await attendanceService.checkInQR({
            eventId,
            userId: user.id,
            qrCode: dto.qrCode
        });

        res.status(201).json({
            success: true,
            message: 'QR kod ile check-in başarılı',
            data: {
                eventId: attendance.eventId,
                userId: attendance.userId,
                checkInMethod: attendance.checkInMethod,
                joinedAt: attendance.joinedAt
            }
        });
    } catch (error) {
        next(error);
    }
};

export const checkInGPS = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw AppError.unauthorized('Kullanıcı bilgisi bulunamadı');
        }

        const eventId = req.params.id as string;
        const dto = CheckInGPSSchema.parse(req.body);
        const attendanceService = req.container.resolve<AttendanceService>('attendanceService');
        const userRepository = req.container.resolve<IUserRepository>('userRepository');

        const user = await userRepository.findByFirebaseUid(req.user.uid);
        if (!user) {
            throw AppError.notFound('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
        }

        const attendance = await attendanceService.checkInGPS({
            eventId,
            userId: user.id,
            userLatitude: dto.latitude,
            userLongitude: dto.longitude
        });

        res.status(201).json({
            success: true,
            message: 'GPS ile check-in başarılı',
            data: {
                eventId: attendance.eventId,
                userId: attendance.userId,
                checkInMethod: attendance.checkInMethod,
                joinedAt: attendance.joinedAt
            }
        });
    } catch (error) {
        next(error);
    }
};
