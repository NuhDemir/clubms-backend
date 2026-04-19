import { EventsEvent } from '@prisma/client';
import { prisma } from '../../../shared/prisma/prisma.client';
import { EventEntity, EventStatus } from '../domain/Event.entity';
import { IEventRepository } from '../interfaces/IEventRepository';

export class PrismaEventRepository implements IEventRepository {
    private toEntity(record: EventsEvent): EventEntity {
        return new EventEntity(
            record.id,
            record.clubId,
            record.title,
            record.description,
            record.capacity,
            record.currentAttendees,
            record.version,
            record.location,
            record.latitude ? Number(record.latitude) : null,
            record.longitude ? Number(record.longitude) : null,
            record.startTime,
            record.endTime,
            record.status as EventStatus,
            record.createdAt
        );
    }

    async findById(id: string): Promise<EventEntity | null> {
        const record = await prisma.eventsEvent.findUnique({
            where: { id }
        });
        return record ? this.toEntity(record) : null;
    }

    async findByClubId(clubId: string, publishedOnly: boolean = false): Promise<EventEntity[]> {
        const records = await prisma.eventsEvent.findMany({
            where: {
                clubId,
                ...(publishedOnly && { status: 'PUBLISHED' })
            },
            orderBy: { startTime: 'desc' }
        });
        return records.map(record => this.toEntity(record));
    }

    async findAll(publishedOnly: boolean = true): Promise<EventEntity[]> {
        const records = await prisma.eventsEvent.findMany({
            where: publishedOnly ? { status: 'PUBLISHED' } : undefined,
            orderBy: { startTime: 'desc' }
        });
        return records.map(record => this.toEntity(record));
    }

    async findUpcoming(limit: number = 10): Promise<EventEntity[]> {
        const records = await prisma.eventsEvent.findMany({
            where: {
                status: 'PUBLISHED',
                startTime: { gte: new Date() }
            },
            orderBy: { startTime: 'asc' },
            take: limit
        });
        return records.map(record => this.toEntity(record));
    }

    async save(event: EventEntity): Promise<void> {
        await prisma.eventsEvent.create({
            data: {
                id: event.id,
                clubId: event.clubId,
                title: event.title,
                description: event.description,
                capacity: event.capacity,
                currentAttendees: event.currentAttendees,
                version: event.version,
                location: event.location,
                latitude: event.latitude,
                longitude: event.longitude,
                startTime: event.startTime,
                endTime: event.endTime,
                status: event.status
            }
        });
    }

    async update(event: EventEntity): Promise<void> {
        await prisma.eventsEvent.update({
            where: { id: event.id },
            data: {
                title: event.title,
                description: event.description,
                capacity: event.capacity,
                currentAttendees: event.currentAttendees,
                version: event.version,
                location: event.location,
                latitude: event.latitude,
                longitude: event.longitude,
                startTime: event.startTime,
                endTime: event.endTime,
                status: event.status
            }
        });
    }

    async updateWithOptimisticLock(event: EventEntity, expectedVersion: number): Promise<boolean> {
        const result = await prisma.eventsEvent.updateMany({
            where: {
                id: event.id,
                version: expectedVersion
            },
            data: {
                currentAttendees: event.currentAttendees,
                version: event.version
            }
        });

        return result.count > 0;
    }

    async delete(id: string): Promise<void> {
        await prisma.eventsEvent.delete({
            where: { id }
        });
    }
}
