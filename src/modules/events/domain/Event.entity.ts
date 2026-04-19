export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';

export class EventEntity {
    constructor(
        public readonly id: string,
        public readonly clubId: string, // Soft FK
        private _title: string,
        private _description: string,
        private _capacity: number,
        private _currentAttendees: number,
        private _version: number,
        private _location: string,
        private _latitude: number | null,
        private _longitude: number | null,
        private _startTime: Date,
        private _endTime: Date,
        private _status: EventStatus,
        public readonly createdAt: Date
    ) { }

    // Getters
    get title(): string { return this._title; }
    get description(): string { return this._description; }
    get capacity(): number { return this._capacity; }
    get currentAttendees(): number { return this._currentAttendees; }
    get version(): number { return this._version; }
    get location(): string { return this._location; }
    get latitude(): number | null { return this._latitude; }
    get longitude(): number | null { return this._longitude; }
    get startTime(): Date { return this._startTime; }
    get endTime(): Date { return this._endTime; }
    get status(): EventStatus { return this._status; }

    // Business Logic - State Machine Validation
    private validateStateTransition(newStatus: EventStatus): void {
        const validTransitions: Record<EventStatus, EventStatus[]> = {
            'DRAFT': ['PUBLISHED'],
            'PUBLISHED': ['CANCELLED', 'COMPLETED'],
            'CANCELLED': [], // Terminal state
            'COMPLETED': []  // Terminal state
        };

        const allowedTransitions = validTransitions[this._status];
        if (!allowedTransitions.includes(newStatus)) {
            throw new Error(
                `Geçersiz durum geçişi: ${this._status} → ${newStatus}. İzin verilen: ${allowedTransitions.join(', ')}`
            );
        }
    }

    // Business Logic - Kapasite kontrolü
    canAcceptAttendee(): boolean {
        return (
            this._status === 'PUBLISHED' &&
            this._currentAttendees < this._capacity &&
            new Date() < this._startTime // Etkinlik başlamamış olmalı
        );
    }

    // Business Logic - Katılımcı ekle (Optimistic Lock için)
    incrementAttendees(): void {
        if (!this.canAcceptAttendee()) {
            throw new Error('Etkinlik katılıma kapalı');
        }
        this._currentAttendees++;
        this._version++; // Optimistic lock version
    }

    // Business Logic - Katılımcı çıkar
    decrementAttendees(): void {
        if (this._currentAttendees <= 0) {
            throw new Error('Katılımcı sayısı zaten 0');
        }
        this._currentAttendees--;
        this._version++;
    }

    // Business Logic - Etkinliği yayınla
    publish(): void {
        this.validateStateTransition('PUBLISHED');

        // Validation: Gelecek tarihli olmalı
        if (this._startTime <= new Date()) {
            throw new Error('Sadece gelecek tarihli etkinlikler yayınlanabilir');
        }

        // Validation: Bitiş tarihi başlangıçtan sonra olmalı
        if (this._endTime <= this._startTime) {
            throw new Error('Bitiş tarihi başlangıç tarihinden sonra olmalı');
        }

        this._status = 'PUBLISHED';
    }

    // Business Logic - Etkinliği iptal et
    cancel(): void {
        this.validateStateTransition('CANCELLED');
        this._status = 'CANCELLED';
    }

    // Business Logic - Etkinliği tamamla
    complete(): void {
        this.validateStateTransition('COMPLETED');

        // Validation: Bitiş tarihi geçmiş olmalı
        if (new Date() < this._endTime) {
            throw new Error('Etkinlik henüz bitmedi');
        }

        this._status = 'COMPLETED';
    }

    // Business Logic - Etkinlik güncellenebilir mi?
    canBeUpdated(): boolean {
        return this._status === 'DRAFT';
    }

    // Business Logic - Etkinlik bilgilerini güncelle
    updateInfo(params: {
        title?: string;
        description?: string;
        capacity?: number;
        location?: string;
        latitude?: number | null;
        longitude?: number | null;
        startTime?: Date;
        endTime?: Date;
    }): void {
        if (!this.canBeUpdated()) {
            throw new Error('Sadece taslak etkinlikler güncellenebilir');
        }

        if (params.title !== undefined) this._title = params.title;
        if (params.description !== undefined) this._description = params.description;
        if (params.location !== undefined) this._location = params.location;
        if (params.latitude !== undefined) this._latitude = params.latitude;
        if (params.longitude !== undefined) this._longitude = params.longitude;
        if (params.startTime !== undefined) this._startTime = params.startTime;
        if (params.endTime !== undefined) this._endTime = params.endTime;

        // Kapasite güncellemesi - mevcut katılımcıdan az olamaz
        if (params.capacity !== undefined) {
            if (params.capacity < this._currentAttendees) {
                throw new Error('Kapasite mevcut katılımcı sayısından az olamaz');
            }
            this._capacity = params.capacity;
        }
    }

    // Business Logic - Check-in yapılabilir mi?
    canCheckIn(): boolean {
        if (this._status !== 'PUBLISHED') return false;

        const now = new Date();
        // Check-in: Etkinlik başlamadan 30 dk önce - bitiş saatine kadar
        const checkInStart = new Date(this._startTime.getTime() - 30 * 60 * 1000);
        const checkInEnd = this._endTime;

        return now >= checkInStart && now <= checkInEnd;
    }

    // Factory method - Yeni etkinlik oluştur (DRAFT)
    static create(params: {
        id: string;
        clubId: string;
        title: string;
        description: string;
        capacity: number;
        location: string;
        latitude?: number;
        longitude?: number;
        startTime: Date;
        endTime: Date;
    }): EventEntity {
        return new EventEntity(
            params.id,
            params.clubId,
            params.title,
            params.description,
            params.capacity,
            0, // currentAttendees başlangıçta 0
            1, // version başlangıçta 1
            params.location,
            params.latitude || null,
            params.longitude || null,
            params.startTime,
            params.endTime,
            'DRAFT',
            new Date()
        );
    }
}
