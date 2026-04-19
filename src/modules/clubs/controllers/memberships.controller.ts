import { Request, Response, NextFunction } from 'express';
import { MembershipsService } from '../services/memberships.service';
import { ChangeRoleSchema } from '../dtos/ChangeRole.dto';
import { AppError } from '../../infrastructure/errors/AppError';
import { IUserRepository } from '../../identity/interfaces/IUserRepository';

export const joinClub = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw AppError.unauthorized('Kullanıcı bilgisi bulunamadı');
        }

        const clubId = req.params.clubId as string;
        const membershipsService = req.container.resolve<MembershipsService>('membershipsService');
        const userRepository = req.container.resolve<IUserRepository>('userRepository');

        // Firebase UID'den userId'yi al
        const user = await userRepository.findByFirebaseUid(req.user.uid);
        if (!user) {
            throw AppError.notFound('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
        }

        const membership = await membershipsService.joinClub({
            clubId,
            userId: user.id
        });

        res.status(201).json({
            success: true,
            message: 'Üyelik başvurunuz alındı. Onay bekleniyor.',
            data: {
                id: membership.id,
                clubId: membership.clubId,
                userId: membership.userId,
                role: membership.role,
                joinedAt: membership.joinedAt
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getClubMembers = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const clubId = req.params.clubId as string;
        const includePending = req.query.includePending === 'true';
        const membershipsService = req.container.resolve<MembershipsService>('membershipsService');

        const members = await membershipsService.getClubMembers(clubId, includePending);

        res.status(200).json({
            success: true,
            data: members.map(m => ({
                id: m.id,
                clubId: m.clubId,
                userId: m.userId,
                role: m.role,
                joinedAt: m.joinedAt
            }))
        });
    } catch (error) {
        next(error);
    }
};

export const getPendingApplications = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const clubId = req.params.clubId as string;
        const membershipsService = req.container.resolve<MembershipsService>('membershipsService');

        const pending = await membershipsService.getPendingApplications(clubId);

        res.status(200).json({
            success: true,
            data: pending.map(m => ({
                id: m.id,
                clubId: m.clubId,
                userId: m.userId,
                role: m.role,
                joinedAt: m.joinedAt
            }))
        });
    } catch (error) {
        next(error);
    }
};

export const approveMembership = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw AppError.unauthorized('Kullanıcı bilgisi bulunamadı');
        }

        const clubId = req.params.clubId as string;
        const targetUserId = req.params.userId as string;
        const membershipsService = req.container.resolve<MembershipsService>('membershipsService');
        const userRepository = req.container.resolve<IUserRepository>('userRepository');

        // Firebase UID'den performedByUserId'yi al
        const performer = await userRepository.findByFirebaseUid(req.user.uid);
        if (!performer) {
            throw AppError.notFound('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
        }

        const membership = await membershipsService.approveMembership(
            clubId,
            targetUserId,
            performer.id
        );

        res.status(200).json({
            success: true,
            message: 'Üyelik onaylandı',
            data: {
                id: membership.id,
                clubId: membership.clubId,
                userId: membership.userId,
                role: membership.role
            }
        });
    } catch (error) {
        next(error);
    }
};

export const rejectMembership = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw AppError.unauthorized('Kullanıcı bilgisi bulunamadı');
        }

        const clubId = req.params.clubId as string;
        const targetUserId = req.params.userId as string;
        const membershipsService = req.container.resolve<MembershipsService>('membershipsService');
        const userRepository = req.container.resolve<IUserRepository>('userRepository');

        // Firebase UID'den performedByUserId'yi al
        const performer = await userRepository.findByFirebaseUid(req.user.uid);
        if (!performer) {
            throw AppError.notFound('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
        }

        await membershipsService.rejectMembership(clubId, targetUserId, performer.id);

        res.status(200).json({
            success: true,
            message: 'Üyelik reddedildi'
        });
    } catch (error) {
        next(error);
    }
};

export const changeRole = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw AppError.unauthorized('Kullanıcı bilgisi bulunamadı');
        }

        const clubId = req.params.clubId as string;
        const dto = ChangeRoleSchema.parse(req.body);
        const membershipsService = req.container.resolve<MembershipsService>('membershipsService');
        const userRepository = req.container.resolve<IUserRepository>('userRepository');

        // Firebase UID'den performedByUserId'yi al
        const performer = await userRepository.findByFirebaseUid(req.user.uid);
        if (!performer) {
            throw AppError.notFound('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
        }

        const membership = await membershipsService.changeRole({
            clubId,
            targetUserId: dto.targetUserId,
            newRole: dto.newRole,
            performedByUserId: performer.id
        });

        res.status(200).json({
            success: true,
            message: 'Rol başarıyla değiştirildi',
            data: {
                id: membership.id,
                clubId: membership.clubId,
                userId: membership.userId,
                role: membership.role
            }
        });
    } catch (error) {
        next(error);
    }
};

export const leaveMembership = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw AppError.unauthorized('Kullanıcı bilgisi bulunamadı');
        }

        const clubId = req.params.clubId as string;
        const membershipsService = req.container.resolve<MembershipsService>('membershipsService');
        const userRepository = req.container.resolve<IUserRepository>('userRepository');

        // Firebase UID'den userId'yi al
        const user = await userRepository.findByFirebaseUid(req.user.uid);
        if (!user) {
            throw AppError.notFound('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
        }

        await membershipsService.leaveMembership(clubId, user.id);

        res.status(200).json({
            success: true,
            message: 'Kulüpten ayrıldınız'
        });
    } catch (error) {
        next(error);
    }
};

export const getMembershipStats = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const clubId = req.params.clubId as string;
        const membershipsService = req.container.resolve<MembershipsService>('membershipsService');

        const stats = await membershipsService.getMembershipStats(clubId);

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

export const getMyMemberships = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw AppError.unauthorized('Kullanıcı bilgisi bulunamadı');
        }

        const membershipsService = req.container.resolve<MembershipsService>('membershipsService');
        const userRepository = req.container.resolve<IUserRepository>('userRepository');

        // Firebase UID'den userId'yi al
        const user = await userRepository.findByFirebaseUid(req.user.uid);
        if (!user) {
            throw AppError.notFound('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
        }

        const memberships = await membershipsService.getUserMemberships(user.id);

        res.status(200).json({
            success: true,
            data: memberships.map(m => ({
                id: m.id,
                clubId: m.clubId,
                userId: m.userId,
                role: m.role,
                joinedAt: m.joinedAt
            }))
        });
    } catch (error) {
        next(error);
    }
};
