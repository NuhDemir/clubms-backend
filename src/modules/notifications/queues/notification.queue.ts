import { Queue } from 'bullmq';
import { redis } from '../../../shared/redis/redis.client';

// Email notification job data
export interface EmailJobData {
    to: string;
    subject: string;
    body: string;
    eventId?: string;
    userId?: string;
}

// Push notification job data
export interface PushJobData {
    userId: string;
    title: string;
    body: string;
    data?: Record<string, any>;
}

// Email Queue
export const emailQueue = new Queue<EmailJobData>('email-notifications', {
    connection: redis,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000 // 2s, 4s, 8s
        },
        removeOnComplete: {
            age: 24 * 3600, // 24 saat sonra sil
            count: 1000 // Son 1000 job'ı tut
        },
        removeOnFail: {
            age: 7 * 24 * 3600 // 7 gün sonra sil
        }
    }
});

// Push Notification Queue
export const pushQueue = new Queue<PushJobData>('push-notifications', {
    connection: redis,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000
        },
        removeOnComplete: {
            age: 24 * 3600,
            count: 1000
        },
        removeOnFail: {
            age: 7 * 24 * 3600
        }
    }
});

// Queue event listeners
emailQueue.on('error', (err) => {
    console.error('❌ Email queue error:', err);
});

pushQueue.on('error', (err) => {
    console.error('❌ Push queue error:', err);
});

console.log('✅ Notification queues initialized');
