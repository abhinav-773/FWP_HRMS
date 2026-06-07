import documentService from '../services/document.service';
export const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const userId = req.user.userId;
        const { name, documentType } = req.body;
        // Convert absolute path to a relative URL for frontend consumption
        // Assuming backend runs on port 3000 and serves /uploads statically
        const fileUrl = `/uploads/${req.file.filename}`;
        const doc = await documentService.saveDocument(userId, name, documentType, fileUrl);
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