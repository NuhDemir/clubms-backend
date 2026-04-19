// src/core/container.ts

import { createContainer, asClass, asValue, InjectionMode } from 'awilix';
import { prisma } from '../../shared/prisma/prisma.client';
import { PrismaUserRepository } from '../../modules/identity/repositories/user.repository';
import { AuthService } from '../../modules/identity/services/auth.service';

const container = createContainer({
  injectionMode: InjectionMode.CLASSIC
});

container.register({
  // Altyapı — singleton
  prisma: asValue(prisma),

  // Repository — her istekte yeni
  userRepository: asClass(PrismaUserRepository).scoped(),

  // Service — her istekte yeni  
  authService: asClass(AuthService).scoped(),
});


export { container };

/**
asValue    → hazır obje, direkt kullan (prisma)
asClass    → sınıf, gerekince oluştur (service, repository)
scoped()   → her HTTP isteğinde temiz instance
singleton()→ uygulama boyunca tek instance (prisma için)
CLASSIC    → constructor parametre ismine göre inject et
 */