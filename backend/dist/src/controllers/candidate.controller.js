import candidateService from '../services/candidate.service';
import { StorageFactory } from '../services/storage/StorageFactory';
export const createCandidate = async (req, res) => {
    try {
        const data = { ...req.body };
        if (req.file) {
            const storageProvider = StorageFactory.getProvider();
            const uploadResult = await storageProvider.upload(req.file.buffer, req.file.originalname, 'resumes');
            data.resumeUrl = uploadResult.url;
            data.resumeProvider = uploadResult.provider;
            data.resumePublicId = uploadResult.publicId;
        }
        // Skills might come as a comma-separated string if sent via FormData
        if (typeof data.skills === 'string') {
            data.skills = data.skills.split(',').map((s) => s.trim());
        }
        const candidate = await candidateService.createCandidate(data);
        res.status(201).json({ data: candidate, message: 'Candidate added successfully' });
    }
    catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: error.message });
    }
};
export const getCandidates = async (req, res) => {
    try {
        const candidates = await candidateService.getAllCandidates(req.query);
        res.json({ data: candidates });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const getCandidateById = async (req, res) => {
    try {
        const id = req.params.id;
        const candidate = await candidateService.getCandidateById(id);
        if (!candidate)
            return res.status(404).json({ error: 'Candidate not found' });
        res.json({ data: candidate });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const updateCandidate = async (req, res) => {
    try {
        const id = req.params.id;
        const data = { ...req.body };
        if (req.file) {
            const storageProvider = StorageFactory.getProvider();
            const uploadResult = await storageProvider.upload(req.file.buffer, req.file.originalname, 'resumes');
            data.resumeUrl = uploadResult.url;
            data.resumeProvider = uploadResult.provider;
            data.resumePublicId = uploadResult.publicId;
        }
        if (typeof data.skills === 'string') {
            data.skills = data.skills.split(',').map((s) => s.trim());
        }
        const candidate = await candidateService.updateCandidate(id, data);
        res.json({ data: candidate, message: 'Candidate updated successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const deleteCandidate = async (req, res) => {
    try {
        const id = req.params.id;
        await candidateService.deleteCandidate(id);
        res.json({ message: 'Candidate deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
//# sourceMappingURL=candidate.controller.js.map