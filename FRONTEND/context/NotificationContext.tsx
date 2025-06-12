"use client";
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useRef,
} from "react";
import { useAppContext } from "./AppContext";
import type {
    Notification,
    NotificationSettings,
    NotificationCount,
    NotificationType,
    NotificationPriority,
} from "@/types/Notification";

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    totalCount: number;
    settings: NotificationSettings | null;
    isLoading: boolean;
    error: string | null;
    temporaryNotifications: Notification[];

    // Actions
    loadNotifications: (options?: {
        limit?: number;
        unreadOnly?: boolean;
        type?: NotificationType;
    }) => Promise<void>;
    markAsRead: (notificationIds: string[]) => Promise<void>;
    deleteNotification: (notificationId: string) => Promise<void>;
    updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
    loadSettings: () => Promise<void>;
    loadCount: () => Promise<void>;

    // Temporary notifications (toast-style)
    showTemporaryNotification: (
        notification: Omit<
            Notification,
            "id" | "userId" | "isRead" | "createdAt"
        >
    ) => void;
    clearTemporaryNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const { controleur, currentUser } = useAppContext();

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [settings, setSettings] = useState<NotificationSettings | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [temporaryNotifications, setTemporaryNotifications] = useState<
        Notification[]
    >([]);

    const nomDInstance = "NotificationContext";
    const verbose = false;

    // Initialiser les notifications au démarrage
    useEffect(() => {
        if (currentUser && controleur) {
            // Charger les paramètres de notification
            loadSettings();

            // Charger le compteur de notifications
            loadCount();

            // Charger les notifications récentes
            loadNotifications({ limit: 20 });

            // Demander la permission pour les notifications bureau
            if (Notification.permission === "default") {
                Notification.requestPermission();
            }
        }
    }, [currentUser, controleur]);

    // Nettoyer les notifications temporaires expirées
    useEffect(() => {
        const interval = setInterval(() => {
            setTemporaryNotifications((prev) =>
                prev.filter((notif) => {
                    if (notif.expiresAt) {
                        return new Date() < new Date(notif.expiresAt);
                    }
                    return true;
                })
            );
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handler = {
        nomDInstance,
        traitementMessage: (msg: any) => {
            if (verbose)
                console.log(
                    `INFO: (${nomDInstance}) - traitementMessage - `,
                    msg
                );

            // Handle notifications list response
            if (msg.notifications_list_response) {
                if (msg.notifications_list_response.etat) {
                    setNotifications(
                        msg.notifications_list_response.notifications || []
                    );
                    setError(null);
                } else {
                    setError(
                        msg.notifications_list_response.error ||
                            "Failed to load notifications"
                    );
                }
                setIsLoading(false);
            }

            // Handle notification received in real-time
            if (msg.notification_received) {
                const newNotification = msg.notification_received.notification;

                // Ajouter la notification à la liste
                setNotifications((prev) => [newNotification, ...prev]);
                setTotalCount((prev) => prev + 1);

                if (!newNotification.isRead) {
                    setUnreadCount((prev) => prev + 1);
                }

                // Afficher une notification bureau si activée
                if (
                    settings?.desktopNotifications &&
                    Notification.permission === "granted"
                ) {
                    new Notification(newNotification.title, {
                        body: newNotification.message,
                        icon: "/favicon.ico",
                        tag: newNotification.id,
                    });
                }

                // Jouer un son si activé
                if (settings?.soundEnabled) {
                    playNotificationSound();
                }

                // Ajouter une notification temporaire (toast)
                showTemporaryNotification({
                    type: newNotification.type,
                    title: newNotification.title,
                    message: newNotification.message,
                    priority: newNotification.priority,
                    actionUrl: newNotification.actionUrl,
                    actionText: newNotification.actionText,
                    expiresAt: new Date(Date.now() + 5000), // Expire après 5 secondes
                });
            }

            // Handle notification create response
            if (msg.notification_create_response) {
                if (msg.notification_create_response.etat) {
                    const newNotification =
                        msg.notification_create_response.notification;
                    setNotifications((prev) => [newNotification, ...prev]);
                    setTotalCount((prev) => prev + 1);
                    if (!newNotification.isRead) {
                        setUnreadCount((prev) => prev + 1);
                    }
                } else {
                    setError(
                        msg.notification_create_response.error ||
                            "Failed to create notification"
                    );
                }
            }

            // Handle notification mark read response
            if (msg.notification_mark_read_response) {
                if (msg.notification_mark_read_response.etat) {
                    const markedIds =
                        msg.notification_mark_read_response.notificationIds;
                    setNotifications((prev) =>
                        prev.map((notif) =>
                            markedIds.includes(notif.id)
                                ? { ...notif, isRead: true }
                                : notif
                        )
                    );
                    setUnreadCount((prev) =>
                        Math.max(0, prev - markedIds.length)
                    );
                } else {
                    setError(
                        msg.notification_mark_read_response.error ||
                            "Failed to mark notifications as read"
                    );
                }
            }

            // Handle notification delete response
            if (msg.notification_delete_response) {
                if (msg.notification_delete_response.etat) {
                    const deletedId =
                        msg.notification_delete_response.notificationId;
                    setNotifications((prev) =>
                        prev.filter((notif) => notif.id !== deletedId)
                    );
                    setTotalCount((prev) => Math.max(0, prev - 1));
                    // Check if the deleted notification was unread
                    const deletedNotification = notifications.find(
                        (n) => n.id === deletedId
                    );
                    if (deletedNotification && !deletedNotification.isRead) {
                        setUnreadCount((prev) => Math.max(0, prev - 1));
                    }
                } else {
                    setError(
                        msg.notification_delete_response.error ||
                            "Failed to delete notification"
                    );
                }
            }

            // Handle notification settings response
            if (msg.notification_settings_response) {
                if (msg.notification_settings_response.etat) {
                    setSettings(msg.notification_settings_response.settings);
                    setError(null);
                } else {
                    setError(
                        msg.notification_settings_response.error ||
                            "Failed to load notification settings"
                    );
                }
            }

            // Handle notification settings update response
            if (msg.notification_settings_update_response) {
                if (msg.notification_settings_update_response.etat) {
                    setSettings(
                        msg.notification_settings_update_response.settings
                    );
                    setError(null);
                } else {
                    setError(
                        msg.notification_settings_update_response.error ||
                            "Failed to update notification settings"
                    );
                }
            }

            // Handle notification count response
            if (msg.notification_count_response) {
                if (msg.notification_count_response.etat) {
                    const count = msg.notification_count_response.count;
                    setUnreadCount(count.unread);
                    setTotalCount(count.total);
                    setError(null);
                } else {
                    setError(
                        msg.notification_count_response.error ||
                            "Failed to load notification count"
                    );
                }
            }
        },
    };

    const playNotificationSound = () => {
        try {
            const audio = new Audio("/notification.mp3");
            audio.volume = 0.5;
            audio
                .play()
                .catch((err) =>
                    console.log("Could not play notification sound:", err)
                );
        } catch (error) {
            console.log("Notification sound not available");
        }
    };

    const loadNotifications = async (options = {}) => {
        if (!currentUser) return;

        setIsLoading(true);
        setError(null);

        try {
            controleur.envoie(handler, {
                notifications_list_request: {
                    limit: options.limit || 50,
                    unreadOnly: options.unreadOnly || false,
                    type: options.type || null,
                },
            });
        } catch (error) {
            setError("Failed to load notifications");
            setIsLoading(false);
        }
    };

    const markAsRead = async (notificationIds: string[]) => {
        if (!currentUser) return;

        try {
            controleur.envoie(handler, {
                notification_mark_read_request: {
                    notificationIds,
                },
            });
        } catch (error) {
            setError("Failed to mark notifications as read");
        }
    };

    const deleteNotification = async (notificationId: string) => {
        if (!currentUser) return;

        try {
            controleur.envoie(handler, {
                notification_delete_request: {
                    notificationId,
                },
            });
        } catch (error) {
            setError("Failed to delete notification");
        }
    };

    const loadSettings = async () => {
        if (!currentUser) return;

        try {
            controleur.envoie(handler, {
                notification_settings_request: {},
            });
        } catch (error) {
            setError("Failed to load notification settings");
        }
    };

    const updateSettings = async (
        newSettings: Partial<NotificationSettings>
    ) => {
        if (!currentUser) return;

        try {
            controleur.envoie(handler, {
                notification_settings_update_request: newSettings,
            });
        } catch (error) {
            setError("Failed to update notification settings");
        }
    };

    const loadCount = async () => {
        if (!currentUser) return;

        try {
            controleur.envoie(handler, {
                notification_count_request: {},
            });
        } catch (error) {
            setError("Failed to load notification count");
        }
    };

    const showTemporaryNotification = (
        notification: Omit<
            Notification,
            "id" | "userId" | "isRead" | "createdAt"
        >
    ) => {
        const tempNotification: Notification = {
            ...notification,
            id: `temp-${Date.now()}-${Math.random()}`,
            userId: currentUser?.id || "",
            isRead: false,
            createdAt: new Date(),
        };

        setTemporaryNotifications((prev) => [...prev, tempNotification]);

        // Auto-remove after 5 seconds if no expiration is set
        if (!tempNotification.expiresAt) {
            setTimeout(() => {
                setTemporaryNotifications((prev) =>
                    prev.filter((n) => n.id !== tempNotification.id)
                );
            }, 5000);
        }
    };

    const clearTemporaryNotifications = () => {
        setTemporaryNotifications([]);
    };

    const contextValue: NotificationContextType = {
        notifications,
        unreadCount,
        totalCount,
        settings,
        isLoading,
        error,
        temporaryNotifications,
        loadNotifications,
        markAsRead,
        deleteNotification,
        updateSettings,
        loadSettings,
        loadCount,
        showTemporaryNotification,
        clearTemporaryNotifications,
    };

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotificationContext = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error(
            "useNotificationContext must be used within a NotificationProvider"
        );
    }
    return context;
};
