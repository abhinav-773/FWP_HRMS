import express from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { bulkUploadResumes } from '../controllers/bulkUpload.controller';
import multer from 'multer';
import fs from 'fs';
const router = express.Router();
// Ensure upload directory exists
const uploadDir = 'uploads/resumes/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
// Set up Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per file
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf' ||
            file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            file.mimetype === 'application/msword' ||
            file.mimetype === 'text/plain') {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only PDF and DOCX are allowed.'));
        }
    }
});
// Route: POST /api/bulk-upload/:jobId
router.post('/:jobId', requireAuth, requireRole(['HR_RECRUITER', 'SUPER_ADMIN']), upload.array('resumes', 50), // Accept up to 50 resumes at once
bulkUploadResumes);
export default router;
//# sourceMappingURL=bulkUpload.routes.js.map