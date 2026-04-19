import { Router } from 'express';
import {
    createClub,
    getAllClubs,
    getClubById,
    updateClub,
    deactivateClub
} from './controllers/clubs.controller';
import {
    joinClub,
    getClubMembers,
    getPendingApplications,
    approveMembership,
    rejectMembership,
    changeRole,
    leaveMembership,
    getMembershipStats,
    getMyMemberships
} from './controllers/memberships.controller';
import { authMiddleware } from '../../core/middleware/auth.middleware';
import { loadGlobalRole } from '../../core/middleware/loadGlobalRole.middleware';
import { loadClubRole } from '../../core/middleware/loadClubRole.middleware';
import { requireGlobalRole } from '../../core/middleware/rbac.middleware';
import { requireMinClubRole } from '../../core/middleware/rbac.middleware';

const router = Router();

// ==================== CLUB ROUTES ====================

// GET /api/v1/clubs - Aktif kulüp listesi (PUBLIC)
router.get('/clubs', getAllClubs);

// POST /api/v1/clubs - Yeni kulüp (SUPER_ADMIN)
router.post(
    '/clubs',
    authMiddleware,
    loadGlobalRole,
    requireGlobalRole('SUPER_ADMIN'),
    createClub
);

// GET /api/v1/clubs/:id - Kulüp detay (PUBLIC)
router.get('/clubs/:id', getClubById);

// PATCH /api/v1/clubs/:id - Kulüp güncelle (CLUB_PRESIDENT)
router.patch(
    '/clubs/:id',
    authMiddleware,
    loadClubRole('id'),
    requireMinClubRole('PRESIDENT'),
    updateClub
);

// PATCH /api/v1/clubs/:id/deactivate - Kulübü askıya al (SUPER_ADMIN)
router.patch(
    '/clubs/:id/deactivate',
    authMiddleware,
    loadGlobalRole,
    requireGlobalRole('SUPER_ADMIN'),
    deactivateClub
);

// ==================== MEMBERSHIP ROUTES ====================

// GET /api/v1/memberships/me - Kullanıcının üyelikleri (AUTH)
router.get('/memberships/me', authMiddleware, getMyMemberships);

// GET /api/v1/clubs/:clubId/members - Üye listesi (CLUB_MEMBER)
router.get(
    '/clubs/:clubId/members',
    authMiddleware,
    loadClubRole('clubId'),
    requireMinClubRole('MEMBER'),
    getClubMembers
);

// GET /api/v1/clubs/:clubId/members/pending - Bekleyen başvurular (CLUB_PRESIDENT)
router.get(
    '/clubs/:clubId/members/pending',
    authMiddleware,
    loadClubRole('clubId'),
    requireMinClubRole('PRESIDENT'),
    getPendingApplications
);

// GET /api/v1/clubs/:clubId/members/stats - Üyelik istatistikleri (CLUB_MEMBER)
router.get(
    '/clubs/:clubId/members/stats',
    authMiddleware,
    loadClubRole('clubId'),
    requireMinClubRole('MEMBER'),
    getMembershipStats
);

// POST /api/v1/clubs/:clubId/members - Üyelik başvurusu (AUTH)
router.post('/clubs/:clubId/members', authMiddleware, joinClub);

// PATCH /api/v1/clubs/:clubId/members/:userId/approve - Üyelik onayla (CLUB_PRESIDENT)
router.patch(
    '/clubs/:clubId/members/:userId/approve',
    authMiddleware,
    loadClubRole('clubId'),
    requireMinClubRole('PRESIDENT'),
    approveMembership
);

// PATCH /api/v1/clubs/:clubId/members/:userId/reject - Üyelik reddet (CLUB_PRESIDENT)
router.patch(
    '/clubs/:clubId/members/:userId/reject',
    authMiddleware,
    loadClubRole('clubId'),
    requireMinClubRole('PRESIDENT'),
    rejectMembership
);

// PATCH /api/v1/clubs/:clubId/members/:userId/role - Rol değiştir (CLUB_PRESIDENT)
router.patch(
    '/clubs/:clubId/members/role',
    authMiddleware,
    loadClubRole('clubId'),
    requireMinClubRole('PRESIDENT'),
    changeRole
);

// DELETE /api/v1/clubs/:clubId/members - Kulüpten ayrıl (AUTH)
router.delete('/clubs/:clubId/members', authMiddleware, leaveMembership);

export { router as ClubsRouter };
