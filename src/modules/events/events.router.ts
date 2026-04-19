import { Router } from 'express';
import {
    createEvent,
    getAllEvents,
    getUpcomingEvents,
    getEventById,
    updateEvent,
    publishEvent,
    cancelEvent,
    generateQRCode
} from './controllers/events.controller';
import {
    attendEvent,
    leaveEvent,
    getEventAttendees,
    getMyAttendances,
    checkInQR,
    checkInGPS
} from './controllers/attendance.controller';
import { authMiddleware } from '../../core/middleware/auth.middleware';
import { loadGlobalRole } from '../../core/middleware/loadGlobalRole.middleware';
import { requireGlobalRole } from '../../core/middleware/rbac.middleware';

const router = Router();

// ==================== EVENT ROUTES ====================

// GET /api/v1/events - Yayınlanmış etkinlikler (PUBLIC)
router.get('/events', getAllEvents);

// GET /api/v1/events/upcoming - Yaklaşan etkinlikler (PUBLIC)
router.get('/events/upcoming', getUpcomingEvents);

// POST /api/v1/events - Etkinlik oluştur (CLUB_PRESIDENT)
// Not: Yetki kontrolü service katmanında (clubServicePublic.verifyUserHasRole)
router.post('/events', authMiddleware, createEvent);

// GET /api/v1/events/:id - Etkinlik detay (PUBLIC)
router.get('/events/:id', getEventById);

// PATCH /api/v1/events/:id - Etkinlik güncelle (CLUB_PRESIDENT)
router.patch('/events/:id', authMiddleware, updateEvent);

// PATCH /api/v1/events/:id/publish - Yayına al (CLUB_PRESIDENT)
router.patch('/events/:id/publish', authMiddleware, publishEvent);

// PATCH /api/v1/events/:id/cancel - İptal (CLUB_PRESIDENT)
router.patch('/events/:id/cancel', authMiddleware, cancelEvent);

// GET /api/v1/events/:id/qrcode - QR kod oluştur (CLUB_ADMIN)
router.get('/events/:id/qrcode', authMiddleware, generateQRCode);

// ==================== ATTENDANCE ROUTES ====================

// GET /api/v1/attendances/me - Kullanıcının katıldığı etkinlikler (AUTH)
router.get('/attendances/me', authMiddleware, getMyAttendances);

// POST /api/v1/events/:id/attend - Etkinliğe katıl (AUTH)
router.post('/events/:id/attend', authMiddleware, attendEvent);

// DELETE /api/v1/events/:id/leave - Etkinlikten ayrıl (AUTH)
router.delete('/events/:id/leave', authMiddleware, leaveEvent);

// GET /api/v1/events/:id/attendance - Katılımcı listesi (CLUB_PRESIDENT)
// Not: Yetki kontrolü service katmanında yapılabilir veya middleware eklenebilir
router.get('/events/:id/attendance', authMiddleware, getEventAttendees);

// POST /api/v1/events/:id/checkin/qr - QR yoklama (AUTH)
router.post('/events/:id/checkin/qr', authMiddleware, checkInQR);

// POST /api/v1/events/:id/checkin/gps - GPS yoklama (AUTH)
router.post('/events/:id/checkin/gps', authMiddleware, checkInGPS);

export { router as EventsRouter };
