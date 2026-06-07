import { Router } from 'express';
import { uploadDocument, getMyDocuments, verifyDocument } from '../controllers/document.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireAnyRole } from '../middlewares/role.middleware';
import { upload } from '../middlewares/upload.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(requireAuth);

router.get('/', getMyDocuments);
router.post('/upload', upload.single('file'), uploadDocument);

// HR/Admin can verify documents
router.put('/:id/verify', requireAnyRole([Role.SUPER_ADMIN, Role.HR_RECRUITER]), verifyDocument);

export default router;
