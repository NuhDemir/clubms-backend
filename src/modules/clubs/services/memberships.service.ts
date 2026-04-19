import { v4 as uuidv4 } from 'uuid';
import { IMembershipRepository } from '../interfaces/IMembershipRepository';
import { IClubRepository } from '../interfaces/IClubRepository';
import { IUserRepository } from '../../identity/interfaces/IUserRepository';
import { MembershipEntity, MembershipRole } from '../domain/Membership.entity';
import { AppError } from '../../infrastructure/errors/AppError';
import { domainEvents } from '../../notifications/listeners/event.listener';

export interface JoinClubDto {
    clubId: string;
    userId: string;
}

export interface ChangeRoleDto {
    clubId: string;
    targetUserId: string;
    newRole: MembershipRole;
    performedByUserId: string;
}

export class MembershipsService {
    constructor(
        private readonly membershipRepository: IMembershipRepository,
        private readonly clubRepository: IClubRepository,
        private readonly userRepository: IUserRepository
    ) { }

    // ==================== MEMBERSHIP CRUD ====================

    async joinClub(dto: JoinClubDto): Promise<MembershipEntity> {
        // 1. Kulübün var olduğunu ve aktif olduğunu kontrol et
        const club = await this.clubRepository.findById(dto.clubId);
        if (!club) {
            throw AppError.notFound('Kulüp bulunamadı', 'CLUB_NOT_FOUND');
        }
        if (!club.isActive) {
            throw AppError.badRequest('Pasif kulübe üye olunamaz', 'CLUB_INACTIVE');
        }

        // 2. Kullanıcının var olduğunu kontrol et (Soft FK)
        const user = await this.userRepository.findById(dto.userId);
        if (!user) {
            throw AppError.notFound('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
        }

        // 3. Zaten üye mi kontrol et
        const existingMembership = await this.membershipRepository.findByClubAndUser(
            dto.clubId,
            dto.userId
        );
        if (existingMembership) {
            throw AppError.conflict('Zaten bu kulübün üyesisiniz', 'ALREADY_MEMBER');
        }

        // 4. Üyelik başvurusu oluştur (PENDING)
        const membership = MembershipEntity.createApplication({
            id: uuidv4(),
            clubId: dto.clubId,
            userId: dto.userId
        });

        await this.membershipRepository.save(membership);

        return membership;
    }

    async getClubMembers(clubId: string, includePending: boolean = false): Promise<MembershipEntity[]> {
        // Kulübün var olduğunu kontrol et
        const club = await this.clubRepository.findById(clubId);
        if (!club) {
            throw AppError.notFound('Kulüp bulunamadı', 'CLUB_NOT_FOUND');
        }

        if (includePending) {
            return await this.membershipRepository.findByClubId(clubId);
        } else {
            const allMembers = await this.membershipRepository.findByClubId(clubId);
            return allMembers.filter(m => m.isActiveMember());
        }
    }

    async getPendingApplications(clubId: string): Promise<MembershipEntity[]> {
        return await this.membershipRepository.findPendingByClubId(clubId);
    }

    async getUserMemberships(userId: string): Promise<MembershipEntity[]> {
        return await this.membershipRepository.findByUserId(userId);
    }

    async approveMembership(
        clubId: string,
        targetUserId: string,
        performedByUserId: string
    ): Promise<MembershipEntity> {
        // 1. Hedef üyeliği bul
        const membership = await this.membershipRepository.findByClubAndUser(clubId, targetUserId);
        if (!membership) {
            throw AppError.notFound('Üyelik bulunamadı', 'MEMBERSHIP_NOT_FOUND');
        }

        // 2. Yetki kontrolü - Sadece PRESIDENT onaylayabilir
        const performerMembership = await this.membershipRepository.findByClubAndUser(
            clubId,
            performedByUserId
        );
        if (!performerMembership || !performerMembership.isPresident()) {
            throw AppError.forbidden('Sadece kulüp başkanı üyelik onaylayabilir', 'NOT_CLUB_PRESIDENT');
        }

        // 3. Domain metodunu kullan
        membership.approve();

        // 4. Kaydet
        await this.membershipRepository.update(membership);

        // 5. Domain event emit et (Outbox pattern)
        const club = await this.clubRepository.findById(clubId);
        domainEvents.emit('membership.approved', {
            userId: targetUserId,
            clubId: clubId,
            clubName: club?.name || 'Bilinmeyen Kulüp'
        });

        return membership;
    }

    async rejectMembership(
        clubId: string,
        targetUserId: string,
        performedByUserId: string
    ): Promise<void> {
        // 1. Hedef üyeliği bul
        const membership = await this.membershipRepository.findByClubAndUser(clubId, targetUserId);
        if (!membership) {
            throw AppError.notFound('Üyelik bulunamadı', 'MEMBERSHIP_NOT_FOUND');
        }

        // 2. Yetki kontrolü - Sadece PRESIDENT reddedebilir
        const performerMembership = await this.membershipRepository.findByClubAndUser(
            clubId,
            performedByUserId
        );
        if (!performerMembership || !performerMembership.isPresident()) {
            throw AppError.forbidden('Sadece kulüp başkanı üyelik reddedebilir', 'NOT_CLUB_PRESIDENT');
        }

        // 3. Sadece PENDING reddedilebilir
        if (membership.role !== 'PENDING') {
            throw AppError.badRequest('Sadece bekleyen üyelikler reddedilebilir', 'NOT_PENDING');
        }

        // 4. Sil
        await this.membershipRepository.delete(clubId, targetUserId);

        // 5. Domain event emit et (Outbox pattern)
        const club = await this.clubRepository.findById(clubId);
        domainEvents.emit('membership.rejected', {
            userId: targetUserId,
            clubId: clubId,
            clubName: club?.name || 'Bilinmeyen Kulüp'
        });
    }

    async changeRole(dto: ChangeRoleDto): Promise<MembershipEntity> {
        // 1. Hedef üyeliği bul
        const targetMembership = await this.membershipRepository.findByClubAndUser(
            dto.clubId,
            dto.targetUserId
        );
        if (!targetMembership) {
            throw AppError.notFound('Hedef üyelik bulunamadı', 'MEMBERSHIP_NOT_FOUND');
        }

        // 2. İşlemi yapan kişinin üyeliğini bul
        const performerMembership = await this.membershipRepository.findByClubAndUser(
            dto.clubId,
            dto.performedByUserId
        );
        if (!performerMembership) {
            throw AppError.forbidden('Bu kulübün üyesi değilsiniz', 'NOT_MEMBER');
        }

        // 3. Domain metodunu kullan (yetki kontrolü içeride)
        try {
            targetMembership.changeRole(dto.newRole, performerMembership);
        } catch (error: any) {
            throw AppError.forbidden(error.message, 'ROLE_CHANGE_FORBIDDEN');
        }

        // 4. Kaydet
        await this.membershipRepository.update(targetMembership);

        return targetMembership;
    }

    async leaveMembership(clubId: string, userId: string): Promise<void> {
        // 1. Üyeliği bul
        const membership = await this.membershipRepository.findByClubAndUser(clubId, userId);
        if (!membership) {
            throw AppError.notFound('Üyelik bulunamadı', 'MEMBERSHIP_NOT_FOUND');
        }

        // 2. Başkan ayrılamaz (önce başkanlığı devretmeli)
        if (membership.isPresident()) {
            throw AppError.badRequest(
                'Başkan kulüpten ayrılamaz. Önce başkanlığı devredin.',
                'PRESIDENT_CANNOT_LEAVE'
            );
        }

        // 3. Sil
        await this.membershipRepository.delete(clubId, userId);
    }

    async getMembershipStats(clubId: string): Promise<{
        totalMembers: number;
        pendingApplications: number;
        activeMembers: number;
    }> {
        const allMembers = await this.membershipRepository.findByClubId(clubId);
        const pending = allMembers.filter(m => m.role === 'PENDING');
        const active = allMembers.filter(m => m.isActiveMember());

        return {
            totalMembers: allMembers.length,
            pendingApplications: pending.length,
            activeMembers: active.length
        };
    }
}
