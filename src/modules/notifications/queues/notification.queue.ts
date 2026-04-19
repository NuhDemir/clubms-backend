import { Queue } from 'bullmq';
import { redis } from '../../../shared/redis/redis.client';

/**
 * BullMQ Queue Configuration
 * 
 * Email ve Push notification için ayrı queue'lar
 * Redis üzerinden çalışır
 */

// Email Queue
export const emailQueue = new Queue('email-notifications', {
    connection: redis,
    defaultJobOptions: {
        attempts: 3, // 3 deneme
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
export const pushQueue = new Queue('push-notifications', {
    connection: redis,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000 // 1s, 2s, 4s
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

console.log('✅ BullMQ queues initialized');
