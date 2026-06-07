import express from 'express';
import { scheduleInterview, getInterviews, updateInterview, deleteInterview, getPublicInterview } from '../controllers/interview.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
const router = express.Router();
// Public route for candidates
router.get('/public/:meetingUrl', getPublicInterview);
// Protected routes
router.use(requireAuth);
router.use(requireRole(['SUPER_ADMIN', 'HR_RECRUITER']));
router.post('/', scheduleInterview);
router.get('/', getInterviews);
router.put('/:id', updateInterview);
router.delete('/:id', deleteInterview);
export default router;
//# sourceMappingURL=interview.routes.js.map