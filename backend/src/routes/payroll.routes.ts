import { Router } from 'express';
import { 
  generatePayroll, getMyPayslips, markAsPaid, downloadPayslip 
} from '../controllers/payroll.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireAnyRole } from '../middlewares/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(requireAuth);

router.get('/my-payslips', getMyPayslips);
router.get('/:id/download', downloadPayslip);

// HR / Admin routes
router.post('/generate', requireAnyRole([Role.HR_RECRUITER, Role.SUPER_ADMIN]), generatePayroll);
router.put('/:id/pay', requireAnyRole([Role.SUPER_ADMIN]), markAsPaid);

export default router;
