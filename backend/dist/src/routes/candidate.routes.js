import express from 'express';
import { createCandidate, getCandidates, getCandidateById, updateCandidate, deleteCandidate } from '../controllers/candidate.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireAnyRole } from '../middlewares/role.middleware';
import { upload } from '../middlewares/upload.middleware';
const router = express.Router();
router.use(requireAuth);
router.use(requireAnyRole(['SUPER_ADMIN', 'HR_RECRUITER']));
router.get('/', getCandidates);
router.get('/:id', getCandidateById);
router.post('/', upload.single('resume'), createCandidate);
router.put('/:id', upload.single('resume'), updateCandidate);
router.delete('/:id', deleteCandidate);
export default router;
//# sourceMappingURL=candidate.routes.js.map