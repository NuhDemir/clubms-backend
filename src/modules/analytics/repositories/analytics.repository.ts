import { PrismaClient } from '@prisma/client';
import { IAnalyticsRepository } from '../interfaces/IAnalyticsRepository';
import { ClubSnapshotEntity } from '../domain/ClubSnapshot.entity';
import { EventSnapshotEntity } from '../domain/EventSnapshot.entity';
import { GlobalSnapshotEntity } from '../domain/GlobalSnapshot.entity';

// Decimal type helper
type Decimal = { toNumber(): number };

function toDecimal(value: number): any {
    return value;
}

export class PrismaAnalyticsRepository implements IAnalyticsRepository {
    constructor(private readonly prisma: PrismaClient) { }

    // ==================== CLUB SNAPSHOTS ====================

    async saveClubSnapshot(snapshot: ClubSnapshotEntity): Promise<void> {
        await this.prisma.analyticsClubSnapshot.upsert({
            where: {
                clubId_snapshotDate: {
                    clubId: snapshot.clubId,
                    snapshotDate: snapshot.snapshotDate
                }
            },
            create: {
                clubId: snapshot.clubId,
                snapshotDate: snapshot.snapshotDate,
                totalMembers: snapshot.totalMembers,
                activeMembersCount: snapshot.activeMembersCount,
                pendingApplications: snapshot.pendingApplications,
                totalEvents: snapshot.totalEvents,
                publishedEvents: snapshot.publishedEvents,
                completedEvents: snapshot.completedEvents,
                totalAttendances: snapshot.totalAttendances,
                averageAttendanceRate: toDecimal(snapshot.averageAttendanceRate),
                growthRate: snapshot.growthRate ? toDecimal(snapshot.growthRate) : null
            },
            update: {
                totalMembers: snapshot.totalMembers,
                activeMembersCount: snapshot.activeMembersCount,
                pendingApplications: snapshot.pendingApplications,
                totalEvents: snapshot.totalEvents,
                publishedEvents: snapshot.publishedEvents,
                completedEvents: snapshot.completedEvents,
                totalAttendances: snapshot.totalAttendances,
                averageAttendanceRate: toDecimal(snapshot.averageAttendanceRate),
                growthRate: snapshot.growthRate ? toDecimal(snapshot.growthRate) : null
            }
        });
    }

    async findClubSnapshotsByDateRange(
        clubId: string,
        startDate: Date,
        endDate: Date
    ): Promise<ClubSnapshotEntity[]> {
        const snapshots = await this.prisma.analyticsClubSnapshot.findMany({
            where: {
                clubId,
                snapshotDate: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: { snapshotDate: 'asc' }
        });

        return snapshots.map(s => ClubSnapshotEntity.fromPersistence({
            id: s.id,
            clubId: s.clubId,
            snapshotDate: s.snapshotDate,
            totalMembers: s.totalMembers,
            activeMembersCount: s.activeMembersCount,
            pendingApplications: s.pendingApplications,
            totalEvents: s.totalEvents,
            publishedEvents: s.publishedEvents,
            completedEvents: s.completedEvents,
            totalAttendances: s.totalAttendances,
            averageAttendanceRate: s.averageAttendanceRate.toNumber(),
            growthRate: s.growthRate?.toNumber(),
            createdAt: s.createdAt
        }));
    }

    async findLatestClubSnapshot(clubId: string): Promise<ClubSnapshotEntity | null> {
        const snapshot = await this.prisma.analyticsClubSnapshot.findFirst({
            where: { clubId },
            orderBy: { snapshotDate: 'desc' }
        });

        if (!snapshot) return null;

        return ClubSnapshotEntity.fromPersistence({
            id: snapshot.id,
            clubId: snapshot.clubId,
            snapshotDate: snapshot.snapshotDate,
            totalMembers: snapshot.totalMembers,
            activeMembersCount: snapshot.activeMembersCount,
            pendingApplications: snapshot.pendingApplications,
            totalEvents: snapshot.totalEvents,
            publishedEvents: snapshot.publishedEvents,
            completedEvents: snapshot.completedEvents,
            totalAttendances: snapshot.totalAttendances,
            averageAttendanceRate: snapshot.averageAttendanceRate.toNumber(),
            growthRate: snapshot.growthRate?.toNumber(),
            createdAt: snapshot.createdAt
        });
    }

    async findClubSnapshotByDate(clubId: string, date: Date): Promise<ClubSnapshotEntity | null> {
        const snapshot = await this.prisma.analyticsClubSnapshot.findUnique({
            where: {
                clubId_snapshotDate: {
                    clubId,
                    snapshotDate: date
                }
            }
        });

        if (!snapshot) return null;

        return ClubSnapshotEntity.fromPersistence({
            id: snapshot.id,
            clubId: snapshot.clubId,
            snapshotDate: snapshot.snapshotDate,
            totalMembers: snapshot.totalMembers,
            activeMembersCount: snapshot.activeMembersCount,
            pendingApplications: snapshot.pendingApplications,
            totalEvents: snapshot.totalEvents,
            publishedEvents: snapshot.publishedEvents,
            completedEvents: snapshot.completedEvents,
            totalAttendances: snapshot.totalAttendances,
            averageAttendanceRate: snapshot.averageAttendanceRate.toNumber(),
            growthRate: snapshot.growthRate?.toNumber(),
            createdAt: snapshot.createdAt
        });
    }

    // ==================== EVENT SNAPSHOTS ====================

    async saveEventSnapshot(snapshot: EventSnapshotEntity): Promise<void> {
        await this.prisma.analyticsEventSnapshot.upsert({
            where: {
                eventId_snapshotDate: {
                    eventId: snapshot.eventId,
                    snapshotDate: snapshot.snapshotDate
                }
            },
            create: {
                eventId: snapshot.eventId,
                snapshotDate: snapshot.snapshotDate,
                capacity: snapshot.capacity,
                totalAttendees: snapshot.totalAttendees,
                attendanceRate: toDecimal(snapshot.attendanceRate),
                checkInQRCount: snapshot.checkInQRCount,
                checkInGPSCount: snapshot.checkInGPSCount,
                checkInManualCount: snapshot.checkInManualCount
            },
            update: {
                capacity: snapshot.capacity,
                totalAttendees: snapshot.totalAttendees,
                attendanceRate: toDecimal(snapshot.attendanceRate),
                checkInQRCount: snapshot.checkInQRCount,
                checkInGPSCount: snapshot.checkInGPSCount,
                checkInManualCount: snapshot.checkInManualCount
            }
        });
    }

    async findEventSnapshotByDate(eventId: string, date: Date): Promise<EventSnapshotEntity | null> {
        const snapshot = await this.prisma.analyticsEventSnapshot.findUnique({
            where: {
                eventId_snapshotDate: {
                    eventId,
                    snapshotDate: date
                }
            }
        });

        if (!snapshot) return null;

        return EventSnapshotEntity.fromPersistence({
            id: snapshot.id,
            eventId: snapshot.eventId,
            snapshotDate: snapshot.snapshotDate,
            capacity: snapshot.capacity,
            totalAttendees: snapshot.totalAttendees,
            attendanceRate: snapshot.attendanceRate.toNumber(),
            checkInQRCount: snapshot.checkInQRCount,
            checkInGPSCount: snapshot.checkInGPSCount,
            checkInManualCount: snapshot.checkInManualCount,
            createdAt: snapshot.createdAt
        });
    }

    async findEventSnapshotsByClubAndDateRange(
        clubId: string,
        startDate: Date,
        endDate: Date
    ): Promise<EventSnapshotEntity[]> {
        // Önce kulübün etkinliklerini bul
        const events = await this.prisma.eventsEvent.findMany({
            where: { clubId },
            select: { id: true }
        });

        const eventIds = events.map(e => e.id);

        // Sonra bu etkinliklerin snapshot'larını getir
        const snapshots = await this.prisma.analyticsEventSnapshot.findMany({
            where: {
                eventId: { in: eventIds },
                snapshotDate: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: { snapshotDate: 'asc' }
        });

        return snapshots.map(s => EventSnapshotEntity.fromPersistence({
            id: s.id,
            eventId: s.eventId,
            snapshotDate: s.snapshotDate,
            capacity: s.capacity,
            totalAttendees: s.totalAttendees,
            attendanceRate: s.attendanceRate.toNumber(),
            checkInQRCount: s.checkInQRCount,
            checkInGPSCount: s.checkInGPSCount,
            checkInManualCount: s.checkInManualCount,
            createdAt: s.createdAt
        }));
    }

    // ==================== GLOBAL SNAPSHOTS ====================

    async saveGlobalSnapshot(snapshot: GlobalSnapshotEntity): Promise<void> {
        await this.prisma.analyticsGlobalSnapshot.upsert({
            where: {
                snapshotDate: snapshot.snapshotDate
            },
            create: {
                snapshotDate: snapshot.snapshotDate,
                totalUsers: snapshot.totalUsers,
                activeUsers: snapshot.activeUsers,
                totalClubs: snapshot.totalClubs,
                activeClubs: snapshot.activeClubs,
                totalEvents: snapshot.totalEvents,
                publishedEvents: snapshot.publishedEvents,
                totalAttendances: snapshot.totalAttendances,
                averageEventCapacity: toDecimal(snapshot.averageEventCapacity)
            },
            update: {
                totalUsers: snapshot.totalUsers,
                activeUsers: snapshot.activeUsers,
                totalClubs: snapshot.totalClubs,
                activeClubs: snapshot.activeClubs,
                totalEvents: snapshot.totalEvents,
                publishedEvents: snapshot.publishedEvents,
                totalAttendances: snapshot.totalAttendances,
                averageEventCapacity: toDecimal(snapshot.averageEventCapacity)
            }
        });
    }

    async findGlobalSnapshotsByDateRange(
        startDate: Date,
        endDate: Date
    ): Promise<GlobalSnapshotEntity[]> {
        const snapshots = await this.prisma.analyticsGlobalSnapshot.findMany({
            where: {
                snapshotDate: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: { snapshotDate: 'asc' }
        });

        return snapshots.map(s => GlobalSnapshotEntity.fromPersistence({
            id: s.id,
            snapshotDate: s.snapshotDate,
            totalUsers: s.totalUsers,
            activeUsers: s.activeUsers,
            totalClubs: s.totalClubs,
            activeClubs: s.activeClubs,
            totalEvents: s.totalEvents,
            publishedEvents: s.publishedEvents,
            totalAttendances: s.totalAttendances,
            averageEventCapacity: s.averageEventCapacity.toNumber(),
            createdAt: s.createdAt
        }));
    }

    async findLatestGlobalSnapshot(): Promise<GlobalSnapshotEntity | null> {
        const snapshot = await this.prisma.analyticsGlobalSnapshot.findFirst({
            orderBy: { snapshotDate: 'desc' }
        });

        if (!snapshot) return null;

        return GlobalSnapshotEntity.fromPersistence({
            id: snapshot.id,
            snapshotDate: snapshot.snapshotDate,
            totalUsers: snapshot.totalUsers,
            activeUsers: snapshot.activeUsers,
            totalClubs: snapshot.totalClubs,
            activeClubs: snapshot.activeClubs,
            totalEvents: snapshot.totalEvents,
            publishedEvents: snapshot.publishedEvents,
            totalAttendances: snapshot.totalAttendances,
            averageEventCapacity: snapshot.averageEventCapacity.toNumber(),
            createdAt: snapshot.createdAt
        });
    }
}
