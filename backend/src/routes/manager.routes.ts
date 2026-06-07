import { Router } from 'express';
import { requireRole } from '../middlewares/role.middleware';
import { 
  getTeamDashboard, 
  createTeamTask, 
  getTeamTasks, 
  getLeaveApprovals, 
  approveLeave, 
  submitPerformanceReview, 
  getTeamAnalytics,
  getTeamMembers
} from '../controllers/manager.controller';

const router = Router();

router.use(requireRole('SENIOR_MANAGER'));

router.get('/dashboard', getTeamDashboard);
router.get('/tasks', getTeamTasks);
router.post('/tasks', createTeamTask);
router.get('/leaves', getLeaveApprovals);
router.put('/leaves/:id', approveLeave);
router.post('/reviews', submitPerformanceReview);
router.get('/analytics', getTeamAnalytics);
router.get('/team-members', getTeamMembers);

export default router;
