import { v4 as uuidv4 } from 'uuid';
import { IUserRepository } from '../interfaces/IUserRepository';
import { UserEntity } from '../domain/User.entity';
import { RegisterUserDto } from '../dtos/RegisterUser.dto';
import { LoginUserDto } from '../dtos/LoginUser.dto';
import { admin as getAdmin } from '@shared/firebase/firebase.admin';
import { AppError } from '../../infrastructure/errors/AppError';

export class AuthService {
  constructor(
    private readonly userRepository: IUserRepository,
  ) { }

  async register(dto: RegisterUserDto): Promise<UserEntity> {
    // 1. Email kontrolü
    const existingEmailUser = await this.userRepository.findByEmail(dto.email);
    if (existingEmailUser) {
      throw AppError.conflict('Email zaten kullanımda', 'EMAIL_ALREADY_EXISTS');
    }

    // 2. Firebase'de oluştur
    let firebaseUser;
    try {
      firebaseUser = await getAdmin().auth().createUser({
        email: dto.email,
        password: dto.password,
      });
    } catch (error: any) {
      throw AppError.internal('Firebase kullanıcısı oluşturulamadı: ' + error.message);
    }

    // 3. Entity oluştur ve kaydet
    const id = uuidv4();
    const user = UserEntity.create({
      id,
      email: dto.email,
      studentNumber: dto.studentNumber,
      fullName: dto.fullName,
      firebaseUid: firebaseUser.uid,
    });

    await this.userRepository.save(user);
    return user;
  }

  async login(dto: LoginUserDto): Promise<UserEntity> {
    // 1. Firebase token doğrula
    let decoded;
    try {
      decoded = await getAdmin().auth().verifyIdToken(dto.idToken);
    } catch (error) {
      throw AppError.unauthorized('Geçersiz token', 'INVALID_TOKEN');
    }

    // 2. Kullanıcıyı bul
    const user = await this.userRepository.findByFirebaseUid(decoded.uid);
    if (!user) {
      throw AppError.notFound('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
    }

    // 3. canLogin() kontrolü
    if (!user.canLogin()) {
      throw AppError.forbidden('Hesabınıza erişim engellenmiş', 'ACCOUNT_SUSPENDED');
    }

    // 4. UserEntity döndür
    return user;
  }
}