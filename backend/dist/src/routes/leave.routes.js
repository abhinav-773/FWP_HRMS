import { Router } from 'express';
import { applyLeave, getMyLeaves, getTeamLeaves, processLeave, getPendingTeamLeaves, approveLeave, rejectLeave } from '../controllers/leave.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireAnyRole } from '../middlewares/role.middleware';
import { Role } from '@prisma/client';
const router = Router();
router.use(requireAuth);
router.post('/apply', applyLeave);
router.get('/my-leaves', getMyLeaves);
// Manager specific routes
router.get('/team', requireAnyRole([Role.SENIOR_MANAGER, Role.SUPER_ADMIN]), getTeamLeaves);
router.get('/manager/pending', requireAnyRole([Role.SENIOR_MANAGER, Role.SUPER_ADMIN]), getPendingTeamLeaves);
router.put('/:id/process', requireAnyRole([Role.SENIOR_MANAGER, Role.SUPER_ADMIN]), processLeave);
router.patch('/:id/approve', requireAnyRole([Role.SENIOR_MANAGER, Role.SUPER_ADMIN]), approveLeave);
router.patch('/:id/reject', requireAnyRole([Role.SENIOR_MANAGER, Role.SUPER_ADMIN]), rejectLeave);
export default router;
//# sourceMappingURL=leave.routes.js.map