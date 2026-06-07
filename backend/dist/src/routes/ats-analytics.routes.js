import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireAnyRole } from '../middlewares/role.middleware';
import { getDashboardMetrics } from '../controllers/ats-analytics.controller';
const router = Router();
router.use(requireAuth);
// Apply RBAC: Admin, Recruiter, and Manager can view analytics
router.use(requireAnyRole(['SUPER_ADMIN', 'HR_RECRUITER', 'SENIOR_MANAGER']));
router.get('/metrics', getDashboardMetrics);
export default router;
//# sourceMappingURL=ats-analytics.routes.js.map