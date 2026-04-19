import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client Singleton
 * 
 * Global Prisma instance - tüm uygulama boyunca tek bir instance kullanılır
 */

class PrismaClientSingleton {
    private static instance: PrismaClient | null = null;

    static getInstance(): PrismaClient {
        if (!PrismaClientSingleton.instance) {
            PrismaClientSingleton.instance = new PrismaClient({
                log: process.env.NODE_ENV === 'development'
                    ? ['query', 'error', 'warn']
                    : ['error']
            });

            console.log('✅ Prisma Client initialized');
        }

        return PrismaClientSingleton.instance;
    }

    static async disconnect(): Promise<void> {
        if (PrismaClientSingleton.instance) {
            await PrismaClientSingleton.instance.$disconnect();
            PrismaClientSingleton.instance = null;
            console.log('✅ Prisma Client disconnected');
        }
    }
}

export const prisma = PrismaClientSingleton.getInstance();
export const prismaClient = PrismaClientSingleton;
