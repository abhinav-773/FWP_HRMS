import notificationService from '../services/notification.service';
export const getMyNotifications = async (req, res) => {
    try {
        const userId = req.user.userId;
        const notifications = await notificationService.getMyNotifications(userId);
        res.json({ data: notifications });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const markAsRead = async (req, res) => {
    try {
        const userId = req.user.userId;
        const id = req.params.id;
        await notificationService.markAsRead(id, userId);
        res.json({ message: 'Notification marked as read' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.userId;
        await notificationService.markAllAsRead(userId);
        res.json({ message: 'All notifications marked as read' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
//# sourceMappingURL=notification.controller.js.map