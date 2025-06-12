export enum NotificationType {
    MESSAGE = "MESSAGE",
    CHANNEL_POST = "CHANNEL_POST",
    CHANNEL_INVITE = "CHANNEL_INVITE",
    TEAM_INVITE = "TEAM_INVITE",
    ROLE_UPDATE = "ROLE_UPDATE",
    SYSTEM = "SYSTEM",
    CALL = "CALL",
    FILE_SHARE = "FILE_SHARE",
}

export enum NotificationPriority {
    URGENT = "urgent",
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low",
}

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    priority: NotificationPriority;
    isRead: boolean;
    createdAt: Date;
    link?: string;
    metadata?: Record<string, any>;
}

export interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
    addNotification: (
        notification: Omit<Notification, "id" | "isRead" | "createdAt">
    ) => void;
    markAsRead: (notificationIds: string[]) => Promise<void>;
    deleteNotification: (notificationId: string) => Promise<void>;
    loadNotifications: () => Promise<void>;
    clearAllNotifications: () => Promise<void>;
}
