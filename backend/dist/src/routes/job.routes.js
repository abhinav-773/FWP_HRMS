import express from 'express';
import { createJob, getJobs, getJobById, updateJob, deleteJob } from '../controllers/job.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
const router = express.Router();
router.use(requireAuth);
router.get('/', getJobs);
router.get('/:id', getJobById);
router.use(requireRole(['SUPER_ADMIN', 'HR_RECRUITER']));
router.post('/', createJob);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);
export default router;
//# sourceMappingURL=job.routes.js.map