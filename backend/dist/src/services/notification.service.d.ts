import { NotificationType } from '@prisma/client';
export declare class NotificationService {
    sendNotification(userId: string, title: string, message: string, type: NotificationType, link?: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.NotificationType;
        message: string;
        title: string;
        isRead: boolean;
        link: string | null;
    }>;
    getMyNotifications(userId: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.NotificationType;
        message: string;
        title: string;
        isRead: boolean;
        link: string | null;
    }[]>;
    markAsRead(notificationId: string, userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    markAllAsRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
declare const _default: NotificationService;
export default _default;
//# sourceMappingURL=notification.service.d.ts.map