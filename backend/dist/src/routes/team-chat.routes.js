import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { getConversations, getMessages, sendMessage, createConversation } from '../controllers/team-chat.controller';
const router = Router();
router.use(requireAuth);
router.get('/', getConversations);
router.post('/', createConversation);
router.get('/:conversationId/messages', getMessages);
router.post('/:conversationId/messages', sendMessage);
export default router;
//# sourceMappingURL=team-chat.routes.js.map