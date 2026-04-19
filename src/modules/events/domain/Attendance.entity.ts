export type CheckInMethod = 'QR' | 'GPS' | 'MANUAL';

export class AttendanceEntity {
    constructor(
        public readonly eventId: string,
        public readonly userId: string, // Soft FK
        public readonly checkInMethod: CheckInMethod,
        public readonly joinedAt: Date
    ) { }

    // Factory method - Yeni katılım
    static create(params: {
        eventId: string;
        userId: string;
        checkInMethod: CheckInMethod;
    }): AttendanceEntity {
        return new AttendanceEntity(
            params.eventId,
            params.userId,
            params.checkInMethod,
            new Date()
        );
    }
}
