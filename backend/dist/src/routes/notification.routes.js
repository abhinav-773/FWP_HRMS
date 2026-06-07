import { Router } from 'express';
import { getMyNotifications, markAsRead, markAllAsRead } from '../controllers/notification.controller';
import { requireAuth } from '../middlewares/auth.middleware';
const router = Router();
router.use(requireAuth);
router.get('/', getMyNotifications);
router.put('/mark-all-read', markAllAsRead);
router.put('/:id/read', markAsRead);
export default router;
//# sourceMappingURL=notification.routes.js.map