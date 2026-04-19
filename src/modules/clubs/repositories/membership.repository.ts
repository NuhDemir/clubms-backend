import { ClubsMembership } from '@prisma/client';
import { prisma } from '../../../shared/prisma/prisma.client';
import { MembershipEntity, MembershipRole } from '../domain/Membership.entity';
import { IMembershipRepository } from '../interfaces/IMembershipRepository';

export class PrismaMembershipRepository implements IMembershipRepository {
    private toEntity(record: ClubsMembership): MembershipEntity {
        return new MembershipEntity(
            record.id,
            record.clubId,
            record.userId,
            record.role as MembershipRole,
            record.joinedAt
        );
    }

    async findById(id: string): Promise<MembershipEntity | null> {
        const record = await prisma.clubsMembership.findUnique({
            where: { id }
        });
        return record ? this.toEntity(record) : null;
    }

    async findByClubAndUser(clubId: string, userId: string): Promise<MembershipEntity | null> {
        const record = await prisma.clubsMembership.findUnique({
            where: {
                clubId_userId: { clubId, userId }
            }
        });
        return record ? this.toEntity(record) : null;
    }

    async findByClubId(clubId: string): Promise<MembershipEntity[]> {
        const records = await prisma.clubsMembership.findMany({
            where: { clubId },
            orderBy: { joinedAt: 'desc' }
        });
        return records.map(record => this.toEntity(record));
    }

    async findByUserId(userId: string): Promise<MembershipEntity[]> {
        const records = await prisma.clubsMembership.findMany({
            where: { userId },
            orderBy: { joinedAt: 'desc' }
        });
        return records.map(record => this.toEntity(record));
    }

    async findPendingByClubId(clubId: string): Promise<MembershipEntity[]> {
        const records = await prisma.clubsMembership.findMany({
            where: {
                clubId,
                role: 'PENDING'
            },
            orderBy: { joinedAt: 'asc' }
        });
        return records.map(record => this.toEntity(record));
    }

    async save(membership: MembershipEntity): Promise<void> {
        await prisma.clubsMembership.create({
            data: {
                id: membership.id,
                clubId: membership.clubId,
                userId: membership.userId,
                role: membership.role
            }
        });
    }

    async update(membership: MembershipEntity): Promise<void> {
        await prisma.clubsMembership.update({
            where: {
                clubId_userId: {
                    clubId: membership.clubId,
                    userId: membership.userId
                }
            },
            data: {
                role: membership.role
            }
        });
    }

    async delete(clubId: string, userId: string): Promise<void> {
        await prisma.clubsMembership.delete({
            where: {
                clubId_userId: { clubId, userId }
            }
        });
    }

    async countActiveMembers(clubId: string): Promise<number> {
        return await prisma.clubsMembership.count({
            where: {
                clubId,
                role: { not: 'PENDING' }
            }
        });
    }
}
