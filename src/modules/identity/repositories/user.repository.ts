import { IdentityUser } from '@prisma/client';
import { prisma } from '../../../shared/prisma/prisma.client';
import { UserEntity, UserStatus } from '../domain/User.entity';
import { IUserRepository } from '../interfaces/IUserRepository';

export class PrismaUserRepository implements IUserRepository {

  private toEntity(record: IdentityUser): UserEntity {
    return new UserEntity(
      record.id,
      record.email,
      record.studentNumber,
      record.fullName,
      record.firebaseUid,
      record.emailVerified,
      record.status as UserStatus
    );
  }

  async findById(id: string): Promise<UserEntity | null> {
    const record = await prisma.identityUser.findUnique({
      where: { id }
    });
    if (!record) return null;
    return this.toEntity(record);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const record = await prisma.identityUser.findUnique({
      where: { email }
    });
    if (!record) return null;
    return this.toEntity(record);
  }

  async findByFirebaseUid(uid: string): Promise<UserEntity | null> {
    const record = await prisma.identityUser.findUnique({
      where: { firebaseUid: uid }
    });
    if (!record) return null;
    return this.toEntity(record);
  }

  async save(user: UserEntity): Promise<void> {
    await prisma.identityUser.create({
      data: {
        id: user.id,
        email: user.email,
        studentNumber: user.studentNumber,
        fullName: user.fullName,
        firebaseUid: user.firebaseUid,
        emailVerified: user.emailVerified,
        status: user.status
      }
    });
  }
}