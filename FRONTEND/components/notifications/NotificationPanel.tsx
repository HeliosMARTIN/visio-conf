"use client";
import React, { useState, useEffect } from "react";
import { useNotificationContext } from "@/context/NotificationContext";
import {
    X,
    Check,
    Trash2,
    Filter,
    Settings,
    MessageSquare,
    Hash,
    Users,
    Shield,
    Phone,
    FileText,
    Bell,
} from "lucide-react";
import { NotificationType } from "@/types/Notification";
import styles from "./NotificationPanel.module.css";

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const typeIcons = {
    [NotificationType.MESSAGE]: MessageSquare,
    [NotificationType.CHANNEL_POST]: Hash,
    [NotificationType.CHANNEL_INVITE]: Hash,
    [NotificationType.TEAM_INVITE]: Users,
    [NotificationType.ROLE_UPDATE]: Shield,
    [NotificationType.SYSTEM]: Bell,
    [NotificationType.CALL]: Phone,
    [NotificationType.FILE_SHARE]: FileText,
};

const typeLabels = {
    [NotificationType.MESSAGE]: "Message",
    [NotificationType.CHANNEL_POST]: "Publication",
    [NotificationType.CHANNEL_INVITE]: "Invitation canal",
    [NotificationType.TEAM_INVITE]: "Invitation équipe",
    [NotificationType.ROLE_UPDATE]: "Mise à jour rôle",
    [NotificationType.SYSTEM]: "Système",
    [NotificationType.CALL]: "Appel",
    [NotificationType.FILE_SHARE]: "Partage fichier",
};

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
    isOpen,
    onClose,
}) => {
    const {
        notifications,
        unreadCount,
        isLoading,
        error,
        markAsRead,
        deleteNotification,
        loadNotifications,
    } = useNotificationContext();

    const [selectedFilter, setSelectedFilter] = useState<
        NotificationType | "all"
    >("all");
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadNotifications();
        }
    }, [isOpen]);

    const filteredNotifications = notifications.filter((notification) => {
        if (selectedFilter === "all") return true;
        return notification.type === selectedFilter;
    });

    const unreadNotifications = filteredNotifications.filter((n) => !n.isRead);
    const readNotifications = filteredNotifications.filter((n) => n.isRead);

    const handleMarkAsRead = async (notificationId: string) => {
        await markAsRead([notificationId]);
    };

    const handleMarkAllAsRead = async () => {
        const unreadIds = unreadNotifications.map((n) => n.id);
        if (unreadIds.length > 0) {
            await markAsRead(unreadIds);
        }
    };

    const handleDelete = async (notificationId: string) => {
        await deleteNotification(notificationId);
    };

    const formatDate = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "À l'instant";
        if (minutes < 60) return `Il y a ${minutes} min`;
        if (hours < 24) return `Il y a ${hours}h`;
        if (days < 7) return `Il y a ${days}j`;
        return new Date(date).toLocaleDateString("fr-FR");
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "urgent":
                return styles.urgent;
            case "high":
                return styles.high;
            case "medium":
                return styles.medium;
            case "low":
                return styles.low;
            default:
                return styles.medium;
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.title}>
                        <Bell size={20} />
                        <span>Notifications</span>
                        {unreadCount > 0 && (
                            <span className={styles.unreadCount}>
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <div className={styles.actions}>
                        <button
                            className={styles.settingsButton}
                            onClick={() => setShowSettings(!showSettings)}
                            title="Paramètres"
                        >
                            <Settings size={16} />
                        </button>
                        <button
                            className={styles.closeButton}
                            onClick={onClose}
                            title="Fermer"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className={styles.filters}>
                    <button
                        className={`${styles.filterTab} ${
                            selectedFilter === "all" ? styles.active : ""
                        }`}
                        onClick={() => setSelectedFilter("all")}
                    >
                        Toutes ({notifications.length})
                    </button>
                    {Object.entries(typeLabels).map(([type, label]) => {
                        const count = notifications.filter(
                            (n) => n.type === type
                        ).length;
                        return (
                            <button
                                key={type}
                                className={`${styles.filterTab} ${
                                    selectedFilter === type ? styles.active : ""
                                }`}
                                onClick={() =>
                                    setSelectedFilter(type as NotificationType)
                                }
                            >
                                {label} ({count})
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div className={styles.content}>
                    {isLoading ? (
                        <div className={styles.loading}>
                            <div className={styles.spinner}></div>
                            <span>Chargement...</span>
                        </div>
                    ) : error ? (
                        <div className={styles.error}>
                            <span>{error}</span>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className={styles.empty}>
                            <Bell size={48} />
                            <span>Aucune notification</span>
                        </div>
                    ) : (
                        <div className={styles.notificationsList}>
                            {/* Unread notifications */}
                            {unreadNotifications.length > 0 && (
                                <>
                                    <div className={styles.sectionHeader}>
                                        <span>
                                            Non lues (
                                            {unreadNotifications.length})
                                        </span>
                                        <button
                                            className={styles.markAllRead}
                                            onClick={handleMarkAllAsRead}
                                        >
                                            <Check size={14} />
                                            Tout marquer comme lu
                                        </button>
                                    </div>
                                    {unreadNotifications.map((notification) => (
                                        <NotificationItem
                                            key={notification.id}
                                            notification={notification}
                                            onMarkAsRead={handleMarkAsRead}
                                            onDelete={handleDelete}
                                            formatDate={formatDate}
                                            getPriorityColor={getPriorityColor}
                                            typeIcons={typeIcons}
                                        />
                                    ))}
                                </>
                            )}

                            {/* Read notifications */}
                            {readNotifications.length > 0 && (
                                <>
                                    <div className={styles.sectionHeader}>
                                        <span>
                                            Lues ({readNotifications.length})
                                        </span>
                                    </div>
                                    {readNotifications.map((notification) => (
                                        <NotificationItem
                                            key={notification.id}
                                            notification={notification}
                                            onMarkAsRead={handleMarkAsRead}
                                            onDelete={handleDelete}
                                            formatDate={formatDate}
                                            getPriorityColor={getPriorityColor}
                                            typeIcons={typeIcons}
                                        />
                                    ))}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

interface NotificationItemProps {
    notification: any;
    onMarkAsRead: (id: string) => void;
    onDelete: (id: string) => void;
    formatDate: (date: Date) => string;
    getPriorityColor: (priority: string) => string;
    typeIcons: Record<string, any>;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
    notification,
    onMarkAsRead,
    onDelete,
    formatDate,
    getPriorityColor,
    typeIcons,
}) => {
    const IconComponent = typeIcons[notification.type] || Bell;

    return (
        <div
            className={`${styles.notificationItem} ${
                !notification.isRead ? styles.unread : ""
            }`}
        >
            <div className={styles.notificationIcon}>
                <IconComponent size={16} />
            </div>

            <div className={styles.notificationContent}>
                <div className={styles.notificationHeader}>
                    <h4 className={styles.notificationTitle}>
                        {notification.title}
                    </h4>
                    <div className={styles.notificationActions}>
                        {!notification.isRead && (
                            <button
                                className={styles.actionButton}
                                onClick={() => onMarkAsRead(notification.id)}
                                title="Marquer comme lu"
                            >
                                <Check size={14} />
                            </button>
                        )}
                        <button
                            className={styles.actionButton}
                            onClick={() => onDelete(notification.id)}
                            title="Supprimer"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>

                <p className={styles.notificationMessage}>
                    {notification.message}
                </p>

                <div className={styles.notificationFooter}>
                    <span className={styles.notificationTime}>
                        {formatDate(notification.createdAt)}
                    </span>
                    <div
                        className={`${styles.priorityBadge} ${getPriorityColor(
                            notification.priority
                        )}`}
                    >
                        {notification.priority}
                    </div>
                </div>

                {notification.actionUrl && (
                    <a
                        href={notification.actionUrl}
                        className={styles.actionLink}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {notification.actionText || "Voir plus"}
                    </a>
                )}
            </div>
        </div>
    );
};
