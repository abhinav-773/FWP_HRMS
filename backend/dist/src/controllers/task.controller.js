import taskService from '../services/task.service';
export const assignTask = async (req, res) => {
    try {
        const userId = req.user.userId;
        const task = await taskService.assignTask(userId, req.body);
        res.status(201).json({ data: task, message: 'Task assigned successfully' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
export const updateTaskProgress = async (req, res) => {
    try {
        const userId = req.user.userId;
        const id = req.params.id;
        const task = await taskService.updateTaskProgress(userId, id, req.body);
        res.json({ data: task, message: 'Task updated successfully' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
export const getMyTasks = async (req, res) => {
    try {
        const userId = req.user.userId;
        const tasks = await taskService.getMyTasks(userId);
        res.json({ data: tasks });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const getTeamTasks = async (req, res) => {
    try {
        const userId = req.user.userId;
        const tasks = await taskService.getTeamTasks(userId);
        res.json({ data: tasks });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
//# sourceMappingURL=task.controller.js.map