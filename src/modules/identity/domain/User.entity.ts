export type UserStatus = 'ACTIVE' | 'SUSPENDED';

export class UserEntity {

  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly studentNumber: string,
    public readonly fullName: string,
    public readonly firebaseUid: string,
    private _emailVerified: boolean,
    private _status: UserStatus
  ) {}

  get status(): UserStatus {
    return this._status;
  }

  get emailVerified(): boolean {
    return this._emailVerified;
  }

  isActive(): boolean {
    return this._status === 'ACTIVE';
  }

  canLogin(): boolean {
    return this.isActive() && this._emailVerified;
  }

  suspend(): void {
    if (this._status === 'SUSPENDED') {
      throw new Error('User is already suspended');
    }
    this._status = 'SUSPENDED';
  }

  verifyEmail(): void {
    this._emailVerified = true;
  }

  static create(params: {
    id: string,
    email: string,
    studentNumber: string,
    fullName: string,
    firebaseUid: string,
  }): UserEntity {
    return new UserEntity(
      params.id,
      params.email,
      params.studentNumber,
      params.fullName,
      params.firebaseUid,
      false,
      'ACTIVE'
    );
  }
}