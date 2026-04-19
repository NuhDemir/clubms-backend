/**
 * EventSnapshot Entity
 * 
 * Etkinlik istatistiklerinin günlük snapshot'ı
 */

export interface EventSnapshotProps {
    id: string;
    eventId: string;
    snapshotDate: Date;
    capacity: number;
    totalAttendees: number;
    attendanceRate: number;
    checkInQRCount: number;
    checkInGPSCount: number;
    checkInManualCount: number;
    createdAt: Date;
}

export class EventSnapshotEntity {
    readonly id: string;
    readonly eventId: string;
    readonly snapshotDate: Date;
    readonly capacity: number;
    readonly totalAttendees: number;
    readonly attendanceRate: number;
    readonly checkInQRCount: number;
    readonly checkInGPSCount: number;
    readonly checkInManualCount: number;
    readonly createdAt: Date;

    private constructor(props: EventSnapshotProps) {
        this.id = props.id;
        this.eventId = props.eventId;
        this.snapshotDate = props.snapshotDate;
        this.capacity = props.capacity;
        this.totalAttendees = props.totalAttendees;
        this.attendanceRate = props.attendanceRate;
        this.checkInQRCount = props.checkInQRCount;
        this.checkInGPSCount = props.checkInGPSCount;
        this.checkInManualCount = props.checkInManualCount;
        this.createdAt = props.createdAt;
    }

    /**
     * Factory method - Yeni snapshot oluştur
     */
    static create(props: Omit<EventSnapshotProps, 'id' | 'createdAt'>): EventSnapshotEntity {
        return new EventSnapshotEntity({
            ...props,
            id: '',
            createdAt: new Date()
        });
    }

    /**
     * Factory method - Mevcut snapshot'ı yükle
     */
    static fromPersistence(props: EventSnapshotProps): EventSnapshotEntity {
        return new EventSnapshotEntity(props);
    }

    /**
     * Etkinlik dolu mu?
     */
    isFull(): boolean {
        return this.totalAttendees >= this.capacity;
    }

    /**
     * Doluluk oranı
     */
    getOccupancyRate(): number {
        if (this.capacity === 0) return 0;
        return (this.totalAttendees / this.capacity) * 100;
    }

    /**
     * En popüler check-in metodu
     */
    getMostPopularCheckInMethod(): 'QR' | 'GPS' | 'MANUAL' | 'NONE' {
        const max = Math.max(this.checkInQRCount, this.checkInGPSCount, this.checkInManualCount);

        if (max === 0) return 'NONE';
        if (max === this.checkInQRCount) return 'QR';
        if (max === this.checkInGPSCount) return 'GPS';
        return 'MANUAL';
    }
}
