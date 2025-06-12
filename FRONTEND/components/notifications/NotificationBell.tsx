"use client";
import React, { useState } from "react";
import { useNotificationContext } from "@/context/NotificationContext";
import { Bell, BellOff } from "lucide-react";
import styles from "./NotificationBell.module.css";

interface NotificationBellProps {
    className?: string;
    size?: number;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
    className = "",
    size = 24,
}) => {
    const { unreadCount, settings } = useNotificationContext();
    const [isHovered, setIsHovered] = useState(false);

    const hasNotifications = unreadCount > 0;
    const notificationsEnabled = settings?.desktopNotifications !== false;

    return (
        <div
            className={`${styles.notificationBell} ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={styles.bellContainer}>
                {notificationsEnabled ? (
                    <Bell
                        size={size}
                        className={`${styles.bell} ${
                            hasNotifications ? styles.hasNotifications : ""
                        }`}
                    />
                ) : (
                    <BellOff
                        size={size}
                        className={`${styles.bell} ${styles.disabled}`}
                    />
                )}

                {hasNotifications && (
                    <div className={styles.badge}>
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </div>
                )}
            </div>

            {isHovered && (
                <div className={styles.tooltip}>
                    {hasNotifications
                        ? `${unreadCount} notification${
                              unreadCount > 1 ? "s" : ""
                          } non lue${unreadCount > 1 ? "s" : ""}`
                        : "Aucune nouvelle notification"}
                </div>
            )}
        </div>
    );
};
