import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { AppError } from '../../infrastructure/errors/AppError';

/**
 * Analytics Controller
 * 
 * Dashboard ve istatistik endpoint'leri
 */

export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    /**
     * GET /api/v1/analytics/clubs/:clubId/summary
     * Kulüp analytics özeti (başkan dashboard)
     * 
     * Authorization: PRESIDENT, VICE_PRESIDENT, MEMBER (kendi kulübü)
     */
    getClubSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { clubId } = req.params;

            if (!clubId || typeof clubId !== 'string') {
                throw AppError.badRequest('clubId parametresi gerekli', 'INVALID_CLUB_ID');
            }

            const summary = await this.analyticsService.getClubAnalyticsSummary(clubId);

            res.status(200).json({
                success: true,
                data: summary
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/analytics/clubs/:clubId/trends/membership
     * Kulüp üyelik trend grafiği
     * 
     * Query params:
     * - days: number (default: 30)
     */
    getClubMembershipTrend = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { clubId } = req.params;
            const days = parseInt(req.query.days as string) || 30;

            if (!clubId || typeof clubId !== 'string') {
                throw AppError.badRequest('clubId parametresi gerekli', 'INVALID_CLUB_ID');
            }

            if (days < 1 || days > 365) {
                throw AppError.badRequest('days parametresi 1-365 arasında olmalı', 'INVALID_DAYS');
            }

            const trend = await this.analyticsService.getClubMembershipTrend(clubId, days);

            res.status(200).json({
                success: true,
                data: {
                    clubId,
                    days,
                    trend
                }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/analytics/clubs/:clubId/trends/events
     * Kulüp etkinlik trend grafiği
     */
    getClubEventTrend = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { clubId } = req.params;
            const days = parseInt(req.query.days as string) || 30;

            if (!clubId || typeof clubId !== 'string') {
                throw AppError.badRequest('clubId parametresi gerekli', 'INVALID_CLUB_ID');
            }

            if (days < 1 || days > 365) {
                throw AppError.badRequest('days parametresi 1-365 arasında olmalı', 'INVALID_DAYS');
            }

            const trend = await this.analyticsService.getClubEventTrend(clubId, days);

            res.status(200).json({
                success: true,
                data: {
                    clubId,
                    days,
                    trend
                }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/analytics/events/:eventId/summary
     * Etkinlik analytics özeti
     * 
     * Authorization: PRESIDENT, VICE_PRESIDENT (kulüp yöneticileri)
     */
    getEventSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { eventId } = req.params;

            if (!eventId || typeof eventId !== 'string') {
                throw AppError.badRequest('eventId parametresi gerekli', 'INVALID_EVENT_ID');
            }

            const summary = await this.analyticsService.getEventAnalyticsSummary(eventId);

            res.status(200).json({
                success: true,
                data: summary
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/analytics/events/top
     * En popüler etkinlikler (katılım oranına göre)
     * 
     * Query params:
     * - limit: number (default: 10)
     * 
     * Authorization: AUTH (tüm kullanıcılar)
     */
    getTopEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const limit = parseInt(req.query.limit as string) || 10;

            if (limit < 1 || limit > 50) {
                throw AppError.badRequest('limit parametresi 1-50 arasında olmalı', 'INVALID_LIMIT');
            }

            const topEvents = await this.analyticsService.getTopEventsByAttendance(limit);

            res.status(200).json({
                success: true,
                data: {
                    limit,
                    events: topEvents
                }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/analytics/global/summary
     * Global sistem istatistikleri
     * 
     * Authorization: SUPER_ADMIN
     */
    getGlobalSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const summary = await this.analyticsService.getGlobalAnalyticsSummary();

            res.status(200).json({
                success: true,
                data: summary
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/analytics/global/trends/users
     * Global kullanıcı trend grafiği
     * 
     * Authorization: SUPER_ADMIN
     */
    getGlobalUserTrend = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const days = parseInt(req.query.days as string) || 30;

            if (days < 1 || days > 365) {
                throw AppError.badRequest('days parametresi 1-365 arasında olmalı', 'INVALID_DAYS');
            }

            const trend = await this.analyticsService.getGlobalUserTrend(days);

            res.status(200).json({
                success: true,
                data: {
                    days,
                    trend
                }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/v1/analytics/snapshots/generate
     * Manuel snapshot oluştur (test/debug için)
     * 
     * Authorization: SUPER_ADMIN
     */
    generateSnapshots = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const today = new Date();

            // Global snapshot
            await this.analyticsService.generateGlobalSnapshot(today);

            // Club snapshots
            await this.analyticsService.generateDailyClubSnapshots(today);

            // Event snapshots
            await this.analyticsService.generateDailyEventSnapshots(today);

            res.status(200).json({
                success: true,
                message: 'Snapshotlar başarıyla oluşturuldu',
                data: {
                    date: today
                }
            });
        } catch (error) {
            next(error);
        }
    };
}
