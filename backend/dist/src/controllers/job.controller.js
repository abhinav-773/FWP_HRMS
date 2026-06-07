import jobService from '../services/job.service';
export const createJob = async (req, res) => {
    try {
        const userId = req.user.userId;
        const job = await jobService.createJob(req.body, userId);
        res.status(201).json({ data: job, message: 'Job posting created successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const getJobs = async (req, res) => {
    try {
        const jobs = await jobService.getAllJobs(req.query);
        res.json({ data: jobs });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const getJobById = async (req, res) => {
    try {
        const id = req.params.id;
        const job = await jobService.getJobById(id);
        if (!job)
            return res.status(404).json({ error: 'Job not found' });
        res.json({ data: job });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const updateJob = async (req, res) => {
    try {
        const id = req.params.id;
        const job = await jobService.updateJob(id, req.body);
        res.json({ data: job, message: 'Job updated successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const deleteJob = async (req, res) => {
    try {
        const id = req.params.id;
        await jobService.deleteJob(id);
        res.json({ message: 'Job deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
//# sourceMappingURL=job.controller.js.map