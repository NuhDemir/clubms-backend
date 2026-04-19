import { PrismaClient } from '@prisma/client';
import { IAnalyticsRepository } from '../interfaces/IAnalyticsRepository';
import { ClubSnapshotEntity } from '../domain/ClubSnapshot.entity';
import { EventSnapshotEntity } from '../domain/EventSnapshot.entity';
import { GlobalSnapshotEntity } from '../domain/GlobalSnapshot.entity';
import { AppError } from '../../infrastructure/errors/AppError';

/**
 * Analytics Service
 * 
 * İstatistik hesaplama ve snapshot oluşturma
 * Cron job tarafından günlük çağrılır
 */

export interface ClubAnalyticsSummary {
    clubId: string;
    clubName: string;
    totalMembers: number;
    activeMembersCount: number;
    pendingApplications: number;
    totalEvents: number;
    publishedEvents: number;
    completedEvents: number;
    totalAttendances: number;
    averageAttendanceRate: number;
    growthRate?: number;
    activeMemberRate: number;
    eventCompletionRate: number;
}

export interface EventAnalyticsSummary {
    eventId: string;
    eventTitle: string;
    capacity: number;
    totalAttendees: number;
    attendanceRate: number;
    checkInMethods: {
        qr: number;
        gps: number;
        manual: number;
    };
    mostPopularMethod: string;
    isFull: boolean;
}

export interface GlobalAnalyticsSummary {
    totalUsers: number;
    activeUsers: number;
    totalClubs: number;
    activeClubs: number;
    totalEvents: number;
    publishedEvents: number;
    totalAttendances: number;
    averageEventCapacity: number;
    activeUserRate: number;
    activeClubRate: number;
    publishedEventRate: number;
    averageAttendancePerUser: number;
    averageEventsPerClub: number;
}

export interface TrendData {
    date: Date;
    value: number;
}

export class AnalyticsService {
    constructor(
        private readonly analyticsRepository: IAnalyticsRepository,
        private readonly prisma: PrismaClient
    ) { }

    // ==================== SNAPSHOT GENERATION ====================

    /**
     * Tüm kulüpler için günlük snapshot oluştur
     * Cron job tarafından çağrılır
     */
    async generateDailyClubSnapshots(date: Date = new Date()): Promise<void> {
        console.log(`📊 Generating club snapshots for ${date.toISOString()}`);

        // Tüm aktif kulüpleri getir
        const clubs = await this.prisma.clubsClub.findMany({
            where: { isActive: true }
        });

        for (const club of clubs) {
            try {
                await this.generateClubSnapshot(club.id, date);
                console.log(`✅ Club snapshot generated: ${club.name}`);
            } catch (error: any) {
                console.error(`❌ Failed to generate snapshot for club ${club.id}:`, error.message);
            }
        }

        console.log(`✅ Club snapshots generation completed`);
    }

    /**
     * Tek bir kulüp için snapshot oluştur
     */
    async generateClubSnapshot(clubId: string, date: Date = new Date()): Promise<ClubSnapshotEntity> {
        // Kulübün var olduğunu kontrol et
        const club = await this.prisma.clubsClub.findUnique({
            where: { id: clubId }
        });

        if (!club) {
            throw AppError.notFound('Kulüp bulunamadı', 'CLUB_NOT_FOUND');
        }

        // Üyelik istatistikleri
        const memberships = await this.prisma.clubsMembership.findMany({
            where: { clubId }
        });

        const totalMembers = memberships.length;
        const activeMembersCount = memberships.filter(m => m.role !== 'PENDING').length;
        const pendingApplications = memberships.filter(m => m.role === 'PENDING').length;

        // Etkinlik istatistikleri
        const events = await this.prisma.eventsEvent.findMany({
            where: { clubId }
        });

        const totalEvents = events.length;
        const publishedEvents = events.filter(e => e.status === 'PUBLISHED').length;
        const completedEvents = events.filter(e => e.status === 'COMPLETED').length;

        // Katılım istatistikleri
        const eventIds = events.map(e => e.id);
        const attendances = await this.prisma.eventsAttendance.findMany({
            where: { eventId: { in: eventIds } }
        });

        const totalAttendances = attendances.length;

        // Ortalama katılım oranı hesapla
        let averageAttendanceRate = 0;
        if (completedEvents > 0) {
            const completedEventIds = events
                .filter(e => e.status === 'COMPLETED')
                .map(e => e.id);

            const completedEventAttendances = await this.prisma.eventsAttendance.groupBy({
                by: ['eventId'],
                where: { eventId: { in: completedEventIds } },
                _count: { userId: true }
            });

            const completedEventsData = await this.prisma.eventsEvent.findMany({
                where: { id: { in: completedEventIds } },
                select: { id: true, capacity: true }
            });

            const rates = completedEventsData.map(event => {
                const attendance = completedEventAttendances.find(a => a.eventId === event.id);
                const attendeeCount = attendance?._count.userId || 0;
                return event.capacity > 0 ? (attendeeCount / event.capacity) * 100 : 0;
            });

            averageAttendanceRate = rates.length > 0
                ? rates.reduce((sum, rate) => sum + rate, 0) / rates.length
                : 0;
        }

        // Büyüme oranı hesapla (önceki snapshot ile karşılaştır)
        const previousSnapshot = await this.analyticsRepository.findLatestClubSnapshot(clubId);
        let growthRate: number | undefined;

        if (previousSnapshot && previousSnapshot.totalMembers > 0) {
            growthRate = ((totalMembers - previousSnapshot.totalMembers) / previousSnapshot.totalMembers) * 100;
        }

        // Snapshot oluştur
        const snapshot = ClubSnapshotEntity.create({
            clubId,
            snapshotDate: this.normalizeDate(date),
            totalMembers,
            activeMembersCount,
            pendingApplications,
            totalEvents,
            publishedEvents,
            completedEvents,
            totalAttendances,
            averageAttendanceRate,
            growthRate
        });

        // Kaydet
        await this.analyticsRepository.saveClubSnapshot(snapshot);

        return snapshot;
    }

    /**
     * Tüm etkinlikler için günlük snapshot oluştur
     */
    async generateDailyEventSnapshots(date: Date = new Date()): Promise<void> {
        console.log(`📊 Generating event snapshots for ${date.toISOString()}`);

        // Tamamlanmış etkinlikleri getir
        const events = await this.prisma.eventsEvent.findMany({
            where: { status: 'COMPLETED' }
        });

        for (const event of events) {
            try {
                await this.generateEventSnapshot(event.id, date);
                console.log(`✅ Event snapshot generated: ${event.title}`);
            } catch (error: any) {
                console.error(`❌ Failed to generate snapshot for event ${event.id}:`, error.message);
            }
        }

        console.log(`✅ Event snapshots generation completed`);
    }

    /**
     * Tek bir etkinlik için snapshot oluştur
     */
    async generateEventSnapshot(eventId: string, date: Date = new Date()): Promise<EventSnapshotEntity> {
        // Etkinliği getir
        const event = await this.prisma.eventsEvent.findUnique({
            where: { id: eventId }
        });

        if (!event) {
            throw AppError.notFound('Etkinlik bulunamadı', 'EVENT_NOT_FOUND');
        }

        // Katılımcıları getir
        const attendances = await this.prisma.eventsAttendance.findMany({
            where: { eventId }
        });

        const totalAttendees = attendances.length;
        const attendanceRate = event.capacity > 0 ? (totalAttendees / event.capacity) * 100 : 0;

        // Check-in metodlarına göre grupla
        const checkInQRCount = attendances.filter(a => a.checkInMethod === 'QR').length;
        const checkInGPSCount = attendances.filter(a => a.checkInMethod === 'GPS').length;
        const checkInManualCount = attendances.filter(a => a.checkInMethod === 'MANUAL').length;

        // Snapshot oluştur
        const snapshot = EventSnapshotEntity.create({
            eventId,
            snapshotDate: this.normalizeDate(date),
            capacity: event.capacity,
            totalAttendees,
            attendanceRate,
            checkInQRCount,
            checkInGPSCount,
            checkInManualCount
        });

        // Kaydet
        await this.analyticsRepository.saveEventSnapshot(snapshot);

        return snapshot;
    }

    /**
     * Global sistem snapshot'ı oluştur
     */
    async generateGlobalSnapshot(date: Date = new Date()): Promise<GlobalSnapshotEntity> {
        console.log(`📊 Generating global snapshot for ${date.toISOString()}`);

        // Kullanıcı istatistikleri
        const totalUsers = await this.prisma.identityUser.count();
        const activeUsers = await this.prisma.identityUser.count({
            where: { status: 'ACTIVE' }
        });

        // Kulüp istatistikleri
        const totalClubs = await this.prisma.clubsClub.count();
        const activeClubs = await this.prisma.clubsClub.count({
            where: { isActive: true }
        });

        // Etkinlik istatistikleri
        const totalEvents = await this.prisma.eventsEvent.count();
        const publishedEvents = await this.prisma.eventsEvent.count({
            where: { status: 'PUBLISHED' }
        });

        // Katılım istatistikleri
        const totalAttendances = await this.prisma.eventsAttendance.count();

        // Ortalama etkinlik kapasitesi
        const avgCapacity = await this.prisma.eventsEvent.aggregate({
            _avg: { capacity: true }
        });

        const averageEventCapacity = avgCapacity._avg.capacity || 0;

        // Snapshot oluştur
        const snapshot = GlobalSnapshotEntity.create({
            snapshotDate: this.normalizeDate(date),
            totalUsers,
            activeUsers,
            totalClubs,
            activeClubs,
            totalEvents,
            publishedEvents,
            totalAttendances,
            averageEventCapacity
        });

        // Kaydet
        await this.analyticsRepository.saveGlobalSnapshot(snapshot);

        console.log(`✅ Global snapshot generated`);

        return snapshot;
    }

    // ==================== QUERY METHODS ====================

    /**
     * Kulüp analytics özeti getir (başkan dashboard için)
     */
    async getClubAnalyticsSummary(clubId: string): Promise<ClubAnalyticsSummary> {
        const club = await this.prisma.clubsClub.findUnique({
            where: { id: clubId }
        });

        if (!club) {
            throw AppError.notFound('Kulüp bulunamadı', 'CLUB_NOT_FOUND');
        }

        // Son snapshot'ı getir veya yeni oluştur
        let snapshot = await this.analyticsRepository.findLatestClubSnapshot(clubId);

        if (!snapshot) {
            snapshot = await this.generateClubSnapshot(clubId);
        }

        return {
            clubId: snapshot.clubId,
            clubName: club.name,
            totalMembers: snapshot.totalMembers,
            activeMembersCount: snapshot.activeMembersCount,
            pendingApplications: snapshot.pendingApplications,
            totalEvents: snapshot.totalEvents,
            publishedEvents: snapshot.publishedEvents,
            completedEvents: snapshot.completedEvents,
            totalAttendances: snapshot.totalAttendances,
            averageAttendanceRate: snapshot.averageAttendanceRate,
            growthRate: snapshot.growthRate,
            activeMemberRate: snapshot.getActiveMemberRate(),
            eventCompletionRate: snapshot.getEventCompletionRate()
        };
    }

    /**
     * Kulüp trend verileri getir (zaman serisi)
     */
    async getClubMembershipTrend(
        clubId: string,
        days: number = 30
    ): Promise<TrendData[]> {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const snapshots = await this.analyticsRepository.findClubSnapshotsByDateRange(
            clubId,
            startDate,
            endDate
        );

        return snapshots.map(s => ({
            date: s.snapshotDate,
            value: s.totalMembers
        }));
    }

    /**
     * Kulüp etkinlik trend verileri
     */
    async getClubEventTrend(
        clubId: string,
        days: number = 30
    ): Promise<TrendData[]> {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const snapshots = await this.analyticsRepository.findClubSnapshotsByDateRange(
            clubId,
            startDate,
            endDate
        );

        return snapshots.map(s => ({
            date: s.snapshotDate,
            value: s.publishedEvents
        }));
    }

    /**
     * Etkinlik analytics özeti getir
     */
    async getEventAnalyticsSummary(eventId: string): Promise<EventAnalyticsSummary> {
        const event = await this.prisma.eventsEvent.findUnique({
            where: { id: eventId }
        });

        if (!event) {
            throw AppError.notFound('Etkinlik bulunamadı', 'EVENT_NOT_FOUND');
        }

        // Son snapshot'ı getir veya yeni oluştur
        let snapshot = await this.analyticsRepository.findEventSnapshotByDate(
            eventId,
            this.normalizeDate(new Date())
        );

        if (!snapshot && event.status === 'COMPLETED') {
            snapshot = await this.generateEventSnapshot(eventId);
        }

        if (!snapshot) {
            // Etkinlik henüz tamamlanmamış, gerçek zamanlı veri döndür
            const attendances = await this.prisma.eventsAttendance.findMany({
                where: { eventId }
            });

            const totalAttendees = attendances.length;
            const attendanceRate = event.capacity > 0 ? (totalAttendees / event.capacity) * 100 : 0;

            return {
                eventId: event.id,
                eventTitle: event.title,
                capacity: event.capacity,
                totalAttendees,
                attendanceRate,
                checkInMethods: {
                    qr: attendances.filter(a => a.checkInMethod === 'QR').length,
                    gps: attendances.filter(a => a.checkInMethod === 'GPS').length,
                    manual: attendances.filter(a => a.checkInMethod === 'MANUAL').length
                },
                mostPopularMethod: 'NONE',
                isFull: totalAttendees >= event.capacity
            };
        }

        return {
            eventId: snapshot.eventId,
            eventTitle: event.title,
            capacity: snapshot.capacity,
            totalAttendees: snapshot.totalAttendees,
            attendanceRate: snapshot.attendanceRate,
            checkInMethods: {
                qr: snapshot.checkInQRCount,
                gps: snapshot.checkInGPSCount,
                manual: snapshot.checkInManualCount
            },
            mostPopularMethod: snapshot.getMostPopularCheckInMethod(),
            isFull: snapshot.isFull()
        };
    }

    /**
     * Global analytics özeti getir (SUPER_ADMIN dashboard için)
     */
    async getGlobalAnalyticsSummary(): Promise<GlobalAnalyticsSummary> {
        // Son snapshot'ı getir veya yeni oluştur
        let snapshot = await this.analyticsRepository.findLatestGlobalSnapshot();

        if (!snapshot) {
            snapshot = await this.generateGlobalSnapshot();
        }

        return {
            totalUsers: snapshot.totalUsers,
            activeUsers: snapshot.activeUsers,
            totalClubs: snapshot.totalClubs,
            activeClubs: snapshot.activeClubs,
            totalEvents: snapshot.totalEvents,
            publishedEvents: snapshot.publishedEvents,
            totalAttendances: snapshot.totalAttendances,
            averageEventCapacity: snapshot.averageEventCapacity,
            activeUserRate: snapshot.getActiveUserRate(),
            activeClubRate: snapshot.getActiveClubRate(),
            publishedEventRate: snapshot.getPublishedEventRate(),
            averageAttendancePerUser: snapshot.getAverageAttendancePerUser(),
            averageEventsPerClub: snapshot.getAverageEventsPerClub()
        };
    }

    /**
     * Global trend verileri getir
     */
    async getGlobalUserTrend(days: number = 30): Promise<TrendData[]> {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const snapshots = await this.analyticsRepository.findGlobalSnapshotsByDateRange(
            startDate,
            endDate
        );

        return snapshots.map(s => ({
            date: s.snapshotDate,
            value: s.totalUsers
        }));
    }

    /**
     * Popüler etkinlikleri getir (katılım oranına göre)
     */
    async getTopEventsByAttendance(limit: number = 10): Promise<EventAnalyticsSummary[]> {
        const events = await this.prisma.eventsEvent.findMany({
            where: { status: 'COMPLETED' },
            orderBy: { currentAttendees: 'desc' },
            take: limit
        });

        const summaries: EventAnalyticsSummary[] = [];

        for (const event of events) {
            try {
                const summary = await this.getEventAnalyticsSummary(event.id);
                summaries.push(summary);
            } catch (error) {
                console.error(`Failed to get analytics for event ${event.id}`);
            }
        }

        return summaries.sort((a, b) => b.attendanceRate - a.attendanceRate);
    }

    // ==================== HELPER METHODS ====================

    /**
     * Tarihi normalize et (saat bilgisini sıfırla)
     */
    private normalizeDate(date: Date): Date {
        const normalized = new Date(date);
        normalized.setHours(0, 0, 0, 0);
        return normalized;
    }
}
