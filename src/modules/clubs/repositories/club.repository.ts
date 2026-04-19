import { ClubsClub } from '@prisma/client';
import { prisma } from '../../../shared/prisma/prisma.client';
import { ClubEntity } from '../domain/Club.entity';
import { IClubRepository } from '../interfaces/IClubRepository';

export class PrismaClubRepository implements IClubRepository {
    private toEntity(record: ClubsClub): ClubEntity {
        return new ClubEntity(
            record.id,
            record.name,
            record.description,
            record.logoUrl,
            record.isActive,
            record.createdAt
        );
    }

    async findById(id: string): Promise<ClubEntity | null> {
        const record = await prisma.clubsClub.findUnique({
            where: { id }
        });
        return record ? this.toEntity(record) : null;
    }

    async findByName(name: string): Promise<ClubEntity | null> {
        const record = await prisma.clubsClub.findUnique({
            where: { name }
        });
        return record ? this.toEntity(record) : null;
    }

    async findAll(activeOnly: boolean = false): Promise<ClubEntity[]> {
        const records = await prisma.clubsClub.findMany({
            where: activeOnly ? { isActive: true } : undefined,
            orderBy: { createdAt: 'desc' }
        });
        return records.map(record => this.toEntity(record));
    }

    async save(club: ClubEntity): Promise<void> {
        await prisma.clubsClub.create({
            data: {
                id: club.id,
                name: club.name,
                description: club.description,
                logoUrl: club.logoUrl,
                isActive: club.isActive
            }
        });
    }

    async update(club: ClubEntity): Promise<void> {
        await prisma.clubsClub.update({
            where: { id: club.id },
            data: {
                description: club.description,
                logoUrl: club.logoUrl,
                isActive: club.isActive
            }
        });
    }

    async delete(id: string): Promise<void> {
        await prisma.clubsClub.delete({
            where: { id }
        });
    }
}
