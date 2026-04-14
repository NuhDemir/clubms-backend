import { PrismaClient } from '@prisma/client';
import { UserEntity } from '../../modules/identity/domain/User.entity';

const prisma = new PrismaClient();

export { prisma };


