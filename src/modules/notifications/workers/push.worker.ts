import { Worker, Job } from 'bullmq';
import { redis } from '../../../shared/redis/redis.client';
import * as admin from 'firebase-admin';

/**
 * Push Notification Worker
 * 
 * Push notification queue'dan job'ları işler
 * Firebase Cloud Messaging (FCM) kullanır
 */

interface PushJobData {
    userId: string;
    title: string;
    body: string;
    data?: Record<string, string>;
}

const pushWorker = new Worker<PushJobData>(
    'push-notifications',
    async (job: Job<PushJobData>) => {
        const { userId, title, body, data } = job.data;

        console.log(`📱 Processing push notification job ${job.id}`);
        console.log(`   User: ${userId}`);
        console.log(`   Title: ${title}`);

        try {
            // TODO: Kullanıcının FCM token'ını veritabanından al
            // const fcmToken = await getUserFcmToken(userId);

            // Simülasyon için dummy token
            const fcmToken = 'dummy-fcm-token';

            if (!fcmToken) {
                console.log(`⚠️ No FCM token found for user ${userId}`);
                return { success: false, reason: 'NO_FCM_TOKEN' };
            }

            // Firebase Cloud Messaging ile push notification gönder
            const message: admin.messaging.Message = {
                notification: {
                    title,
                    body
                },
                data: data || {},
                token: fcmToken
            };

            // TODO: Gerçek push notification gönderimi
            // const response = await admin.messaging().send(message);

            // Simülasyon
            await new Promise(resolve => setTimeout(resolve, 50));

            console.log(`✅ Push notification sent to user ${userId}`);

            return { success: true, sentAt: new Date() };
        } catch (error: any) {
            console.error(`❌ Failed to send push notification to ${userId}:`, error.message);
            throw error; // Retry için hata fırlat
        }
    },
    {
        connection: redis,
        concurrency: 10, // Aynı anda 10 push notification işle
        limiter: {
            max: 500, // Dakikada max 500 push
            duration: 60000 // 1 dakika
        }
    }
);

// Event listeners
pushWorker.on('completed', (job) => {
    console.log(`✅ Push notification job ${job.id} completed`);
});

pushWorker.on('failed', (job, err) => {
    console.error(`❌ Push notification job ${job?.id} failed:`, err.message);
});

console.log('✅ Push notification worker started');

export default pushWorker;
