import { Router } from 'express';
import { AnalyticsController } from './controllers/analytics.controller';
import { authMiddleware } from '../../core/middleware/auth.middleware';
import { requireGlobalRole, requireMinClubRole } from '../../core/middleware/rbac.middleware';
import { loadClubRole } from '../../core/middleware/loadClubRole.middleware';

export const createAnalyticsRouter = (analyticsController: AnalyticsController): Router => {
    const router = Router();

    // ==================== CLUB ANALYTICS ====================

    /**
     * GET /clubs/:clubId/summary
     * Kulüp analytics özeti
     * Authorization: Kulüp üyesi olmalı
     */
    router.get(
        '/clubs/:clubId/summary',
        authMiddleware,
        loadClubRole(),
        requireMinClubRole('MEMBER'),
        analyticsController.getClubSummary
    );

    /**
     * GET /clubs/:clubId/trends/membership
     * Kulüp üyelik trend grafiği
     * Authorization: Kulüp üyesi olmalı
     */
    router.get(
        '/clubs/:clubId/trends/membership',
        authMiddleware,
        loadClubRole(),
        requireMinClubRole('MEMBER'),
        analyticsController.getClubMembershipTrend
    );

    /**
     * GET /clubs/:clubId/trends/events
     * Kulüp etkinlik trend grafiği
     * Authorization: Kulüp üyesi olmalı
     */
    router.get(
        '/clubs/:clubId/trends/events',
        authMiddleware,
        loadClubRole(),
        requireMinClubRole('MEMBER'),
        analyticsController.getClubEventTrend
    );

    // ==================== EVENT ANALYTICS ====================

    /**
     * GET /events/:eventId/summary
     * Etkinlik analytics özeti
     * Authorization: Etkinliğin kulübünün yöneticisi olmalı
     */
    router.get(
        '/events/:eventId/summary',
        authMiddleware,
        analyticsController.getEventSummary
    );

    /**
     * GET /events/top
     * En popüler etkinlikler
     * Authorization: Tüm kullanıcılar
     */
    router.get(
        '/events/top',
        authMiddleware,
        analyticsController.getTopEvents
    );

    // ==================== GLOBAL ANALYTICS ====================

    /**
     * GET /global/summary
     * Global sistem istatistikleri
     * Authorization: SUPER_ADMIN
     */
    router.get(
        '/global/summary',
        authMiddleware,
        requireGlobalRole('SUPER_ADMIN'),
        analyticsController.getGlobalSummary
    );

    /**
     * GET /global/trends/users
     * Global kullanıcı trend grafiği
     * Authorization: SUPER_ADMIN
     */
    router.get(
        '/global/trends/users',
        authMiddleware,
        requireGlobalRole('SUPER_ADMIN'),
        analyticsController.getGlobalUserTrend
    );

    // ==================== ADMIN OPERATIONS ====================

    /**
     * POST /snapshots/generate
     * Manuel snapshot oluştur
     * Authorization: SUPER_ADMIN
     */
    router.post(
        '/snapshots/generate',
        authMiddleware,
        requireGlobalRole('SUPER_ADMIN'),
        analyticsController.generateSnapshots
    );

    return router;
};
