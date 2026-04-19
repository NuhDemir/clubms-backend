import { Request, Response, NextFunction } from 'express';
import { ClubsService } from '../services/clubs.service';
import { CreateClubSchema } from '../dtos/CreateClub.dto';
import { UpdateClubSchema } from '../dtos/UpdateClub.dto';
import { AppError } from '../../infrastructure/errors/AppError';
import { IUserRepository } from '../../identity/interfaces/IUserRepository';

export const createClub = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const dto = CreateClubSchema.parse(req.body);
        const clubsService = req.container.resolve<ClubsService>('clubsService');

        const club = await clubsService.createClub(dto);

        res.status(201).json({
            success: true,
            message: 'Kulüp başarıyla oluşturuldu',
            data: {
                id: club.id,
                name: club.name,
                description: club.description,
                logoUrl: club.logoUrl,
                isActive: club.isActive
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getAllClubs = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const activeOnly = req.query.activeOnly !== 'false'; // Default: true
        const clubsService = req.container.resolve<ClubsService>('clubsService');

        const clubs = await clubsService.getAllClubs(activeOnly);

        res.status(200).json({
            success: true,
            data: clubs.map(club => ({
                id: club.id,
                name: club.name,
                description: club.description,
                logoUrl: club.logoUrl,
                isActive: club.isActive,
                createdAt: club.createdAt
            }))
        });
    } catch (error) {
        next(error);
    }
};

export const getClubById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const clubId = req.params.id as string;
        const clubsService = req.container.resolve<ClubsService>('clubsService');

        const club = await clubsService.getClubById(clubId);

        res.status(200).json({
            success: true,
            data: {
                id: club.id,
                name: club.name,
                description: club.description,
                logoUrl: club.logoUrl,
                isActive: club.isActive,
                createdAt: club.createdAt
            }
        });
    } catch (error) {
        next(error);
    }
};

export const updateClub = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw AppError.unauthorized('Kullanıcı bilgisi bulunamadı');
        }

        const clubId = req.params.id as string;
        const dto = UpdateClubSchema.parse(req.body);
        const clubsService = req.container.resolve<ClubsService>('clubsService');

        // userId'yi Firebase UID'den al
        const userRepository = req.container.resolve<IUserRepository>('userRepository');
        const user = await userRepository.findByFirebaseUid(req.user.uid);
        if (!user) {
            throw AppError.notFound('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
        }

        const club = await clubsService.updateClub(clubId, dto, user.id);

        res.status(200).json({
            success: true,
            message: 'Kulüp başarıyla güncellendi',
            data: {
                id: club.id,
                name: club.name,
                description: club.description,
                logoUrl: club.logoUrl
            }
        });
    } catch (error) {
        next(error);
    }
};

export const deactivateClub = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const clubId = req.params.id as string;
        const clubsService = req.container.resolve<ClubsService>('clubsService');

        const club = await clubsService.deactivateClub(clubId);

        res.status(200).json({
            success: true,
            message: 'Kulüp pasif hale getirildi',
            data: {
                id: club.id,
                isActive: club.isActive
            }
        });
    } catch (error) {
        next(error);
    }
};
