import { UserEntity } from '../domain/User.entity';

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByFirebaseUid(uid: string): Promise<UserEntity | null>;
  findAll(): Promise<UserEntity[]>;
  save(user: UserEntity): Promise<void>;
  update(user: UserEntity): Promise<void>;
}