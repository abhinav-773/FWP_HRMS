import prisma from '../config/prisma';
import { io } from '../index';
export class NotificationService {
    async sendNotification(userId, title, message, type, link) {
        const notification = await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                link
            }
        });
        // Emit real-time event to the specific user room
        io.to(userId).emit('new_notification', notification);
        return notification;
    }
    async getMyNotifications(userId) {
        return await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20 // Return top 20 recent
        });
    }
    async markAsRead(notificationId, userId) {
        return await prisma.notification.updateMany({
            where: { id: notificationId, userId },
            data: { isRead: true }
        });
    }
    async markAllAsRead(userId) {
        return await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true }
        });
    }
}
export default new NotificationService();
//# sourceMappingURL=notification.service.js.map