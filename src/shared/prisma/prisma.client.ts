import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

/**
 * Prisma Client Singleton with PostgreSQL Adapter
 * 
 * Prisma v7+ requires an adapter for PostgreSQL connections
 * Uses pg Pool for connection pooling
 */

class PrismaClientSingleton {
    private static instance: PrismaClient | null = null;
    private static pool: Pool | null = null;

    static getInstance(): PrismaClient {
        if (!PrismaClientSingleton.instance) {
            // Create PostgreSQL connection pool
            this.pool = new Pool({
                connectionString: process.env.DATABASE_URL,
                max: 10, // Maximum pool size
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 10000,
            });

            // Create Prisma adapter
            const adapter = new PrismaPg(this.pool);

            // Initialize Prisma Client with adapter
            PrismaClientSingleton.instance = new PrismaClient({
                adapter,
                log: process.env.NODE_ENV === 'development'
                    ? ['query', 'error', 'warn']
                    : ['error']
            });

            console.log('✅ Prisma Client initialized with PostgreSQL adapter');
        }

        return PrismaClientSingleton.instance;
    }

    static async disconnect(): Promise<void> {
        if (PrismaClientSingleton.instance) {
            await PrismaClientSingleton.instance.$disconnect();
            PrismaClientSingleton.instance = null;
            console.log('✅ Prisma Client disconnected');
        }

        if (this.pool) {
            await this.pool.end();
            this.pool = null;
            console.log('✅ PostgreSQL pool closed');
        }
    }
}

export const prisma = PrismaClientSingleton.getInstance();
export const prismaClient = PrismaClientSingleton;
