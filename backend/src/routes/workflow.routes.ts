import { Router } from 'express';
import { getRules, toggleRule, triggerTestEvent } from '../controllers/workflow.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Secure these endpoints with authentication
router.use(requireAuth);

router.get('/', getRules);
router.patch('/:id/toggle', toggleRule);
router.post('/trigger', triggerTestEvent);

export default router;
