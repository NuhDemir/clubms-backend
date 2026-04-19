import { v4 as uuidv4 } from 'uuid';
import { IClubRepository } from '../interfaces/IClubRepository';
import { IMembershipRepository } from '../interfaces/IMembershipRepository';
import { IUserRepository } from '../../identity/interfaces/IUserRepository';
import { ClubEntity } from '../domain/Club.entity';
import { MembershipEntity } from '../domain/Membership.entity';
import { AppError } from '../../infrastructure/errors/AppError';
import { IClubServicePublic } from '../interfaces/IClubServicePublic';

export interface CreateClubDto {
    name: string;
    description: string;
    logoUrl?: string;
    presidentUserId: string; // İlk başkan
}

export interface UpdateClubDto {
    description: string;
    logoUrl?: string;
}

export class ClubsService implements IClubServicePublic {
    constructor(
        private readonly clubRepository: IClubRepository,
        private readonly membershipRepository: IMembershipRepository,
        private readonly userRepository: IUserRepository
    ) { }

    // ==================== PUBLIC API (Cross-context) ====================

    async verifyClubExists(clubId: string): Promise<boolean> {
        const club = await this.clubRepository.findById(clubId);
        return club !== null && club.isActive;
    }

    async verifyUserHasRole(clubId: string, userId: string, minRole: string): Promise<boolean> {
        const membership = await this.membershipRepository.findByClubAndUser(clubId, userId);
        if (!membership) return false;

        return membership.hasMinimumRole(minRole as any);
    }

    async getClubName(clubId: string): Promise<string | null> {
        const club = await this.clubRepository.findById(clubId);
        return club ? club.name : null;
    }

    // ==================== CLUB CRUD ====================

    async createClub(dto: CreateClubDto): Promise<ClubEntity> {
        // 1. İsim kontrolü
        const existingClub = await this.clubRepository.findByName(dto.name);
        if (existingClub) {
            throw AppError.conflict('Bu isimde bir kulüp zaten mevcut', 'CLUB_NAME_EXISTS');
        }

        // 2. Başkan kullanıcısının var olduğunu kontrol et (Soft FK)
        const president = await this.userRepository.findById(dto.presidentUserId);
        if (!president) {
            throw AppError.notFound('Başkan kullanıcı bulunamadı', 'USER_NOT_FOUND');
        }

        // 3. Kulübü oluştur
        const clubId = uuidv4();
        const club = ClubEntity.create({
            id: clubId,
            name: dto.name,
            description: dto.description,
            logoUrl: dto.logoUrl
        });

        await this.clubRepository.save(club);

        // 4. Başkanı otomatik üye yap
        const membership = MembershipEntity.createDirectMember({
            id: uuidv4(),
            clubId: clubId,
            userId: dto.presidentUserId,
            role: 'PRESIDENT'
        });

        await this.membershipRepository.save(membership);

        return club;
    }

    async getAllClubs(activeOnly: boolean = true): Promise<ClubEntity[]> {
        return await this.clubRepository.findAll(activeOnly);
    }

    async getClubById(clubId: string): Promise<ClubEntity> {
        const club = await this.clubRepository.findById(clubId);

        if (!club) {
            throw AppError.notFound('Kulüp bulunamadı', 'CLUB_NOT_FOUND');
        }

        return club;
    }

    async updateClub(clubId: string, dto: UpdateClubDto, performedByUserId: string): Promise<ClubEntity> {
        // 1. Kulübü bul
        const club = await this.clubRepository.findById(clubId);
        if (!club) {
            throw AppError.notFound('Kulüp bulunamadı', 'CLUB_NOT_FOUND');
        }

        // 2. Yetki kontrolü - Sadece PRESIDENT güncelleyebilir
        const membership = await this.membershipRepository.findByClubAndUser(clubId, performedByUserId);
        if (!membership || !membership.isPresident()) {
            throw AppError.forbidden('Sadece kulüp başkanı güncelleyebilir', 'NOT_CLUB_PRESIDENT');
        }

        // 3. Domain metodunu kullan
        club.updateInfo(dto.description, dto.logoUrl);

        // 4. Kaydet
        await this.clubRepository.update(club);

        return club;
    }

    async deactivateClub(clubId: string): Promise<ClubEntity> {
        const club = await this.clubRepository.findById(clubId);

        if (!club) {
            throw AppError.notFound('Kulüp bulunamadı', 'CLUB_NOT_FOUND');
        }

        // Domain metodunu kullan
        club.deactivate();

        await this.clubRepository.update(club);

        return club;
    }

    async activateClub(clubId: string): Promise<ClubEntity> {
        const club = await this.clubRepository.findById(clubId);

        if (!club) {
            throw AppError.notFound('Kulüp bulunamadı', 'CLUB_NOT_FOUND');
        }

        club.activate();
        await this.clubRepository.update(club);

        return club;
    }
}
