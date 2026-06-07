import { Router } from 'express';
import { clockIn, clockOut, getMyStats, toggleBreak, getBreakStatus, getBurnoutCheck } from '../controllers/attendance.controller';
import { requireAuth } from '../middlewares/auth.middleware';
const router = Router();
router.use(requireAuth);
router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.post('/toggle-break', toggleBreak);
router.get('/break-status', getBreakStatus);
router.get('/burnout-check', getBurnoutCheck);
router.get('/my-stats', getMyStats);
export default router;
//# sourceMappingURL=attendance.routes.js.map