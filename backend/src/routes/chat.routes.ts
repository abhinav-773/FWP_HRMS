import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { sendChatMessage, getChatHistory, getUserSessions, getChatHealth } from '../controllers/chat.controller';

const router = Router();

router.post('/', requireAuth, sendChatMessage);
router.get('/sessions', requireAuth, getUserSessions);
router.get('/health', getChatHealth);
router.get('/:sessionId/history', requireAuth, getChatHistory);

export default router;
