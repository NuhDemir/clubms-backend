import { prisma } from '../../../shared/prisma/prisma.client';
import { IGlobalRoleRepository } from '../interfaces/IGlobalRoleRepository';

export class PrismaGlobalRoleRepository implements IGlobalRoleRepository {
    async findByUserId(userId: string): Promise<string | null> {
        const record = await prisma.identityGlobalRole.findUnique({
            where: { userId }
        });
        return record ? record.roleName : null;
    }

    async create(userId: string, roleName: string): Promise<void> {
        await prisma.identityGlobalRole.create({
            data: {
                userId,
                roleName
            }
        });
    }

    async update(userId: string, roleName: string): Promise<void> {
        await prisma.identityGlobalRole.update({
            where: { userId },
            data: { roleName }
        });
    }

    async delete(userId: string): Promise<void> {
        await prisma.identityGlobalRole.delete({
            where: { userId }
        });
    }
}
