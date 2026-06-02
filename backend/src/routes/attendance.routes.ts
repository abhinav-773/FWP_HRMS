import { Router } from 'express';
import { clockIn, clockOut, getMyStats } from '../controllers/attendance.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.get('/my-stats', getMyStats);

export default router;
