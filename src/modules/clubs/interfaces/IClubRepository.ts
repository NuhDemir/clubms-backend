import { ClubEntity } from '../domain/Club.entity';

export interface IClubRepository {
    findById(id: string): Promise<ClubEntity | null>;
    findByName(name: string): Promise<ClubEntity | null>;
    findAll(activeOnly?: boolean): Promise<ClubEntity[]>;
    save(club: ClubEntity): Promise<void>;
    update(club: ClubEntity): Promise<void>;
    delete(id: string): Promise<void>;
}
