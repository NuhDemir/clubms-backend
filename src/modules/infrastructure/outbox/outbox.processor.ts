import { prisma } from '../../../shared/prisma/prisma.client';
import { emailQueue, pushQueue } from '../../notifications/queues/notification.queue';

/**
 * Outbox Pattern Processor
 * 
 * Transactional Outbox Pattern:
 * 1. Business logic + outbox kaydı aynı transaction'da
 * 2. Background processor outbox'tan okur
 * 3. Event'leri queue'ya gönderir
 * 4. Başarılı olanları published=true yapar
 * 
 * At-least-once delivery garantisi
 */

export interface OutboxEvent {
    id: string;
    aggregateType: string;
    aggregateId: string;
    eventType: string;
    payload: any;
    published: boolean;
    createdAt: Date;
}

export class OutboxProcessor {
    private isRunning = false;
    private intervalId: NodeJS.Timeout | null = null;

    /**
     * Outbox processor'ı başlat
     * @param intervalMs Polling interval (default: 5000ms)
     */
    start(intervalMs: number = 5000): void {
        if (this.isRunning) {
            console.log('⚠️ Outbox processor already running');
            return;
        }

        this.isRunning = true;
        console.log(`✅ Outbox processor started (interval: ${intervalMs}ms)`);

        // İlk çalıştırma
        this.processOutbox();

        // Periyodik çalıştırma
        this.intervalId = setInterval(() => {
            this.processOutbox();
        }, intervalMs);
    }

    /**
     * Outbox processor'ı durdur
     */
    stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
        console.log('✅ Outbox processor stopped');
    }

    /**
     * Outbox'tan yayınlanmamış event'leri işle
     */
    private async processOutbox(): Promise<void> {
        try {
            // Yayınlanmamış event'leri al (en eski 100 kayıt)
            const events = await prisma.infrastructureOutboxEvent.findMany({
                where: { published: false },
                orderBy: { createdAt: 'asc' },
                take: 100
            });

            if (events.length === 0) {
                return;
            }

            console.log(`📦 Processing ${events.length} outbox events`);

            // Her event'i işle
            for (const event of events) {
                try {
                    await this.processEvent(event);

                    // Başarılı - published=true yap
                    await prisma.infrastructureOutboxEvent.update({
                        where: { id: event.id },
                        data: { published: true }
                    });

                    console.log(`✅ Outbox event ${event.id} processed and published`);
                } catch (error: any) {
                    console.error(`❌ Failed to process outbox event ${event.id}:`, error.message);
                    // Hata durumunda event published=false kalır, bir sonraki polling'de tekrar denenecek
                }
            }
        } catch (error: any) {
            console.error('❌ Outbox processor error:', error.message);
        }
    }

    /**
     * Tek bir event'i işle ve ilgili queue'ya gönder
     */
    private async processEvent(event: OutboxEvent): Promise<void> {
        const { aggregateType, eventType, payload } = event;

        console.log(`📨 Processing event: ${aggregateType}.${eventType}`);

        // Event type'a göre işlem yap
        switch (`${aggregateType}.${eventType}`) {
            case 'EVENT.CANCELLED':
                await this.handleEventCancelled(payload);
                break;

            case 'EVENT.PUBLISHED':
                await this.handleEventPublished(payload);
                break;

            case 'MEMBERSHIP.APPROVED':
                await this.handleMembershipApproved(payload);
                break;

            case 'MEMBERSHIP.REJECTED':
                await this.handleMembershipRejected(payload);
                break;

            default:
                console.log(`⚠️ Unknown event type: ${aggregateType}.${eventType}`);
        }
    }

    // ==================== EVENT HANDLERS ====================

    private async handleEventCancelled(payload: any): Promise<void> {
        const { eventId, eventTitle, clubName, attendeeEmails } = payload;

        // Tüm katılımcılara email gönder
        for (const email of attendeeEmails || []) {
            await emailQueue.add('event-cancelled', {
                to: email,
                subject: `Etkinlik İptal Edildi: ${eventTitle}`,
                body: `
          Merhaba,
          
          ${clubName} kulübünün "${eventTitle}" etkinliği iptal edilmiştir.
          
          Anlayışınız için teşekkür ederiz.
          
          ClubMS Ekibi
        `,
                eventId
            });
        }

        console.log(`📧 Sent ${attendeeEmails?.length || 0} cancellation emails for event ${eventId}`);
    }

    private async handleEventPublished(payload: any): Promise<void> {
        const { eventId, eventTitle, clubName, clubMemberEmails } = payload;

        // Kulüp üyelerine email gönder
        for (const email of clubMemberEmails || []) {
            await emailQueue.add('event-published', {
                to: email,
                subject: `Yeni Etkinlik: ${eventTitle}`,
                body: `
          Merhaba,
          
          ${clubName} kulübü yeni bir etkinlik yayınladı: "${eventTitle}"
          
          Detaylar için uygulamayı ziyaret edin.
          
          ClubMS Ekibi
        `,
                eventId
            });
        }

        console.log(`📧 Sent ${clubMemberEmails?.length || 0} event published emails`);
    }

    private async handleMembershipApproved(payload: any): Promise<void> {
        const { userId, clubName, userEmail } = payload;

        // Kullanıcıya email gönder
        await emailQueue.add('membership-approved', {
            to: userEmail,
            subject: `Üyelik Onaylandı: ${clubName}`,
            body: `
        Merhaba,
        
        ${clubName} kulübüne üyelik başvurunuz onaylanmıştır!
        
        Artık kulüp etkinliklerine katılabilirsiniz.
        
        ClubMS Ekibi
      `,
            userId
        });

        // Push notification gönder
        await pushQueue.add('membership-approved', {
            userId,
            title: 'Üyelik Onaylandı! 🎉',
            body: `${clubName} kulübüne üyeliğiniz onaylandı`,
            data: { type: 'MEMBERSHIP_APPROVED', clubName }
        });

        console.log(`📧 Sent membership approved notification to user ${userId}`);
    }

    private async handleMembershipRejected(payload: any): Promise<void> {
        const { userId, clubName, userEmail } = payload;

        // Kullanıcıya email gönder
        await emailQueue.add('membership-rejected', {
            to: userEmail,
            subject: `Üyelik Başvurusu: ${clubName}`,
            body: `
        Merhaba,
        
        ${clubName} kulübüne üyelik başvurunuz değerlendirilmiştir.
        
        Daha fazla bilgi için kulüp yöneticileriyle iletişime geçebilirsiniz.
        
        ClubMS Ekibi
      `,
            userId
        });

        console.log(`📧 Sent membership rejected notification to user ${userId}`);
    }
}

// Singleton instance
export const outboxProcessor = new OutboxProcessor();
