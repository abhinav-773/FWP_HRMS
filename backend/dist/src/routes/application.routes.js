import express from 'express';
import { applyForJob, getApplications, updateStage, updateNotes, retriggerAi, overrideDecision } from '../controllers/application.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireAnyRole } from '../middlewares/role.middleware';
const router = express.Router();
router.use(requireAuth);
router.use(requireAnyRole(['SUPER_ADMIN', 'HR_RECRUITER']));
router.post('/', applyForJob);
router.get('/', getApplications);
router.put('/:id/stage', updateStage);
router.put('/:id/notes', updateNotes);
router.post('/:id/retrigger-ai', retriggerAi);
router.post('/:id/override', overrideDecision);
export default router;
//# sourceMappingURL=application.routes.js.map