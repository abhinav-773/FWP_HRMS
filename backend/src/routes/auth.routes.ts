import { Router } from 'express';
import { register, login, refresh, logout, me } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);

// Example of protected route getting current user
router.get('/me', requireAuth, me);

// Example of RBAC protected route for Super Admin creating HRs
router.post('/admin/create-manager', requireAuth, requireRole([Role.SUPER_ADMIN]), (req, res) => {
  res.json({ message: 'Only super admin can see this' });
});

export default router;
