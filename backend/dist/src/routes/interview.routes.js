import express from 'express';
import { scheduleInterview, getInterviews, updateInterview, deleteInterview, getPublicInterview, getManagerInterviews, createManagerInterview, sendInterviewLink } from '../controllers/interview.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireAnyRole } from '../middlewares/role.middleware';
const router = express.Router();
// Public route for candidates
router.get('/public/:meetingUrl', getPublicInterview);
// Protected routes
router.use(requireAuth);
// Manager routes
router.use(requireAnyRole(['SUPER_ADMIN', 'HR_RECRUITER', 'SENIOR_MANAGER']));
router.get('/manager', getManagerInterviews);
router.post('/create', createManagerInterview);
router.post('/send-link', sendInterviewLink);
// HR routes
router.post('/', scheduleInterview);
router.get('/', getInterviews);
router.put('/:id', updateInterview);
router.delete('/:id', deleteInterview);
export default router;
//# sourceMappingURL=interview.routes.js.map