import { IAttendanceRepository } from '../interfaces/IAttendanceRepository';
import { IEventRepository } from '../interfaces/IEventRepository';
import { IUserRepository } from '../../identity/interfaces/IUserRepository';
import { AttendanceEntity, CheckInMethod } from '../domain/Attendance.entity';
import { AppError } from '../../infrastructure/errors/AppError';

export interface AttendEventDto {
    eventId: string;
    userId: string;
    checkInMethod: CheckInMethod;
}

export interface CheckInQRDto {
    eventId: string;
    userId: string;
    qrCode: string; // QR code payload
}

export interface CheckInGPSDto {
    eventId: string;
    userId: string;
    userLatitude: number;
    userLongitude: number;
}

export class AttendanceService {
    constructor(
        private readonly attendanceRepository: IAttendanceRepository,
        private readonly eventRepository: IEventRepository,
        private readonly userRepository: IUserRepository
    ) { }

    // ==================== ATTENDANCE CRUD ====================

    async attendEvent(dto: AttendEventDto): Promise<AttendanceEntity> {
        // 1. Kullanıcının var olduğunu kontrol et (Soft FK)
        const user = await this.userRepository.findById(dto.userId);
        if (!user) {
            throw AppError.notFound('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
        }

        // 2. Etkinliği bul
        const event = await this.eventRepository.findById(dto.eventId);
        if (!event) {
            throw AppError.notFound('Etkinlik bulunamadı', 'EVENT_NOT_FOUND');
        }

        // 3. Zaten katılmış mı kontrol et
        const existingAttendance = await this.attendanceRepository.findByEventAndUser(
            dto.eventId,
            dto.userId
        );
        if (existingAttendance) {
            throw AppError.conflict('Zaten bu etkinliğe katıldınız', 'ALREADY_ATTENDING');
        }

        // 4. Optimistic Locking ile kapasite kontrolü ve katılım
        const maxRetries = 3;
        let retryCount = 0;

        while (retryCount < maxRetries) {
            // Güncel event'i al
            const currentEvent = await this.eventRepository.findById(dto.eventId);
            if (!currentEvent) {
                throw AppError.notFound('Etkinlik bulunamadı', 'EVENT_NOT_FOUND');
            }

            // Domain kontrolü
            if (!currentEvent.canAcceptAttendee()) {
                throw AppError.badRequest('Etkinlik katılıma kapalı', 'EVENT_FULL_OR_CLOSED');
            }

            // Version'ı sakla
            const expectedVersion = currentEvent.version;

            // Domain metodunu kullan (version artırır)
            currentEvent.incrementAttendees();

            // Optimistic Lock ile güncelle
            const success = await this.eventRepository.updateWithOptimisticLock(
                currentEvent,
                expectedVersion
            );

            if (success) {
                // Başarılı - Attendance kaydı oluştur
                const attendance = AttendanceEntity.create({
                    eventId: dto.eventId,
                    userId: dto.userId,
                    checkInMethod: dto.checkInMethod
                });

                await this.attendanceRepository.save(attendance);

                return attendance;
            }

            // Version mismatch - Retry
            retryCount++;
            if (retryCount >= maxRetries) {
                throw AppError.conflict(
                    'Etkinlik çok yoğun, lütfen tekrar deneyin',
                    'OPTIMISTIC_LOCK_FAILED'
                );
            }

            // Kısa bir bekleme
            await new Promise(resolve => setTimeout(resolve, 100 * retryCount));
        }

        throw AppError.internal('Beklenmeyen hata');
    }

    async leaveEvent(eventId: string, userId: string): Promise<void> {
        // 1. Attendance kaydını bul
        const attendance = await this.attendanceRepository.findByEventAndUser(eventId, userId);
        if (!attendance) {
            throw AppError.notFound('Katılım kaydı bulunamadı', 'ATTENDANCE_NOT_FOUND');
        }

        // 2. Etkinliği bul
        const event = await this.eventRepository.findById(eventId);
        if (!event) {
            throw AppError.notFound('Etkinlik bulunamadı', 'EVENT_NOT_FOUND');
        }

        // 3. Etkinlik başlamışsa ayrılamaz
        if (new Date() >= event.startTime) {
            throw AppError.badRequest(
                'Başlamış etkinlikten ayrılamazsınız',
                'EVENT_ALREADY_STARTED'
            );
        }

        // 4. Domain metodunu kullan
        event.decrementAttendees();

        // 5. Güncelle ve sil
        await this.eventRepository.update(event);
        await this.attendanceRepository.delete(eventId, userId);
    }

    async getEventAttendees(eventId: string): Promise<AttendanceEntity[]> {
        // Etkinliğin var olduğunu kontrol et
        const event = await this.eventRepository.findById(eventId);
        if (!event) {
            throw AppError.notFound('Etkinlik bulunamadı', 'EVENT_NOT_FOUND');
        }

        return await this.attendanceRepository.findByEventId(eventId);
    }

    async getUserAttendances(userId: string): Promise<AttendanceEntity[]> {
        return await this.attendanceRepository.findByUserId(userId);
    }

    // ==================== CHECK-IN METHODS ====================

    async checkInQR(dto: CheckInQRDto): Promise<AttendanceEntity> {
        // 1. QR code validation (basit örnek - production'da JWT veya signed token kullanılmalı)
        const expectedQRCode = `EVENT:${dto.eventId}`;
        if (dto.qrCode !== expectedQRCode) {
            throw AppError.badRequest('Geçersiz QR kod', 'INVALID_QR_CODE');
        }

        // 2. Etkinliği bul
        const event = await this.eventRepository.findById(dto.eventId);
        if (!event) {
            throw AppError.notFound('Etkinlik bulunamadı', 'EVENT_NOT_FOUND');
        }

        // 3. Check-in zamanı kontrolü
        if (!event.canCheckIn()) {
            throw AppError.badRequest(
                'Check-in zamanı dışında (30 dk önce - bitiş saati)',
                'CHECKIN_TIME_INVALID'
            );
        }

        // 4. Katılım kaydı oluştur
        return await this.attendEvent({
            eventId: dto.eventId,
            userId: dto.userId,
            checkInMethod: 'QR'
        });
    }

    async checkInGPS(dto: CheckInGPSDto): Promise<AttendanceEntity> {
        // 1. Etkinliği bul
        const event = await this.eventRepository.findById(dto.eventId);
        if (!event) {
            throw AppError.notFound('Etkinlik bulunamadı', 'EVENT_NOT_FOUND');
        }

        // 2. Check-in zamanı kontrolü
        if (!event.canCheckIn()) {
            throw AppError.badRequest(
                'Check-in zamanı dışında (30 dk önce - bitiş saati)',
                'CHECKIN_TIME_INVALID'
            );
        }

        // 3. GPS koordinatları var mı?
        if (event.latitude === null || event.longitude === null) {
            throw AppError.badRequest(
                'Bu etkinlik için GPS check-in desteklenmiyor',
                'GPS_NOT_SUPPORTED'
            );
        }

        // 4. Mesafe hesapla (Haversine formula)
        const distance = this.calculateDistance(
            dto.userLatitude,
            dto.userLongitude,
            event.latitude,
            event.longitude
        );

        // 5. Maksimum 100 metre içinde olmalı
        const MAX_DISTANCE_METERS = 100;
        if (distance > MAX_DISTANCE_METERS) {
            throw AppError.badRequest(
                `Etkinlik konumuna çok uzaksınız (${Math.round(distance)}m). Maksimum ${MAX_DISTANCE_METERS}m olmalı.`,
                'GPS_TOO_FAR'
            );
        }

        // 6. Katılım kaydı oluştur
        return await this.attendEvent({
            eventId: dto.eventId,
            userId: dto.userId,
            checkInMethod: 'GPS'
        });
    }

    // Haversine formula - İki GPS koordinatı arası mesafe (metre)
    private calculateDistance(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ): number {
        const R = 6371e3; // Earth radius in meters
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lon2 - lon1) * Math.PI) / 180;

        const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    }
}
