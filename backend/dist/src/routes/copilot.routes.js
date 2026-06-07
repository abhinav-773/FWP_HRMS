import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { getLowAttendance, getPayrollSummary, getLeaveRequests, getTopCandidates, getOpenJobs, createJobPosting } from '../controllers/copilot.controller';
const router = Router();
// Apply auth middleware which now supports X-Service-Key bypass for AI Copilot
router.use(requireAuth);
router.get('/attendance/low', getLowAttendance);
router.get('/payroll/summary', getPayrollSummary);
router.get('/leaves/pending', getLeaveRequests);
router.get('/ats/candidates/top', getTopCandidates);
router.get('/ats/jobs/open', getOpenJobs);
router.post('/ats/jobs', createJobPosting);
export default router;
//# sourceMappingURL=copilot.routes.js.map