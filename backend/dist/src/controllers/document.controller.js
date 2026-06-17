import documentService from '../services/document.service';
import { StorageFactory } from '../services/storage/StorageFactory';
export const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const userId = req.user.userId;
        const { name, documentType } = req.body;
        const storageProvider = StorageFactory.getProvider();
        const uploadResult = await storageProvider.upload(req.file.buffer, req.file.originalname, 'documents');
        const doc = await documentService.saveDocument(userId, name, documentType, uploadResult.url, uploadResult.provider, uploadResult.publicId);
        res.status(201).json({ data: doc, message: 'Document uploaded successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const getMyDocuments = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { search, type } = req.query;
        const docs = await documentService.getMyDocuments(userId, search ? String(search) : undefined, type ? String(type) : undefined);
        res.json({ data: docs });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const verifyDocument = async (req, res) => {
    try {
        const id = req.params.id;
        const doc = await documentService.verifyDocument(id);
        res.json({ data: doc, message: 'Document verified' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
//# sourceMappingURL=document.controller.js.map