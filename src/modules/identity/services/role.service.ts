import { IUserRepository } from '../interfaces/IUserRepository';
import { IGlobalRoleRepository } from '../interfaces/IGlobalRoleRepository';
import { AppError } from '../../infrastructure/errors/AppError';

export interface AssignGlobalRoleDto {
    userId: string;
    roleName: string;
}

export class RoleService {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly globalRoleRepository: IGlobalRoleRepository
    ) { }

    async assignGlobalRole(dto: AssignGlobalRoleDto): Promise<void> {
        // Kullanıcının var olduğunu kontrol et
        const user = await this.userRepository.findById(dto.userId);
        if (!user) {
            throw AppError.notFound('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
        }

        // Geçerli rol kontrolü
        const validRoles = ['SUPER_ADMIN', 'SKS_MANAGER', 'USER'];
        if (!validRoles.includes(dto.roleName)) {
            throw AppError.badRequest(
                `Geçersiz rol. Geçerli roller: ${validRoles.join(', ')}`,
                'INVALID_ROLE'
            );
        }

        // Mevcut rolü kontrol et
        const existingRole = await this.globalRoleRepository.findByUserId(dto.userId);

        if (existingRole) {
            // Güncelle
            await this.globalRoleRepository.update(dto.userId, dto.roleName);
        } else {
            // Yeni rol ata
            await this.globalRoleRepository.create(dto.userId, dto.roleName);
        }
    }

    async getGlobalRole(userId: string): Promise<string | null> {
        const role = await this.globalRoleRepository.findByUserId(userId);
        return role;
    }

    async removeGlobalRole(userId: string): Promise<void> {
        await this.globalRoleRepository.delete(userId);
    }
}
