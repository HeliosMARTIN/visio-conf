"use client";
import React, { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { NotificationType, NotificationPriority } from "@/types/Notification";
import styles from "./ToastNotification.module.css";

interface ToastNotificationProps {
    notification: {
        id: string;
        type: NotificationType;
        title: string;
        message: string;
        priority: NotificationPriority;
        actionUrl?: string;
        actionText?: string;
        expiresAt?: Date;
    };
    onClose: (id: string) => void;
    duration?: number;
}

const typeIcons = {
    [NotificationType.MESSAGE]: CheckCircle,
    [NotificationType.CHANNEL_POST]: Info,
    [NotificationType.CHANNEL_INVITE]: Info,
    [NotificationType.TEAM_INVITE]: Info,
    [NotificationType.ROLE_UPDATE]: AlertCircle,
    [NotificationType.SYSTEM]: Info,
    [NotificationType.CALL]: AlertCircle,
    [NotificationType.FILE_SHARE]: Info,
};

const priorityColors = {
    [NotificationPriority.URGENT]: styles.urgent,
    [NotificationPriority.HIGH]: styles.high,
    [NotificationPriority.MEDIUM]: styles.medium,
    [NotificationPriority.LOW]: styles.low,
};

export const ToastNotification: React.FC<ToastNotificationProps> = ({
    notification,
    onClose,
    duration = 5000,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    const IconComponent = typeIcons[notification.type] || Info;
    const priorityClass =
        priorityColors[notification.priority] || styles.medium;

    useEffect(() => {
        // Animate in
        const timer = setTimeout(() => setIsVisible(true), 100);

        // Auto-close timer
        const closeTimer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => {
            clearTimeout(timer);
            clearTimeout(closeTimer);
        };
    }, [duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            onClose(notification.id);
        }, 300); // Match CSS animation duration
    };

    const handleActionClick = () => {
        if (notification.actionUrl) {
            window.open(
                notification.actionUrl,
                "_blank",
                "noopener,noreferrer"
            );
        }
        handleClose();
    };

    return (
        <div
            className={`${styles.toast} ${priorityClass} ${
                isVisible ? styles.visible : ""
            } ${isExiting ? styles.exiting : ""}`}
            onClick={handleActionClick}
        >
            <div className={styles.icon}>
                <IconComponent size={20} />
            </div>

            <div className={styles.content}>
                <h4 className={styles.title}>{notification.title}</h4>
                <p className={styles.message}>{notification.message}</p>

                {notification.actionUrl && (
                    <button className={styles.actionButton}>
                        {notification.actionText || "Voir plus"}
                    </button>
                )}
            </div>

            <button
                className={styles.closeButton}
                onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                }}
                title="Fermer"
            >
                <X size={16} />
            </button>

            {/* Progress bar */}
            <div className={styles.progressBar}>
                <div
                    className={styles.progressFill}
                    style={{
                        animationDuration: `${duration}ms`,
                        animationDelay: "100ms",
                    }}
                />
            </div>
        </div>
    );
};

// Toast container component
interface ToastContainerProps {
    notifications: any[];
    onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
    notifications,
    onClose,
}) => {
    return (
        <div className={styles.container}>
            {notifications.map((notification) => (
                <ToastNotification
                    key={notification.id}
                    notification={notification}
                    onClose={onClose}
                />
            ))}
        </div>
    );
};
