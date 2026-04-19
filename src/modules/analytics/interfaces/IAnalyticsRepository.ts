import { ClubSnapshotEntity } from '../domain/ClubSnapshot.entity';
import { EventSnapshotEntity } from '../domain/EventSnapshot.entity';
import { GlobalSnapshotEntity } from '../domain/GlobalSnapshot.entity';

/**
 * Analytics Repository Interface
 * 
 * Snapshot verilerinin persistence katmanı
 */

export interface IAnalyticsRepository {
    // ==================== CLUB SNAPSHOTS ====================

    /**
     * Kulüp snapshot'ı kaydet
     */
    saveClubSnapshot(snapshot: ClubSnapshotEntity): Promise<void>;

    /**
     * Kulübün belirli tarih aralığındaki snapshot'larını getir
     */
    findClubSnapshotsByDateRange(
        clubId: string,
        startDate: Date,
        endDate: Date
    ): Promise<ClubSnapshotEntity[]>;

    /**
     * Kulübün son snapshot'ını getir
     */
    findLatestClubSnapshot(clubId: string): Promise<ClubSnapshotEntity | null>;

    /**
     * Kulübün belirli tarihteki snapshot'ını getir
     */
    findClubSnapshotByDate(clubId: string, date: Date): Promise<ClubSnapshotEntity | null>;

    // ==================== EVENT SNAPSHOTS ====================

    /**
     * Etkinlik snapshot'ı kaydet
     */
    saveEventSnapshot(snapshot: EventSnapshotEntity): Promise<void>;

    /**
     * Etkinliğin snapshot'ını getir
     */
    findEventSnapshotByDate(eventId: string, date: Date): Promise<EventSnapshotEntity | null>;

    /**
     * Kulübün tüm etkinliklerinin snapshot'larını getir
     */
    findEventSnapshotsByClubAndDateRange(
        clubId: string,
        startDate: Date,
        endDate: Date
    ): Promise<EventSnapshotEntity[]>;

    // ==================== GLOBAL SNAPSHOTS ====================

    /**
     * Global snapshot kaydet
     */
    saveGlobalSnapshot(snapshot: GlobalSnapshotEntity): Promise<void>;

    /**
     * Belirli tarih aralığındaki global snapshot'ları getir
     */
    findGlobalSnapshotsByDateRange(
        startDate: Date,
        endDate: Date
    ): Promise<GlobalSnapshotEntity[]>;

    /**
     * Son global snapshot'ı getir
     */
    findLatestGlobalSnapshot(): Promise<GlobalSnapshotEntity | null>;
}
