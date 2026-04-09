export type UserStatus = 'ACTIVE' | 'SUSPENDED';

export class UserEntity {

  constructor(
    public readonly id: string,           // UUID → string
    public readonly email: string,
    public readonly studentNumber: string, 
    public readonly fullName: string,
    public readonly firebaseUid: string,
    public readonly emailVerified: boolean,
    public readonly status: UserStatus
  ) {}

  isActive(): boolean {
    return this.status === 'ACTIVE';      
  }

  canLogin(): boolean {
    return this.isActive() && this.emailVerified;
  }
}