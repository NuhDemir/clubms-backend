/**
 * Production Configuration
 * 
 * Render ve production ortamı için özel ayarlar
 */

export const productionConfig = {
    // Server
    port: parseInt(process.env.PORT || '10000', 10),
    nodeEnv: process.env.NODE_ENV || 'production',

    // CORS
    corsOrigin: process.env.CORS_ORIGIN || '*',

    // Database
    database: {
        url: process.env.DATABASE_URL,
        // Connection pool settings for production
        pool: {
            min: 2,
            max: 10,
            acquireTimeoutMillis: 30000,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000
        }
    },

    // Redis
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        retryStrategy: (times: number) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
        }
    },

    // Firebase
    firebase: {
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL
    },

    // QR Code
    qrCode: {
        secretBase: process.env.QR_SECRET_BASE || 'change-this-in-production'
    },

    // Logging
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        prettyPrint: false // Production'da JSON format
    },

    // Rate Limiting
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // 100 requests per window
        standardHeaders: true,
        legacyHeaders: false
    },

    // Cron Jobs
    cron: {
        enabled: process.env.CRON_ENABLED !== 'false', // Default: enabled
        timezone: 'Europe/Istanbul'
    },

    // BullMQ
    bullmq: {
        defaultJobOptions: {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000
            },
            removeOnComplete: {
                age: 24 * 3600, // 24 hours
                count: 1000
            },
            removeOnFail: {
                age: 7 * 24 * 3600 // 7 days
            }
        }
    },

    // Health Check
    healthCheck: {
        timeout: 5000,
        interval: 30000
    }
};

// Validate required environment variables
export const validateProductionConfig = (): void => {
    const required = [
        'DATABASE_URL',
        'FIREBASE_PROJECT_ID',
        'FIREBASE_PRIVATE_KEY',
        'FIREBASE_CLIENT_EMAIL',
        'QR_SECRET_BASE'
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}\n` +
            'Please check your .env file or Render environment variables.'
        );
    }

    console.log('✅ Production configuration validated');
};
