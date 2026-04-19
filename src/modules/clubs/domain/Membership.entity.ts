export type MembershipRole = 'PENDING' | 'MEMBER' | 'VICE_PRESIDENT' | 'PRESIDENT';

export class MembershipEntity {
    constructor(
        public readonly id: string,
        public readonly clubId: string,
        public readonly userId: string,
        private _role: MembershipRole,
        public readonly joinedAt: Date
    ) { }

    get role(): MembershipRole {
        return this._role;
    }

    // Business logic - Rol hiyerarşisi kontrolü
    private static readonly ROLE_HIERARCHY: MembershipRole[] = [
        'PENDING',
        'MEMBER',
        'VICE_PRESIDENT',
        'PRESIDENT'
    ];

    private getRoleLevel(): number {
        return MembershipEntity.ROLE_HIERARCHY.indexOf(this._role);
    }

    static getRoleLevel(role: MembershipRole): number {
        return MembershipEntity.ROLE_HIERARCHY.indexOf(role);
    }

    // Business logic - Rol kontrolü
    hasMinimumRole(minRole: MembershipRole): boolean {
        return this.getRoleLevel() >= MembershipEntity.getRoleLevel(minRole);
    }

    // Business logic - Üyelik onaylama
    approve(): void {
        if (this._role !== 'PENDING') {
            throw new Error('Sadece bekleyen üyelikler onaylanabilir');
        }
        this._role = 'MEMBER';
    }

    // Business logic - Rol değiştirme
    changeRole(newRole: MembershipRole, performedBy: MembershipEntity): void {
        // PENDING'den başka role geçiş approve() ile yapılmalı
        if (this._role === 'PENDING' && newRole !== 'PENDING') {
            throw new Error('Bekleyen üyelik önce onaylanmalı');
        }

        // Sadece PRESIDENT başka PRESIDENT atayabilir
        if (newRole === 'PRESIDENT' && performedBy.role !== 'PRESIDENT') {
            throw new Error('Sadece başkan, başkan atayabilir');
        }

        // Kendi rolünden düşük role atama yapabilir
        if (MembershipEntity.getRoleLevel(newRole) >= performedBy.getRoleLevel()) {
            throw new Error('Sadece kendi rolünüzden düşük roller atayabilirsiniz');
        }

        this._role = newRole;
    }

    // Business logic - Başkan mı?
    isPresident(): boolean {
        return this._role === 'PRESIDENT';
    }

    // Business logic - Aktif üye mi?
    isActiveMember(): boolean {
        return this._role !== 'PENDING';
    }

    // Factory method - Yeni üyelik başvurusu
    static createApplication(params: {
        id: string;
        clubId: string;
        userId: string;
    }): MembershipEntity {
        return new MembershipEntity(
            params.id,
            params.clubId,
            params.userId,
            'PENDING',
            new Date()
        );
    }

    // Factory method - Direkt üye ekleme (SUPER_ADMIN için)
    static createDirectMember(params: {
        id: string;
        clubId: string;
        userId: string;
        role: MembershipRole;
    }): MembershipEntity {
        return new MembershipEntity(
            params.id,
            params.clubId,
            params.userId,
            params.role,
            new Date()
        );
    }
}
