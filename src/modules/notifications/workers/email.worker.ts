import { Worker, Job } from 'bullmq';
import { redis } from '../../../shared/redis/redis.client';

/**
 * Email Worker
 * 
 * Email queue'dan job'ları işler
 * Gerçek email gönderimi için SMTP/SendGrid/AWS SES entegrasyonu gerekir
 */

interface EmailJobData {
    to: string;
    subject: string;
    body: string;
    eventId?: string;
    userId?: string;
}

const emailWorker = new Worker<EmailJobData>(
    'email-notifications',
    async (job: Job<EmailJobData>) => {
        const { to, subject, body } = job.data;

        console.log(`📧 Processing email job ${job.id}`);
        console.log(`   To: ${to}`);
        console.log(`   Subject: ${subject}`);

        try {
            // TODO: Gerçek email gönderimi
            // await sendEmail({ to, subject, body });

            // Simülasyon
            await new Promise(resolve => setTimeout(resolve, 100));

            console.log(`✅ Email sent successfully to ${to}`);

            return { success: true, sentAt: new Date() };
        } catch (error: any) {
            console.error(`❌ Failed to send email to ${to}:`, error.message);
            throw error; // Retry için hata fırlat
        }
    },
    {
        connection: redis,
        concurrency: 5, // Aynı anda 5 email işle
        limiter: {
            max: 100, // Dakikada max 100 email
            duration: 60000 // 1 dakika
        }
    }
);

// Event listeners
emailWorker.on('completed', (job) => {
    console.log(`✅ Email job ${job.id} completed`);
});

emailWorker.on('failed', (job, err) => {
    console.error(`❌ Email job ${job?.id} failed:`, err.message);
});

console.log('✅ Email worker started');

export default emailWorker;
