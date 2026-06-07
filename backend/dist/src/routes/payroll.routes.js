import { Router } from 'express';
import { generatePayroll, getMyPayslips, markAsPaid, downloadPayslip } from '../controllers/payroll.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { Role } from '@prisma/client';
const router = Router();
router.use(requireAuth);
router.get('/my-payslips', getMyPayslips);
router.get('/:id/download', downloadPayslip);
// HR / Admin routes
router.post('/generate', requireRole([Role.HR_RECRUITER, Role.SUPER_ADMIN]), generatePayroll);
router.put('/:id/pay', requireRole([Role.SUPER_ADMIN]), markAsPaid);
export default router;
//# sourceMappingURL=payroll.routes.js.map