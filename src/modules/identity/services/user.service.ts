import { IUserRepository } from '../interfaces/IUserRepository';
import { UserEntity } from '../domain/User.entity';
import { AppError } from '../../infrastructure/errors/AppError';

export class UserService {
    constructor(
        private readonly userRepository: IUserRepository
    ) { }

    async getAllUsers(): Promise<UserEntity[]> {
        // Tüm kullanıcıları getir - SUPER_ADMIN için
        const users = await this.userRepository.findAll();
        return users;
    }

    async getUserById(userId: string): Promise<UserEntity> {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw AppError.notFound('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
        }

        return user;
    }

    async suspendUser(userId: string): Promise<UserEntity> {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw AppError.notFound('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
        }

        // Domain metodunu kullan
        user.suspend();

        // Güncellemeyi kaydet
        await this.userRepository.update(user);

        return user;
    }

    async activateUser(userId: string): Promise<UserEntity> {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw AppError.notFound('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
        }

        // Domain metodunu kullan (activate metodunu User.entity.ts'e ekleyeceğiz)
        if (user.status === 'ACTIVE') {
            throw AppError.badRequest('Kullanıcı zaten aktif', 'USER_ALREADY_ACTIVE');
        }

        // Güncellemeyi kaydet
        await this.userRepository.update(user);

        return user;
    }
}
