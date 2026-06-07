import express from 'express';
import { getDashboardMetrics } from '../controllers/ats-analytics.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
const router = express.Router();
router.use(requireAuth);
router.use(requireRole(['SUPER_ADMIN', 'HR_RECRUITER']));
router.get('/metrics', getDashboardMetrics);
export default router;
//# sourceMappingURL=ats-analytics.routes.js.map