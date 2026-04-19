import { Worker, Job } from 'bullmq';
import { redis } from '../../../shared/redis/redis.client';
import { PushJobData } from '../queues/notification.queue';
import { admin as getAdmin } from '../../../shared/firebase/firebase.admin';

/**
 * Push Notification Worker
 * Concurrency: 10 (aynı anda 10 push notification gönderebilir)
 * Retry: 3 attempts with exponential backoff
 */
export const pushWorker = new Worker<PushJobData>(
    'push-notifications',
    async (job: Job<PushJobData>) => {
        const { userId, title, body, data } = job.data;

        console.log(`🔔 Sending push notification to user ${userId}: ${title}`);

        try {
            // TODO: Kullanıcının FCM token'ını veritabanından al
            // Şimdilik simüle ediyoruz
            const fcmToken = await getFCMToken(userId);

            if (!fcmToken) {
                console.log(`⚠️ No FCM token for user ${userId}, skipping push notification`);
                return {
                    success: false,
                    reason: 'NO_FCM_TOKEN',
                    userId
                };
            }

            // Firebase Cloud Messaging ile push notification gönder
            const message = {
                token: fcmToken,
                notification: {
                    title,
                    body
                },
                data: data || {}
            };

            const response = await getAdmin().messaging().send(message);

            console.log(`✅ Push notification sent successfully to user ${userId}`);

            return {
                success: true,
                userId,
                messageId: response,
                sentAt: new Date().toISOString()
            };
        } catch (error: any) {
            console.error(`❌ Push notification failed for user ${userId}:`, error.message);

            // Firebase error handling
            if (error.code === 'messaging/invalid-registration-token' ||
                error.code === 'messaging/registration-token-not-registered') {
                // Token geçersiz - veritabanından sil (TODO)
                console.log(`⚠️ Invalid FCM token for user ${userId}, should be removed from DB`);
                return {
                    success: false,
                    reason: 'INVALID_TOKEN',
                    userId
                };
            }

            // Retry edilebilir hata
            throw error;
        }
    },
    {
        connection: redis,
        concurrency: 10,
        limiter: {
            max: 500, // Dakikada maksimum 500 push
            duration: 60000
        }
    }
);

// Worker event listeners
pushWorker.on('completed', (job) => {
    console.log(`✅ Push job ${job.id} completed`);
});

pushWorker.on('failed', (job, err) => {
    console.error(`❌ Push job ${job?.id} failed:`, err.message);
});

pushWorker.on('error', (err) => {
    console.error('❌ Push worker error:', err);
});

// Simulated FCM token retrieval (production'da veritabanından alınacak)
async function getFCMToken(userId: string): Promise<string | null> {
    // TODO: Veritabanından kullanıcının FCM token'ını al
    // Şimdilik simüle ediyoruz

    // %20 kullanıcının token'ı yok simülasyonu
    if (Math.random() < 0.2) {
        return null;
    }

    return `fcm_token_${userId}_${Date.now()}`;
}

console.log('✅ Push notification worker started');
