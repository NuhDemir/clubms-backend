import * as cron from 'node-cron';
import { AnalyticsService } from '../services/analytics.service';

/**
 * Analytics Snapshot Cron Job
 * 
 * Her gün gece 02:00'de çalışır
 * Tüm kulüpler, etkinlikler ve global istatistikler için snapshot oluşturur
 */

export class SnapshotCronJob {
    private job: cron.ScheduledTask | null = null;

    constructor(private readonly analyticsService: AnalyticsService) { }

    /**
     * Cron job'ı başlat
     * @param schedule Cron expression (default: her gün 02:00)
     */
    start(schedule: string = '0 2 * * *'): void {
        if (this.job) {
            console.log('⚠️ Snapshot cron job already running');
            return;
        }

        this.job = cron.schedule(schedule, async () => {
            console.log('🕐 Snapshot cron job started');
            const startTime = Date.now();

            try {
                const today = new Date();

                // 1. Global snapshot oluştur
                await this.analyticsService.generateGlobalSnapshot(today);

                // 2. Tüm kulüpler için snapshot oluştur
                await this.analyticsService.generateDailyClubSnapshots(today);

                // 3. Tüm etkinlikler için snapshot oluştur
                await this.analyticsService.generateDailyEventSnapshots(today);

                const duration = Date.now() - startTime;
                console.log(`✅ Snapshot cron job completed in ${duration}ms`);
            } catch (error: any) {
                console.error('❌ Snapshot cron job failed:', error.message);
            }
        });

        console.log(`✅ Snapshot cron job scheduled: ${schedule}`);
    }

    /**
     * Cron job'ı durdur
     */
    stop(): void {
        if (this.job) {
            this.job.stop();
            this.job = null;
            console.log('✅ Snapshot cron job stopped');
        }
    }

    /**
     * Manuel olarak snapshot oluştur (test için)
     */
    async runManually(): Promise<void> {
        console.log('🔧 Running snapshot job manually');
        const startTime = Date.now();

        try {
            const today = new Date();

            await this.analyticsService.generateGlobalSnapshot(today);
            await this.analyticsService.generateDailyClubSnapshots(today);
            await this.analyticsService.generateDailyEventSnapshots(today);

            const duration = Date.now() - startTime;
            console.log(`✅ Manual snapshot completed in ${duration}ms`);
        } catch (error: any) {
            console.error('❌ Manual snapshot failed:', error.message);
            throw error;
        }
    }
}
