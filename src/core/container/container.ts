// src/core/container.ts

import { createContainer, asClass, asValue, InjectionMode } from 'awilix';
import { prisma } from '../../shared/prisma/prisma.client';

// Identity
import { PrismaUserRepository } from '../../modules/identity/repositories/user.repository';
import { PrismaGlobalRoleRepository } from '../../modules/identity/repositories/globalRole.repository';
import { AuthService } from '../../modules/identity/services/auth.service';
import { UserService } from '../../modules/identity/services/user.service';
import { RoleService } from '../../modules/identity/services/role.service';

// Clubs
import { PrismaClubRepository } from '../../modules/clubs/repositories/club.repository';
import { PrismaMembershipRepository } from '../../modules/clubs/repositories/membership.repository';
import { ClubsService } from '../../modules/clubs/services/clubs.service';
import { MembershipsService } from '../../modules/clubs/services/memberships.service';

// Events
import { PrismaEventRepository } from '../../modules/events/repositories/event.repository';
import { PrismaAttendanceRepository } from '../../modules/events/repositories/attendance.repository';
import { EventsService } from '../../modules/events/services/events.service';
import { AttendanceService } from '../../modules/events/services/attendance.service';

const container = createContainer({
  injectionMode: InjectionMode.CLASSIC
});

container.register({
  // Altyapı — singleton
  prisma: asValue(prisma),

  // Identity Repository — her istekte yeni
  userRepository: asClass(PrismaUserRepository).scoped(),
  globalRoleRepository: asClass(PrismaGlobalRoleRepository).scoped(),

  // Identity Service — her istekte yeni  
  authService: asClass(AuthService).scoped(),
  userService: asClass(UserService).scoped(),
  roleService: asClass(RoleService).scoped(),

  // Clubs Repository — her istekte yeni
  clubRepository: asClass(PrismaClubRepository).scoped(),
  membershipRepository: asClass(PrismaMembershipRepository).scoped(),

  // Clubs Service — her istekte yeni (clubServicePublic için de kullanılır)
  clubsService: asClass(ClubsService).scoped(),
  clubServicePublic: asClass(ClubsService).scoped(), // Cross-context için alias
  membershipsService: asClass(MembershipsService).scoped(),

  // Events Repository — her istekte yeni
  eventRepository: asClass(PrismaEventRepository).scoped(),
  attendanceRepository: asClass(PrismaAttendanceRepository).scoped(),

  // Events Service — her istekte yeni
  eventsService: asClass(EventsService).scoped(),
  attendanceService: asClass(AttendanceService).scoped(),
});


export { container };

/**
asValue    → hazır obje, direkt kullan (prisma)
asClass    → sınıf, gerekince oluştur (service, repository)
scoped()   → her HTTP isteğinde temiz instance
singleton()→ uygulama boyunca tek instance (prisma için)
CLASSIC    → constructor parametre ismine göre inject et
 */