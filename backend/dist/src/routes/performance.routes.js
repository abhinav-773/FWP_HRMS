import { Router } from 'express';
import { createGoal, getMyGoals, getEmployeeGoals, updateGoalProgress, createReview, getMyReviews, requestFeedback, getMyFeedback, generateAISummary } from '../controllers/performance.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireAnyRole } from '../middlewares/role.middleware';
import { Role } from '@prisma/client';
const router = Router();
router.use(requireAuth);
// Employee OKRs
router.get('/my-goals', getMyGoals);
router.put('/goals/:goalId', updateGoalProgress);
// Employee Reviews & Peer feedback
router.get('/my-reviews', getMyReviews);
router.post('/feedback', requestFeedback);
router.get('/my-feedback', getMyFeedback);
// HR / Manager / Admin routes
router.post('/goals', requireAnyRole([Role.SUPER_ADMIN, Role.HR_RECRUITER, Role.SENIOR_MANAGER]), createGoal);
router.get('/employee/:employeeId/goals', requireAnyRole([Role.SUPER_ADMIN, Role.HR_RECRUITER, Role.SENIOR_MANAGER]), getEmployeeGoals);
router.post('/reviews', requireAnyRole([Role.SUPER_ADMIN, Role.HR_RECRUITER, Role.SENIOR_MANAGER]), createReview);
router.post('/ai-summary', requireAnyRole([Role.SUPER_ADMIN, Role.HR_RECRUITER, Role.SENIOR_MANAGER]), generateAISummary);
export default router;
//# sourceMappingURL=performance.routes.js.map