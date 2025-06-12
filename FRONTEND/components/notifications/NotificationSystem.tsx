"use client";
import React, { useState } from "react";
import { NotificationBell } from "./NotificationBell";
import { NotificationPanel } from "./NotificationPanel";
import { NotificationSettings } from "./NotificationSettings";
import { ToastContainer } from "./ToastNotification";
import { useNotificationContext } from "@/context/NotificationContext";

interface NotificationSystemProps {
    className?: string;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
    className = "",
}) => {
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const { temporaryNotifications, clearTemporaryNotifications } =
        useNotificationContext();

    const handleBellClick = () => {
        setIsPanelOpen(true);
    };

    const handlePanelClose = () => {
        setIsPanelOpen(false);
    };

    const handleSettingsOpen = () => {
        setIsSettingsOpen(true);
        setIsPanelOpen(false);
    };

    const handleSettingsClose = () => {
        setIsSettingsOpen(false);
    };

    const handleToastClose = (id: string) => {
        // Remove the specific temporary notification
        // This would be handled by the context
    };

    return (
        <>
            {/* Notification Bell */}
            <div className={className} onClick={handleBellClick}>
                <NotificationBell />
            </div>

            {/* Notification Panel */}
            <NotificationPanel
                isOpen={isPanelOpen}
                onClose={handlePanelClose}
            />

            {/* Notification Settings */}
            <NotificationSettings
                isOpen={isSettingsOpen}
                onClose={handleSettingsClose}
            />

            {/* Toast Notifications */}
            <ToastContainer
                notifications={temporaryNotifications}
                onClose={handleToastClose}
            />
        </>
    );
};

// Hook for easy notification creation
export const useNotifications = () => {
    const { showTemporaryNotification } = useNotificationContext();

    const createNotification = (options: {
        type: string;
        title: string;
        message: string;
        priority?: string;
        actionUrl?: string;
        actionText?: string;
        expiresAt?: Date;
    }) => {
        showTemporaryNotification({
            type: options.type as any,
            title: options.title,
            message: options.message,
            priority: (options.priority as any) || "medium",
            actionUrl: options.actionUrl,
            actionText: options.actionText,
            expiresAt: options.expiresAt,
            isPersistent: false,
        });
    };

    return {
        createNotification,
        // Convenience methods
        success: (title: string, message: string) =>
            createNotification({
                type: "system",
                title,
                message,
                priority: "medium",
            }),
        error: (title: string, message: string) =>
            createNotification({
                type: "system",
                title,
                message,
                priority: "high",
            }),
        warning: (title: string, message: string) =>
            createNotification({
                type: "system",
                title,
                message,
                priority: "high",
            }),
        info: (title: string, message: string) =>
            createNotification({
                type: "system",
                title,
                message,
                priority: "low",
            }),
    };
};
