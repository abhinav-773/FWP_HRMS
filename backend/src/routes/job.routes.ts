import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireAnyRole } from '../middlewares/role.middleware';
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob
} from '../controllers/job.controller';

const router = Router();

router.use(requireAuth);

router.get('/', getJobs);
router.get('/:id', getJobById);

router.use(requireAnyRole(['SUPER_ADMIN', 'HR_RECRUITER']));

router.post('/', createJob);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);

export default router;
