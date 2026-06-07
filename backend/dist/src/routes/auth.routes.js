import { Router } from 'express';
import { login, logout, refreshToken, changePassword } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware';
const router = Router();
// Public custom auth routes
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);
// Protected routes
router.post('/change-password', requireAuth, changePassword);
export default router;
//# sourceMappingURL=auth.routes.js.map