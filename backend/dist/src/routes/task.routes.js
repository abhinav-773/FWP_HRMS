import { Router } from 'express';
import { assignTask, updateTaskProgress, getMyTasks, getTeamTasks } from '../controllers/task.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireAnyRole } from '../middlewares/role.middleware';
import { Role } from '@prisma/client';
const router = Router();
router.use(requireAuth);
// Employee routes
router.get('/my-tasks', getMyTasks);
router.patch('/:id/progress', updateTaskProgress);
// Manager routes
router.post('/assign', requireAnyRole([Role.SENIOR_MANAGER, Role.SUPER_ADMIN]), assignTask);
router.get('/team', requireAnyRole([Role.SENIOR_MANAGER, Role.SUPER_ADMIN]), getTeamTasks);
export default router;
//# sourceMappingURL=task.routes.js.map