import { Router } from 'express';
import { createChecklist, getMyChecklist, getEmployeeChecklist, getAllChecklists, updateTask, assignAsset, getMyAssets, getAllAssets, releaseAsset, getOnboardingStatus, changePassword, uploadDocument, getAllOnboardingEmployees, verifyDocument, activateEmployee } from '../controllers/onboarding.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { upload } from '../middlewares/upload.middleware';
import { Role } from '@prisma/client';
const router = Router();
// All onboarding routes require authentication
router.use(requireAuth);
// Candidate / New Hire routes
router.get('/status', getOnboardingStatus);
router.post('/change-password', changePassword);
router.post('/upload/:taskId', upload.single('file'), uploadDocument);
router.get('/my-checklist', getMyChecklist);
router.get('/my-assets', getMyAssets);
router.put('/tasks/:taskId', updateTask);
// Recruiter / Admin routes
router.get('/employees', requireRole([Role.SUPER_ADMIN, Role.HR_RECRUITER]), getAllOnboardingEmployees);
router.put('/verify-document/:documentId', requireRole([Role.SUPER_ADMIN, Role.HR_RECRUITER]), verifyDocument);
router.post('/employee/:employeeId/activate', requireRole([Role.SUPER_ADMIN, Role.HR_RECRUITER]), activateEmployee);
router.post('/checklists', requireRole([Role.SUPER_ADMIN, Role.HR_RECRUITER]), createChecklist);
router.get('/checklists', requireRole([Role.SUPER_ADMIN, Role.HR_RECRUITER]), getAllChecklists);
router.get('/employee/:employeeId', requireRole([Role.SUPER_ADMIN, Role.HR_RECRUITER, Role.SENIOR_MANAGER]), getEmployeeChecklist);
router.post('/assets', requireRole([Role.SUPER_ADMIN, Role.HR_RECRUITER]), assignAsset);
router.get('/assets', requireRole([Role.SUPER_ADMIN, Role.HR_RECRUITER]), getAllAssets);
router.put('/assets/:assetId/release', requireRole([Role.SUPER_ADMIN, Role.HR_RECRUITER]), releaseAsset);
export default router;
//# sourceMappingURL=onboarding.routes.js.map