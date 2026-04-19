import { app } from './app';
import * as dotenv from 'dotenv';
import { outboxProcessor } from './modules/infrastructure/outbox/outbox.processor';
import { redisClient } from './shared/redis/redis.client';
import { container } from './core/container/container';
import { SnapshotCronJob } from './modules/analytics/jobs/snapshot.cron';

// Event listeners'ı import et (register için)
import './modules/notifications/listeners/event.listener';

// Workers'ı import et (başlatmak için)
import './modules/notifications/workers/email.worker';
import './modules/notifications/workers/push.worker';

dotenv.config();

const PORT = process.env.PORT || 3000;

const bootstrap = async () => {
  try {
    // HTTP Server başlat
    const server = app.listen(PORT, () => {
      console.log(`🚀 ClubMS Server is running on port ${PORT}`);
    });

    // Outbox Processor başlat (5 saniyede bir polling)
    outboxProcessor.start(5000);
    console.log('📦 Outbox processor started');

    // Redis bağlantısını test et
    await redisClient.ping();
    console.log('✅ Redis connection established');

    // Analytics Snapshot Cron Job başlat (her gün 02:00)
    const analyticsService = container.resolve('analyticsService') as any;
    const snapshotCronJob = new SnapshotCronJob(analyticsService);
    snapshotCronJob.start('0 2 * * *'); // Her gün 02:00
    console.log('📊 Analytics snapshot cron job started');

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n⚠️ ${signal} received, starting graceful shutdown...`);

      // HTTP server'ı kapat
      server.close(() => {
        console.log('✅ HTTP server closed');
      });

      // Outbox processor'ı durdur
      outboxProcessor.stop();

      // Cron job'ı durdur
      snapshotCronJob.stop();

      // Redis bağlantısını kapat
      await redisClient.disconnect();
      console.log('✅ Redis connection closed');

      console.log('✅ Graceful shutdown completed');
      process.exit(0);
    };

    // Shutdown sinyallerini dinle
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

bootstrap();
