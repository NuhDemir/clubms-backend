import { Worker, Job } from 'bullmq';
import { redis } from '../../../shared/redis/redis.client';
import { EmailJobData } from '../queues/notification.queue';

/**
 * Email Worker
 * Concurrency: 5 (aynı anda 5 email gönderebilir)
 * Retry: 3 attempts with exponential backoff
 */
export const emailWorker = new Worker<EmailJobData>(
    'email-notifications',
    async (job: Job<EmailJobData>) => {
        const { to, subject, body, eventId, userId } = job.data;

        console.log(`📧 Sending email to ${to}: ${subject}`);

        try {
            // TODO: Gerçek email servisi entegrasyonu (SendGrid, AWS SES, etc.)
            // Şimdilik simüle ediyoruz
            await simulateEmailSending(to, subject, body);

            console.log(`✅ Email sent successfully to ${to}`);

            return {
                success: true,
                to,
                subject,
                sentAt: new Date().toISOString()
            };
        } catch (error: any) {
            console.error(`❌ Email sending failed to ${to}:`, error.message);

            // Retry edilebilir hata mı?
            if (isRetryableError(error)) {
                throw error; // BullMQ retry yapacak
            }

            // Retry edilemez hata - job'ı başarısız say
            throw new Error(`Non-retryable error: ${error.message}`);
        }
    },
    {
        connection: redis,
        concurrency: 5, // Aynı anda 5 email işle
        limiter: {
            max: 100, // Dakikada maksimum 100 email
            duration: 60000 // 1 dakika
        }
    }
);

// Worker event listeners
emailWorker.on('completed', (job) => {
    console.log(`✅ Email job ${job.id} completed`);
});

emailWorker.on('failed', (job, err) => {
    console.error(`❌ Email job ${job?.id} failed:`, err.message);
});

emailWorker.on('error', (err) => {
    console.error('❌ Email worker error:', err);
});

// Simulated email sending (production'da gerçek servis kullanılacak)
async function simulateEmailSending(
    to: string,
    subject: string,
    body: string
): Promise<void> {
    // Simüle edilmiş gecikme
    await new Promise(resolve => setTimeout(resolve, 1000));

    // %5 başarısızlık simülasyonu (test için)
    if (Math.random() < 0.05) {
        throw new Error('Simulated email service error');
    }

    // Email gönderildi (log)
    console.log(`
    ═══════════════════════════════════════
    📧 EMAIL SENT
    To: ${to}
    Subject: ${subject}
    Body: ${body.substring(0, 100)}...
    ═══════════════════════════════════════
  `);
}

// Retry edilebilir hata kontrolü
function isRetryableError(error: any): boolean {
    const retryableErrors = [
        'ETIMEDOUT',
        'ECONNRESET',
        'ENOTFOUND',
        'ECONNREFUSED'
    ];

    return retryableErrors.some(code => error.code === code || error.message.includes(code));
}

console.log('✅ Email worker started');
