/**
 * GlobalSnapshot Entity
 * 
 * Sistem geneli istatistiklerin günlük snapshot'ı
 * SUPER_ADMIN dashboard için
 */

export interface GlobalSnapshotProps {
    id: string;
    snapshotDate: Date;
    totalUsers: number;
    activeUsers: number;
    totalClubs: number;
    activeClubs: number;
    totalEvents: number;
    publishedEvents: number;
    totalAttendances: number;
    averageEventCapacity: number;
    createdAt: Date;
}

export class GlobalSnapshotEntity {
    readonly id: string;
    readonly snapshotDate: Date;
    readonly totalUsers: number;
    readonly activeUsers: number;
    readonly totalClubs: number;
    readonly activeClubs: number;
    readonly totalEvents: number;
    readonly publishedEvents: number;
    readonly totalAttendances: number;
    readonly averageEventCapacity: number;
    readonly createdAt: Date;

    private constructor(props: GlobalSnapshotProps) {
        this.id = props.id;
        this.snapshotDate = props.snapshotDate;
        this.totalUsers = props.totalUsers;
        this.activeUsers = props.activeUsers;
        this.totalClubs = props.totalClubs;
        this.activeClubs = props.activeClubs;
        this.totalEvents = props.totalEvents;
        this.publishedEvents = props.publishedEvents;
        this.totalAttendances = props.totalAttendances;
        this.averageEventCapacity = props.averageEventCapacity;
        this.createdAt = props.createdAt;
    }

    /**
     * Factory method - Yeni snapshot oluştur
     */
    static create(props: Omit<GlobalSnapshotProps, 'id' | 'createdAt'>): GlobalSnapshotEntity {
        return new GlobalSnapshotEntity({
            ...props,
            id: '',
            createdAt: new Date()
        });
    }

    /**
     * Factory method - Mevcut snapshot'ı yükle
     */
    static fromPersistence(props: GlobalSnapshotProps): GlobalSnapshotEntity {
        return new GlobalSnapshotEntity(props);
    }

    /**
     * Aktif kullanıcı oranı
     */
    getActiveUserRate(): number {
        if (this.totalUsers === 0) return 0;
        return (this.activeUsers / this.totalUsers) * 100;
    }

    /**
     * Aktif kulüp oranı
     */
    getActiveClubRate(): number {
        if (this.totalClubs === 0) return 0;
        return (this.activeClubs / this.totalClubs) * 100;
    }

    /**
     * Yayınlanmış etkinlik oranı
     */
    getPublishedEventRate(): number {
        if (this.totalEvents === 0) return 0;
        return (this.publishedEvents / this.totalEvents) * 100;
    }

    /**
     * Kullanıcı başına ortalama katılım
     */
    getAverageAttendancePerUser(): number {
        if (this.activeUsers === 0) return 0;
        return this.totalAttendances / this.activeUsers;
    }

    /**
     * Kulüp başına ortalama etkinlik
     */
    getAverageEventsPerClub(): number {
        if (this.activeClubs === 0) return 0;
        return this.totalEvents / this.activeClubs;
    }
}
