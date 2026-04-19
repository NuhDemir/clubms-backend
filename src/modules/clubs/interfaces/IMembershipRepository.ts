import { MembershipEntity } from '../domain/Membership.entity';

export interface IMembershipRepository {
    findById(id: string): Promise<MembershipEntity | null>;
    findByClubAndUser(clubId: string, userId: string): Promise<MembershipEntity | null>;
    findByClubId(clubId: string): Promise<MembershipEntity[]>;
    findByUserId(userId: string): Promise<MembershipEntity[]>;
    findPendingByClubId(clubId: string): Promise<MembershipEntity[]>;
    save(membership: MembershipEntity): Promise<void>;
    update(membership: MembershipEntity): Promise<void>;
    delete(clubId: string, userId: string): Promise<void>;
    countActiveMembers(clubId: string): Promise<number>;
}
