import { Request, Response, NextFunction } from 'express';
import { EventsService } from '../services/events.service';
import { CreateEventSchema } from '../dtos/CreateEvent.dto';
import { UpdateEventSchema } from '../dtos/UpdateEvent.dto';
import { AppError } from '../../infrastructure/errors/AppError';
import { IUserRepository } from '../../identity/interfaces/IUserRepository';

export const createEvent = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw AppError.unauthorized('Kullanıcı bilgisi bulunamadı');
        }

        const dto = CreateEventSchema.parse(req.body);
        const eventsService = req.container.resolve<EventsService>('eventsService');
        const userRepository = req.container.resolve<IUserRepository>('userRepository');

        // Firebase UID'den userId'yi al
        const user = await userRepository.findByFirebaseUid(req.user.uid);
        if (!user) {
            throw AppError.notFound('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
        }

        const event = await eventsService.createEvent({
            ...dto,
            startTime: new Date(dto.startTime),
            endTime: new Date(dto.endTime),
            createdByUserId: user.id
        });

        res.status(201).json({
            success: true,
            message: 'Etkinlik taslak olarak oluşturuldu',
            data: {
                id: event.id,
                clubId: event.clubId,
                title: event.title,
                description: event.description,
                capacity: event.capacity,
                location: event.location,
                startTime: event.startTime,
                endTime: event.endTime,
                status: event.status
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getAllEvents = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const publishedOnly = req.query.publishedOnly !== 'false';
        const eventsService = req.container.resolve<EventsService>('eventsService');

        const events = await eventsService.getAllEvents(publishedOnly);

        res.status(200).json({
            success: true,
            data: events.map(event => ({
                id: event.id,
                clubId: event.clubId,
                title: event.title,
                description: event.description,
                capacity: event.capacity,
                currentAttendees: event.currentAttendees,
                location: event.location,
                startTime: event.startTime,
                endTime: event.endTime,
                status: event.status,
                createdAt: event.createdAt
            }))
        });
    } catch (error) {
        next(error);
    }
};

export const getUpcomingEvents = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
        const eventsService = req.container.resolve<EventsService>('eventsService');

        const events = await eventsService.getUpcomingEvents(limit);

        res.status(200).json({
            success: true,
            data: events.map(event => ({
                id: event.id,
                clubId: event.clubId,
                title: event.title,
                description: event.description,
                capacity: event.capacity,
                currentAttendees: event.currentAttendees,
                location: event.location,
                startTime: event.startTime,
                endTime: event.endTime,
                status: event.status
            }))
        });
    } catch (error) {
        next(error);
    }
};

export const getEventById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const eventId = req.params.id as string;
        const eventsService = req.container.resolve<EventsService>('eventsService');

        const event = await eventsService.getEventById(eventId);

        res.status(200).json({
            success: true,
            data: {
                id: event.id,
                clubId: event.clubId,
                title: event.title,
                description: event.description,
                capacity: event.capacity,
                currentAttendees: event.currentAttendees,
                location: event.location,
                latitude: event.latitude,
                longitude: event.longitude,
                startTime: event.startTime,
                endTime: event.endTime,
                status: event.status,
                createdAt: event.createdAt
            }
        });
    } catch (error) {
        next(error);
    }
};

export const updateEvent = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw AppError.unauthorized('Kullanıcı bilgisi bulunamadı');
        }

        const eventId = req.params.id as string;
        const dto = UpdateEventSchema.parse(req.body);
        const eventsService = req.container.resolve<EventsService>('eventsService');
        const userRepository = req.container.resolve<IUserRepository>('userRepository');

        // Firebase UID'den userId'yi al
        const user = await userRepository.findByFirebaseUid(req.user.uid);
        if (!user) {
            throw AppError.notFound('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
        }

        // Tarih dönüşümü
        const updateDto = {
            ...dto,
            startTime: dto.startTime ? new Date(dto.startTime) : undefined,
            endTime: dto.endTime ? new Date(dto.endTime) : undefined
        };

        const event = await eventsService.updateEvent(eventId, updateDto, user.id);

        res.status(200).json({
            success: true,
            message: 'Etkinlik güncellendi',
            data: {
                id: event.id,
                title: event.title,
                description: event.description,
                capacity: event.capacity,
                location: event.location,
                startTime: event.startTime,
                endTime: event.endTime
            }
        });
    } catch (error) {
        next(error);
    }
};

export const publishEvent = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw AppError.unauthorized('Kullanıcı bilgisi bulunamadı');
        }

        const eventId = req.params.id as string;
        const eventsService = req.container.resolve<EventsService>('eventsService');
        const userRepository = req.container.resolve<IUserRepository>('userRepository');

        const user = await userRepository.findByFirebaseUid(req.user.uid);
        if (!user) {
            throw AppError.notFound('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
        }

        const event = await eventsService.publishEvent(eventId, user.id);

        res.status(200).json({
            success: true,
            message: 'Etkinlik yayınlandı',
            data: {
                id: event.id,
                status: event.status
            }
        });
    } catch (error) {
        next(error);
    }
};

export const cancelEvent = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw AppError.unauthorized('Kullanıcı bilgisi bulunamadı');
        }

        const eventId = req.params.id as string;
        const eventsService = req.container.resolve<EventsService>('eventsService');
        const userRepository = req.container.resolve<IUserRepository>('userRepository');

        const user = await userRepository.findByFirebaseUid(req.user.uid);
        if (!user) {
            throw AppError.notFound('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
        }

        const event = await eventsService.cancelEvent(eventId, user.id);

        res.status(200).json({
            success: true,
            message: 'Etkinlik iptal edildi',
            data: {
                id: event.id,
                status: event.status
            }
        });
    } catch (error) {
        next(error);
    }
};

export const generateQRCode = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw AppError.unauthorized('Kullanıcı bilgisi bulunamadı');
        }

        const eventId = req.params.id as string;
        const eventsService = req.container.resolve<EventsService>('eventsService');
        const userRepository = req.container.resolve<IUserRepository>('userRepository');

        const user = await userRepository.findByFirebaseUid(req.user.uid);
        if (!user) {
            throw AppError.notFound('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
        }

        const qrCodeData = await eventsService.generateEventQRCode(eventId, user.id);

        res.status(200).json({
            success: true,
            message: 'QR kod oluşturuldu',
            data: qrCodeData
        });
    } catch (error) {
        next(error);
    }
};
