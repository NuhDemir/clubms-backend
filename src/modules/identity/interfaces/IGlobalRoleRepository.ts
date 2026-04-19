export interface IGlobalRoleRepository {
    findByUserId(userId: string): Promise<string | null>;
    create(userId: string, roleName: string): Promise<void>;
    update(userId: string, roleName: string): Promise<void>;
    delete(userId: string): Promise<void>;
}
