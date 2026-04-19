import { v4 as uuidv4 } from 'uuid';
import { IEventRepository } from '../interfaces/IEventRepository';
import { IUserRepository } from '../../identity/interfaces/IUserRepository';
import { IClubServicePublic } from '../../clubs/interfaces/IClubServicePublic';
import { IMembershipRepository } from '../../clubs/interfaces/IMembershipRepository';
import { EventEntity } from '../domain/Event.entity';
import { AppError } from '../../infrastructure/errors/AppError';
import { IEventServicePublic } from '../interfaces/IEventServicePublic';
import { IAttendanceRepository } from '../interfaces/IAttendanceRepository';
import { QRCodeService } from './qrcode.service';
import { domainEvents } from '../../notifications/listeners/event.listener';

export interface CreateEventDto {
    clubId: string;
    title: string;
    description: string;
    capacity: number;
    location: string;
    latitude?: number;
    longitude?: number;
    startTime: Date;
    endTime: Date;
    createdByUserId: string;
}

export interface UpdateEventDto {
    title?: string;
    description?: string;
    capacity?: number;
    location?: string;
    latitude?: number;
    longitude?: number;
    startTime?: Date;
    endTime?: Date;
}

export class EventsService implements IEventServicePublic {
    private readonly qrCodeService: QRCodeService;

    constructor(
        private readonly eventRepository: IEventRepository,
        private readonly attendanceRepository: IAttendanceRepository,
        private readonly userRepository: IUserRepository,
        private readonly clubServicePublic: IClubServicePublic,
        private readonly membershipRepository: IMembershipRepository
    ) {
        this.qrCodeService = new QRCodeService();
    }

    // ==================== PUBLIC API (Cross-context) ====================

    async verifyEventExists(eventId: string): Promise<boolean> {
        const event = await this.eventRepository.findById(eventId);
        return event !== null && event.status === 'PUBLISHED';
    }

    async getEventTitle(eventId: string): Promise<string | null> {
        const event = await this.eventRepository.findById(eventId);
        return event ? event.title : null;
    }

    async isUserAttending(eventId: string, userId: string): Promise<boolean> {
        const attendance = await this.attendanceRepository.findByEventAndUser(eventId, userId);
        return attendance !== null;
    }

    // ==================== EVENT CRUD ====================

    async createEvent(dto: CreateEventDto): Promise<EventEntity> {
        // 1. Kulübün var olduğunu kontrol et (Soft FK)
        const clubExists = await this.clubServicePublic.verifyClubExists(dto.clubId);
        if (!clubExists) {
            throw AppError.notFound('Kulüp bulunamadı', 'CLUB_NOT_FOUND');
        }

        // 2. Kullanıcının kulüp başkanı olduğunu kontrol et
        const isPresident = await this.clubServicePublic.verifyUserHasRole(
            dto.clubId,
            dto.createdByUserId,
            'PRESIDENT'
        );
        if (!isPresident) {
            throw AppError.forbidden(
                'Sadece kulüp başkanı etkinlik oluşturabilir',
                'NOT_CLUB_PRESIDENT'
            );
        }

        // 3. Validation
        if (dto.startTime <= new Date()) {
            throw AppError.badRequest('Başlangıç tarihi gelecekte olmalı', 'INVALID_START_TIME');
        }

        if (dto.endTime <= dto.startTime) {
            throw AppError.badRequest(
                'Bitiş tarihi başlangıç tarihinden sonra olmalı',
                'INVALID_END_TIME'
            );
        }

        if (dto.capacity <= 0) {
            throw AppError.badRequest('Kapasite 0\'dan büyük olmalı', 'INVALID_CAPACITY');
        }

        // 4. Etkinlik oluştur (DRAFT)
        const event = EventEntity.create({
            id: uuidv4(),
            clubId: dto.clubId,
            title: dto.title,
            description: dto.description,
            capacity: dto.capacity,
            location: dto.location,
            latitude: dto.latitude,
            longitude: dto.longitude,
            startTime: dto.startTime,
            endTime: dto.endTime
        });

        await this.eventRepository.save(event);

        return event;
    }

    async getAllEvents(publishedOnly: boolean = true): Promise<EventEntity[]> {
        return await this.eventRepository.findAll(publishedOnly);
    }

    async getUpcomingEvents(limit: number = 10): Promise<EventEntity[]> {
        return await this.eventRepository.findUpcoming(limit);
    }

    async getEventById(eventId: string): Promise<EventEntity> {
        const event = await this.eventRepository.findById(eventId);

        if (!event) {
            throw AppError.notFound('Etkinlik bulunamadı', 'EVENT_NOT_FOUND');
        }

        return event;
    }

    async getClubEvents(clubId: string, publishedOnly: boolean = true): Promise<EventEntity[]> {
        return await this.eventRepository.findByClubId(clubId, publishedOnly);
    }

    async updateEvent(
        eventId: string,
        dto: UpdateEventDto,
        performedByUserId: string
    ): Promise<EventEntity> {
        // 1. Etkinliği bul
        const event = await this.eventRepository.findById(eventId);
        if (!event) {
            throw AppError.notFound('Etkinlik bulunamadı', 'EVENT_NOT_FOUND');
        }

        // 2. Yetki kontrolü - Sadece kulüp başkanı güncelleyebilir
        const isPresident = await this.clubServicePublic.verifyUserHasRole(
            event.clubId,
            performedByUserId,
            'PRESIDENT'
        );
        if (!isPresident) {
            throw AppError.forbidden(
                'Sadece kulüp başkanı etkinlik güncelleyebilir',
                'NOT_CLUB_PRESIDENT'
            );
        }

        // 3. Domain metodunu kullan (sadece DRAFT güncellenebilir)
        try {
            event.updateInfo(dto);
        } catch (error: any) {
            throw AppError.badRequest(error.message, 'UPDATE_FAILED');
        }

        // 4. Kaydet
        await this.eventRepository.update(event);

        return event;
    }

    async publishEvent(eventId: string, performedByUserId: string): Promise<EventEntity> {
        // 1. Etkinliği bul
        const event = await this.eventRepository.findById(eventId);
        if (!event) {
            throw AppError.notFound('Etkinlik bulunamadı', 'EVENT_NOT_FOUND');
        }

        // 2. Yetki kontrolü
        const isPresident = await this.clubServicePublic.verifyUserHasRole(
            event.clubId,
            performedByUserId,
            'PRESIDENT'
        );
        if (!isPresident) {
            throw AppError.forbidden(
                'Sadece kulüp başkanı etkinlik yayınlayabilir',
                'NOT_CLUB_PRESIDENT'
            );
        }

        // 3. Domain metodunu kullan (State Machine)
        try {
            event.publish();
        } catch (error: any) {
            throw AppError.badRequest(error.message, 'PUBLISH_FAILED');
        }

        // 4. Kaydet
        await this.eventRepository.update(event);

        return event;
    }

    async cancelEvent(eventId: string, performedByUserId: string): Promise<EventEntity> {
        // 1. Etkinliği bul
        const event = await this.eventRepository.findById(eventId);
        if (!event) {
            throw AppError.notFound('Etkinlik bulunamadı', 'EVENT_NOT_FOUND');
        }

        // 2. Yetki kontrolü
        const isPresident = await this.clubServicePublic.verifyUserHasRole(
            event.clubId,
            performedByUserId,
            'PRESIDENT'
        );
        if (!isPresident) {
            throw AppError.forbidden(
                'Sadece kulüp başkanı etkinlik iptal edebilir',
                'NOT_CLUB_PRESIDENT'
            );
        }

        // 3. Domain metodunu kullan (State Machine)
        try {
            event.cancel();
        } catch (error: any) {
            throw AppError.badRequest(error.message, 'CANCEL_FAILED');
        }

        // 4. Kaydet
        await this.eventRepository.update(event);

        // TODO: Faz 5 - Bildirim gönder (Outbox pattern)

        return event;
    }

    async completeEvent(eventId: string, performedByUserId: string): Promise<EventEntity> {
        // 1. Etkinliği bul
        const event = await this.eventRepository.findById(eventId);
        if (!event) {
            throw AppError.notFound('Etkinlik bulunamadı', 'EVENT_NOT_FOUND');
        }

        // 2. Yetki kontrolü
        const isPresident = await this.clubServicePublic.verifyUserHasRole(
            event.clubId,
            performedByUserId,
            'PRESIDENT'
        );
        if (!isPresident) {
            throw AppError.forbidden(
                'Sadece kulüp başkanı etkinlik tamamlayabilir',
                'NOT_CLUB_PRESIDENT'
            );
        }

        // 3. Domain metodunu kullan (State Machine)
        try {
            event.complete();
        } catch (error: any) {
            throw AppError.badRequest(error.message, 'COMPLETE_FAILED');
        }

        // 4. Kaydet
        await this.eventRepository.update(event);

        return event;
    }

    // ==================== QR CODE ====================

    /**
     * Etkinlik için QR kod oluştur
     * Sadece kulüp yöneticileri (PRESIDENT, VICE_PRESIDENT) oluşturabilir
     */
    async generateEventQRCode(eventId: string, userId: string): Promise<{
        qrCodeDataURL: string;
        expiresIn: number;
        eventTitle: string;
    }> {
        // 1. Etkinliği bul
        const event = await this.eventRepository.findById(eventId);
        if (!event) {
            throw AppError.notFound('Etkinlik bulunamadı', 'EVENT_NOT_FOUND');
        }

        // 2. Yetki kontrolü - Kulübün yöneticisi olmalı
        const membership = await this.membershipRepository.findByClubAndUser(
            event.clubId,
            userId
        );

        if (!membership || !membership.hasMinimumRole('VICE_PRESIDENT')) {
            throw AppError.forbidden(
                'Sadece kulüp yöneticileri QR kod oluşturabilir',
                'NOT_CLUB_ADMIN'
            );
        }

        // 3. Etkinlik durumu kontrolü
        if (event.status !== 'PUBLISHED') {
            throw AppError.badRequest(
                'Sadece yayınlanmış etkinlikler için QR kod oluşturulabilir',
                'EVENT_NOT_PUBLISHED'
            );
        }

        // 4. QR kod oluştur
        const qrCodeDataURL = await this.qrCodeService.generateQRCode(
            event.id,
            event.title
        );

        // 5. Kalan süreyi hesapla
        const expiresIn = this.qrCodeService.getRemainingTime();

        return {
            qrCodeDataURL,
            expiresIn,
            eventTitle: event.title
        };
    }
}
