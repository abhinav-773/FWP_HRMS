import leaveService from '../services/leave.service';
export const applyLeave = async (req, res) => {
    try {
        const userId = req.user.userId;
        const leave = await leaveService.applyLeave(userId, req.body);
        res.status(201).json({ data: leave, message: 'Leave request submitted' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
export const getMyLeaves = async (req, res) => {
    try {
        const userId = req.user.userId;
        const leaves = await leaveService.getMyLeaves(userId);
        res.json({ data: leaves });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const getTeamLeaves = async (req, res) => {
    try {
        const userId = req.user.userId;
        const leaves = await leaveService.getTeamLeaves(userId);
        res.json({ data: leaves });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const processLeave = async (req, res) => {
    try {
        const userId = req.user.userId;
        const id = req.params.id;
        const { status } = req.body;
        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        const leave = await leaveService.processLeave(userId, id, status);
        res.json({ data: leave, message: `Leave request ${status.toLowerCase()}` });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
//# sourceMappingURL=leave.controller.js.map