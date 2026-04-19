/**
 * ClubSnapshot Entity
 * 
 * Kulüp istatistiklerinin günlük snapshot'ı
 * Snapshot Pattern: Zaman içinde değişen verilerin anlık görüntüsü
 */

export interface ClubSnapshotProps {
    id: string;
    clubId: string;
    snapshotDate: Date;
    totalMembers: number;
    activeMembersCount: number;
    pendingApplications: number;
    totalEvents: number;
    publishedEvents: number;
    completedEvents: number;
    totalAttendances: number;
    averageAttendanceRate: number;
    growthRate?: number;
    createdAt: Date;
}

export class ClubSnapshotEntity {
    readonly id: string;
    readonly clubId: string;
    readonly snapshotDate: Date;
    readonly totalMembers: number;
    readonly activeMembersCount: number;
    readonly pendingApplications: number;
    readonly totalEvents: number;
    readonly publishedEvents: number;
    readonly completedEvents: number;
    readonly totalAttendances: number;
    readonly averageAttendanceRate: number;
    readonly growthRate?: number;
    readonly createdAt: Date;

    private constructor(props: ClubSnapshotProps) {
        this.id = props.id;
        this.clubId = props.clubId;
        this.snapshotDate = props.snapshotDate;
        this.totalMembers = props.totalMembers;
        this.activeMembersCount = props.activeMembersCount;
        this.pendingApplications = props.pendingApplications;
        this.totalEvents = props.totalEvents;
        this.publishedEvents = props.publishedEvents;
        this.completedEvents = props.completedEvents;
        this.totalAttendances = props.totalAttendances;
        this.averageAttendanceRate = props.averageAttendanceRate;
        this.growthRate = props.growthRate;
        this.createdAt = props.createdAt;
    }

    /**
     * Factory method - Yeni snapshot oluştur
     */
    static create(props: Omit<ClubSnapshotProps, 'id' | 'createdAt'>): ClubSnapshotEntity {
        return new ClubSnapshotEntity({
            ...props,
            id: '', // Repository tarafından set edilecek
            createdAt: new Date()
        });
    }

    /**
     * Factory method - Mevcut snapshot'ı yükle
     */
    static fromPersistence(props: ClubSnapshotProps): ClubSnapshotEntity {
        return new ClubSnapshotEntity(props);
    }

    /**
     * Kulüp büyüyor mu?
     */
    isGrowing(): boolean {
        return this.growthRate !== undefined && this.growthRate > 0;
    }

    /**
     * Aktif üye oranı
     */
    getActiveMemberRate(): number {
        if (this.totalMembers === 0) return 0;
        return (this.activeMembersCount / this.totalMembers) * 100;
    }

    /**
     * Etkinlik tamamlanma oranı
     */
    getEventCompletionRate(): number {
        if (this.totalEvents === 0) return 0;
        return (this.completedEvents / this.totalEvents) * 100;
    }

    /**
     * Ortalama etkinlik doluluk oranı
     */
    getAverageAttendanceRate(): number {
        return this.averageAttendanceRate;
    }
}
