import { EventEmitter } from 'events';
import { prisma } from '../../../shared/prisma/prisma.client';
import { v4 as uuidv4 } from 'uuid';

/**
 * Domain Event Listener
 * 
 * EventEmitter kullanarak domain event'leri dinler
 * ve Outbox Pattern ile veritabanına kaydeder
 * 
 * Flow:
 * 1. Service katmanı event emit eder
 * 2. Listener event'i yakalar
 * 3. Outbox tablosuna kaydeder (aynı transaction içinde olabilir)
 * 4. Outbox processor event'i işler
 */

class DomainEventEmitter extends EventEmitter { }

export const domainEvents = new DomainEventEmitter();

// ==================== EVENT LISTENERS ====================

/**
 * Event cancelled - Katılımcılara bildirim gönder
 */
domainEvents.on('event.cancelled', async (data: {
    eventId: string;
    eventTitle: string;
    clubId: string;
    clubName: string;
}) => {
    try {
        console.log(`🔔 Domain event: event.cancelled - ${data.eventId}`);

        // Katılımcıların email'lerini al
        const attendances = await prisma.eventsAttendance.findMany({
            where: { eventId: data.eventId }
        });

        const userIds = attendances.map(a => a.userId);

        // Kullanıcıların email'lerini al
        const users = await prisma.identityUser.findMany({
            where: { id: { in: userIds } },
            select: { email: true }
        });

        const attendeeEmails = users.map(u => u.email);

        // Outbox'a kaydet
        await prisma.infrastructureOutboxEvent.create({
            data: {
                id: uuidv4(),
                aggregateType: 'EVENT',
                aggregateId: data.eventId,
                eventType: 'CANCELLED',
                payload: {
                    eventId: data.eventId,
                    eventTitle: data.eventTitle,
                    clubName: data.clubName,
                    attendeeEmails
                },
                published: false
            }
        });

        console.log(`✅ Event cancellation recorded in outbox for ${attendeeEmails.length} attendees`);
    } catch (error: any) {
        console.error('❌ Error handling event.cancelled:', error.message);
    }
});

/**
 * Event published - Kulüp üyelerine bildirim gönder
 */
domainEvents.on('event.published', async (data: {
    eventId: string;
    eventTitle: string;
    clubId: string;
    clubName: string;
}) => {
    try {
        console.log(`🔔 Domain event: event.published - ${data.eventId}`);

        // Kulüp üyelerinin email'lerini al
        const memberships = await prisma.clubsMembership.findMany({
            where: {
                clubId: data.clubId,
                role: { not: 'PENDING' } // Sadece aktif üyeler
            }
        });

        const userIds = memberships.map(m => m.userId);

        const users = await prisma.identityUser.findMany({
            where: { id: { in: userIds } },
            select: { email: true }
        });

        const clubMemberEmails = users.map(u => u.email);

        // Outbox'a kaydet
        await prisma.infrastructureOutboxEvent.create({
            data: {
                id: uuidv4(),
                aggregateType: 'EVENT',
                aggregateId: data.eventId,
                eventType: 'PUBLISHED',
                payload: {
                    eventId: data.eventId,
                    eventTitle: data.eventTitle,
                    clubName: data.clubName,
                    clubMemberEmails
                },
                published: false
            }
        });

        console.log(`✅ Event published recorded in outbox for ${clubMemberEmails.length} members`);
    } catch (error: any) {
        console.error('❌ Error handling event.published:', error.message);
    }
});

/**
 * Membership approved - Kullanıcıya bildirim gönder
 */
domainEvents.on('membership.approved', async (data: {
    userId: string;
    clubId: string;
    clubName: string;
}) => {
    try {
        console.log(`🔔 Domain event: membership.approved - ${data.userId}`);

        // Kullanıcının email'ini al
        const user = await prisma.identityUser.findUnique({
            where: { id: data.userId },
            select: { email: true }
        });

        if (!user) {
            console.log(`⚠️ User ${data.userId} not found`);
            return;
        }

        // Outbox'a kaydet
        await prisma.infrastructureOutboxEvent.create({
            data: {
                id: uuidv4(),
                aggregateType: 'MEMBERSHIP',
                aggregateId: data.userId,
                eventType: 'APPROVED',
                payload: {
                    userId: data.userId,
                    clubName: data.clubName,
                    userEmail: user.email
                },
                published: false
            }
        });

        console.log(`✅ Membership approved recorded in outbox for user ${data.userId}`);
    } catch (error: any) {
        console.error('❌ Error handling membership.approved:', error.message);
    }
});

/**
 * Membership rejected - Kullanıcıya bildirim gönder
 */
domainEvents.on('membership.rejected', async (data: {
    userId: string;
    clubId: string;
    clubName: string;
}) => {
    try {
        console.log(`🔔 Domain event: membership.rejected - ${data.userId}`);

        // Kullanıcının email'ini al
        const user = await prisma.identityUser.findUnique({
            where: { id: data.userId },
            select: { email: true }
        });

        if (!user) {
            console.log(`⚠️ User ${data.userId} not found`);
            return;
        }

        // Outbox'a kaydet
        await prisma.infrastructureOutboxEvent.create({
            data: {
                id: uuidv4(),
                aggregateType: 'MEMBERSHIP',
                aggregateId: data.userId,
                eventType: 'REJECTED',
                payload: {
                    userId: data.userId,
                    clubName: data.clubName,
                    userEmail: user.email
                },
                published: false
            }
        });

        console.log(`✅ Membership rejected recorded in outbox for user ${data.userId}`);
    } catch (error: any) {
        console.error('❌ Error handling membership.rejected:', error.message);
    }
});

console.log('✅ Domain event listeners registered');
