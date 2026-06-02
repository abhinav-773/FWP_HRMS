import { Router } from 'express';
import { applyLeave, getMyLeaves, getTeamLeaves, processLeave } from '../controllers/leave.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(requireAuth);

router.post('/apply', applyLeave);
router.get('/my-leaves', getMyLeaves);

// Manager specific routes
router.get('/team', requireRole([Role.SENIOR_MANAGER, Role.SUPER_ADMIN]), getTeamLeaves);
router.put('/:id/process', requireRole([Role.SENIOR_MANAGER, Role.SUPER_ADMIN]), processLeave);

export default router;
