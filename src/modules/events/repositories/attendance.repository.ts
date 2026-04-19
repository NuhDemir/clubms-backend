import { EventsAttendance } from '@prisma/client';
import { prisma } from '../../../shared/prisma/prisma.client';
import { AttendanceEntity, CheckInMethod } from '../domain/Attendance.entity';
import { IAttendanceRepository } from '../interfaces/IAttendanceRepository';

export class PrismaAttendanceRepository implements IAttendanceRepository {
    private toEntity(record: EventsAttendance): AttendanceEntity {
        return new AttendanceEntity(
            record.eventId,
            record.userId,
            record.checkInMethod as CheckInMethod,
            record.joinedAt
        );
    }

    async findByEventAndUser(eventId: string, userId: string): Promise<AttendanceEntity | null> {
        const record = await prisma.eventsAttendance.findUnique({
            where: {
                eventId_userId: { eventId, userId }
            }
        });
        return record ? this.toEntity(record) : null;
    }

    async findByEventId(eventId: string): Promise<AttendanceEntity[]> {
        const records = await prisma.eventsAttendance.findMany({
            where: { eventId },
            orderBy: { joinedAt: 'desc' }
        });
        return records.map(record => this.toEntity(record));
    }

    async findByUserId(userId: string): Promise<AttendanceEntity[]> {
        const records = await prisma.eventsAttendance.findMany({
            where: { userId },
            orderBy: { joinedAt: 'desc' }
        });
        return records.map(record => this.toEntity(record));
    }

    async save(attendance: AttendanceEntity): Promise<void> {
        await prisma.eventsAttendance.create({
            data: {
                eventId: attendance.eventId,
                userId: attendance.userId,
                checkInMethod: attendance.checkInMethod,
                joinedAt: attendance.joinedAt
            }
        });
    }

    async delete(eventId: string, userId: string): Promise<void> {
        await prisma.eventsAttendance.delete({
            where: {
                eventId_userId: { eventId, userId }
            }
        });
    }

    async countByEventId(eventId: string): Promise<number> {
        return await prisma.eventsAttendance.count({
            where: { eventId }
        });
    }
}
