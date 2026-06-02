import { Router } from 'express';
import { uploadDocument, getMyDocuments, verifyDocument } from '../controllers/document.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { upload } from '../middlewares/upload.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(requireAuth);

router.get('/', getMyDocuments);
router.post('/upload', upload.single('file'), uploadDocument);

// HR/Admin can verify documents
router.put('/:id/verify', requireRole([Role.SUPER_ADMIN, Role.HR_RECRUITER]), verifyDocument);

export default router;
