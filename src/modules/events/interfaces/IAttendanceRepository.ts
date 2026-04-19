import { AttendanceEntity } from '../domain/Attendance.entity';

export interface IAttendanceRepository {
    findByEventAndUser(eventId: string, userId: string): Promise<AttendanceEntity | null>;
    findByEventId(eventId: string): Promise<AttendanceEntity[]>;
    findByUserId(userId: string): Promise<AttendanceEntity[]>;
    save(attendance: AttendanceEntity): Promise<void>;
    delete(eventId: string, userId: string): Promise<void>;
    countByEventId(eventId: string): Promise<number>;
}
