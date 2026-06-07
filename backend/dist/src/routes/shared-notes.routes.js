import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { getSharedNotes, addSharedNote } from '../controllers/shared-notes.controller';
const router = Router();
router.use(requireAuth);
router.get('/:candidateId', getSharedNotes);
router.post('/:candidateId', addSharedNote);
export default router;
//# sourceMappingURL=shared-notes.routes.js.map