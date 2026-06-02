import { Router } from 'express';
import { getEmployees, getEmployeeById, createEmployee, updateEmployee } from '../controllers/employee.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Protect all employee routes
router.use(requireAuth);

router.get('/', getEmployees);
router.get('/:id', getEmployeeById);

// Only Admins or HR can create employees
router.post('/', requireRole([Role.SUPER_ADMIN, Role.HR_RECRUITER]), createEmployee);

// Only Admins, HR, or Managers can update employees
router.put('/:id', requireRole([Role.SUPER_ADMIN, Role.HR_RECRUITER, Role.SENIOR_MANAGER]), updateEmployee);

export default router;
