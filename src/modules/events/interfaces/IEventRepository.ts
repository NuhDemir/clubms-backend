import { EventEntity } from '../domain/Event.entity';

export interface IEventRepository {
    findById(id: string): Promise<EventEntity | null>;
    findByClubId(clubId: string, publishedOnly?: boolean): Promise<EventEntity[]>;
    findAll(publishedOnly?: boolean): Promise<EventEntity[]>;
    findUpcoming(limit?: number): Promise<EventEntity[]>;
    save(event: EventEntity): Promise<void>;
    update(event: EventEntity): Promise<void>;

    /**
     * Optimistic Locking ile güncelleme
     * @returns true if update successful, false if version mismatch
     */
    updateWithOptimisticLock(event: EventEntity, expectedVersion: number): Promise<boolean>;

    delete(id: string): Promise<void>;
}
