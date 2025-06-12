import Notification from "../models/notification.js";
import NotificationSettings from "../models/notificationSettings.js";
import User from "../models/user.js";
import SocketIdentificationService from "./SocketIdentification.js";

class NotificationsService {
    controleur;
    verbose = false;
    listeDesMessagesEmis = [
        "notifications_list_response",
        "notification_create_response",
        "notification_mark_read_response",
        "notification_delete_response",
        "notification_settings_response",
        "notification_settings_update_response",
        "notification_count_response",
        "notification_received",
    ];
    listeDesMessagesRecus = [
        "notifications_list_request",
        "notification_create_request",
        "notification_mark_read_request",
        "notification_delete_request",
        "notification_settings_request",
        "notification_settings_update_request",
        "notification_count_request",
    ];

    constructor(c, nom) {
        this.controleur = c;
        this.nomDInstance = nom;
        if (this.controleur.verboseall || this.verbose)
            console.log(
                "INFO (" +
                    this.nomDInstance +
                    "): s'enregistre auprès du contrôleur"
            );

        this.controleur.inscription(
            this,
            this.listeDesMessagesEmis,
            this.listeDesMessagesRecus
        );
    }

    async traitementMessage(mesg) {
        if (this.controleur.verboseall || this.verbose)
            console.log(
                "INFO (" + this.nomDInstance + "): traitementMessage - ",
                mesg
            );

        // Récupérer la liste des notifications
        if (mesg.notifications_list_request) {
            await this.getNotificationsList(mesg);
        }

        // Créer une nouvelle notification
        if (mesg.notification_create_request) {
            await this.createNotification(mesg);
        }

        // Marquer comme lu
        if (mesg.notification_mark_read_request) {
            await this.markNotificationsAsRead(mesg);
        }

        // Supprimer une notification
        if (mesg.notification_delete_request) {
            await this.deleteNotification(mesg);
        }

        // Récupérer les paramètres de notification
        if (mesg.notification_settings_request) {
            await this.getNotificationSettings(mesg);
        }

        // Mettre à jour les paramètres de notification
        if (mesg.notification_settings_update_request) {
            await this.updateNotificationSettings(mesg);
        }

        // Récupérer le nombre de notifications
        if (mesg.notification_count_request) {
            await this.getNotificationCount(mesg);
        }
    }

    async getNotificationsList(mesg) {
        try {
            const socketId = mesg.id;
            const userInfo =
                await SocketIdentificationService.getUserInfoBySocketId(
                    socketId
                );

            if (!userInfo) {
                throw new Error("User not found");
            }

            const {
                limit = 50,
                unreadOnly = false,
                type = null,
            } = mesg.notifications_list_request;

            const notifications = await Notification.findByUser(userInfo._id, {
                limit,
                unreadOnly,
                type,
            });

            const message = {
                notifications_list_response: {
                    etat: true,
                    notifications: notifications.map((notification) => ({
                        id: notification._id.toString(),
                        type: notification.type,
                        title: notification.title,
                        message: notification.message,
                        data: notification.data,
                        isRead: notification.isRead,
                        isPersistent: notification.isPersistent,
                        priority: notification.priority,
                        actionUrl: notification.actionUrl,
                        actionText: notification.actionText,
                        createdAt: notification.createdAt,
                        expiresAt: notification.expiresAt,
                    })),
                },
                id: [mesg.id],
            };

            this.controleur.envoie(this, message);
        } catch (error) {
            console.error("Error getting notifications list:", error);
            const message = {
                notifications_list_response: {
                    etat: false,
                    error: error.message,
                },
                id: [mesg.id],
            };
            this.controleur.envoie(this, message);
        }
    }

    async createNotification(mesg) {
        try {
            const {
                userId,
                type,
                title,
                message,
                data,
                isPersistent = false,
                priority = "medium",
                actionUrl,
                actionText,
                expiresAt,
            } = mesg.notification_create_request;

            const notification = await Notification.create({
                userId,
                type,
                title,
                message,
                data,
                isPersistent,
                priority,
                actionUrl,
                actionText,
                expiresAt,
            });

            // Récupérer le socket ID de l'utilisateur pour envoyer la notification en temps réel
            const socketId = await SocketIdentificationService.getUserSocketId(
                userId.toString()
            );

            const notificationData = {
                id: notification._id.toString(),
                type: notification.type,
                title: notification.title,
                message: notification.message,
                data: notification.data,
                isRead: notification.isRead,
                isPersistent: notification.isPersistent,
                priority: notification.priority,
                actionUrl: notification.actionUrl,
                actionText: notification.actionText,
                createdAt: notification.createdAt,
                expiresAt: notification.expiresAt,
            };

            // Réponse à l'expéditeur
            const responseMessage = {
                notification_create_response: {
                    etat: true,
                    notification: notificationData,
                },
                id: [mesg.id],
            };
            this.controleur.envoie(this, responseMessage);

            // Notification en temps réel à l'utilisateur concerné
            if (socketId) {
                const realtimeMessage = {
                    notification_received: {
                        notification: notificationData,
                    },
                    id: [socketId],
                };
                this.controleur.envoie(this, realtimeMessage);
            }
        } catch (error) {
            console.error("Error creating notification:", error);
            const message = {
                notification_create_response: {
                    etat: false,
                    error: error.message,
                },
                id: [mesg.id],
            };
            this.controleur.envoie(this, message);
        }
    }

    async markNotificationsAsRead(mesg) {
        try {
            const socketId = mesg.id;
            const userInfo =
                await SocketIdentificationService.getUserInfoBySocketId(
                    socketId
                );

            if (!userInfo) {
                throw new Error("User not found");
            }

            const { notificationIds } = mesg.notification_mark_read_request;

            await Notification.markAsRead(userInfo._id, notificationIds);

            const message = {
                notification_mark_read_response: {
                    etat: true,
                    notificationIds,
                },
                id: [mesg.id],
            };

            this.controleur.envoie(this, message);
        } catch (error) {
            console.error("Error marking notifications as read:", error);
            const message = {
                notification_mark_read_response: {
                    etat: false,
                    error: error.message,
                },
                id: [mesg.id],
            };
            this.controleur.envoie(this, message);
        }
    }

    async deleteNotification(mesg) {
        try {
            const socketId = mesg.id;
            const userInfo =
                await SocketIdentificationService.getUserInfoBySocketId(
                    socketId
                );

            if (!userInfo) {
                throw new Error("User not found");
            }

            const { notificationId } = mesg.notification_delete_request;

            const result = await Notification.deleteOne({
                _id: notificationId,
                userId: userInfo._id,
            });

            if (result.deletedCount === 0) {
                throw new Error("Notification not found or not authorized");
            }

            const message = {
                notification_delete_response: {
                    etat: true,
                    notificationId,
                },
                id: [mesg.id],
            };

            this.controleur.envoie(this, message);
        } catch (error) {
            console.error("Error deleting notification:", error);
            const message = {
                notification_delete_response: {
                    etat: false,
                    error: error.message,
                },
                id: [mesg.id],
            };
            this.controleur.envoie(this, message);
        }
    }

    async getNotificationSettings(mesg) {
        try {
            const socketId = mesg.id;
            const userInfo =
                await SocketIdentificationService.getUserInfoBySocketId(
                    socketId
                );

            if (!userInfo) {
                throw new Error("User not found");
            }

            const settings = await NotificationSettings.getOrCreate(
                userInfo._id
            );

            const message = {
                notification_settings_response: {
                    etat: true,
                    settings: {
                        messageNotifications: settings.messageNotifications,
                        channelNotifications: settings.channelNotifications,
                        teamNotifications: settings.teamNotifications,
                        systemNotifications: settings.systemNotifications,
                        callNotifications: settings.callNotifications,
                        emailNotifications: settings.emailNotifications,
                        soundEnabled: settings.soundEnabled,
                        desktopNotifications: settings.desktopNotifications,
                        quietHours: settings.quietHours,
                    },
                },
                id: [mesg.id],
            };

            this.controleur.envoie(this, message);
        } catch (error) {
            console.error("Error getting notification settings:", error);
            const message = {
                notification_settings_response: {
                    etat: false,
                    error: error.message,
                },
                id: [mesg.id],
            };
            this.controleur.envoie(this, message);
        }
    }

    async updateNotificationSettings(mesg) {
        try {
            const socketId = mesg.id;
            const userInfo =
                await SocketIdentificationService.getUserInfoBySocketId(
                    socketId
                );

            if (!userInfo) {
                throw new Error("User not found");
            }

            const updates = mesg.notification_settings_update_request;
            const settings = await NotificationSettings.updateSettings(
                userInfo._id,
                updates
            );

            const message = {
                notification_settings_update_response: {
                    etat: true,
                    settings: {
                        messageNotifications: settings.messageNotifications,
                        channelNotifications: settings.channelNotifications,
                        teamNotifications: settings.teamNotifications,
                        systemNotifications: settings.systemNotifications,
                        callNotifications: settings.callNotifications,
                        emailNotifications: settings.emailNotifications,
                        soundEnabled: settings.soundEnabled,
                        desktopNotifications: settings.desktopNotifications,
                        quietHours: settings.quietHours,
                    },
                },
                id: [mesg.id],
            };

            this.controleur.envoie(this, message);
        } catch (error) {
            console.error("Error updating notification settings:", error);
            const message = {
                notification_settings_update_response: {
                    etat: false,
                    error: error.message,
                },
                id: [mesg.id],
            };
            this.controleur.envoie(this, message);
        }
    }

    async getNotificationCount(mesg) {
        try {
            const socketId = mesg.id;
            const userInfo =
                await SocketIdentificationService.getUserInfoBySocketId(
                    socketId
                );

            if (!userInfo) {
                throw new Error("User not found");
            }

            const [unreadCount, totalCount] = await Promise.all([
                Notification.countDocuments({
                    userId: userInfo._id,
                    isRead: false,
                }),
                Notification.countDocuments({ userId: userInfo._id }),
            ]);

            const unreadByType = await Notification.getUnreadCount(
                userInfo._id
            );
            const byType = {};

            unreadByType.forEach((item) => {
                byType[item._id] = item.count;
            });

            const message = {
                notification_count_response: {
                    etat: true,
                    count: {
                        total: totalCount,
                        unread: unreadCount,
                        byType,
                    },
                },
                id: [mesg.id],
            };

            this.controleur.envoie(this, message);
        } catch (error) {
            console.error("Error getting notification count:", error);
            const message = {
                notification_count_response: {
                    etat: false,
                    error: error.message,
                },
                id: [mesg.id],
            };
            this.controleur.envoie(this, message);
        }
    }

    // Méthode utilitaire pour créer des notifications automatiquement
    async createSystemNotification(userId, type, title, message, options = {}) {
        try {
            const notification = await Notification.create({
                userId,
                type,
                title,
                message,
                data: options.data,
                isPersistent: options.isPersistent || false,
                priority: options.priority || "medium",
                actionUrl: options.actionUrl,
                actionText: options.actionText,
                expiresAt: options.expiresAt,
            });

            // Envoyer en temps réel si l'utilisateur est connecté
            const socketId = await SocketIdentificationService.getUserSocketId(
                userId.toString()
            );

            if (socketId) {
                const notificationData = {
                    id: notification._id.toString(),
                    type: notification.type,
                    title: notification.title,
                    message: notification.message,
                    data: notification.data,
                    isRead: notification.isRead,
                    isPersistent: notification.isPersistent,
                    priority: notification.priority,
                    actionUrl: notification.actionUrl,
                    actionText: notification.actionText,
                    createdAt: notification.createdAt,
                    expiresAt: notification.expiresAt,
                };

                const realtimeMessage = {
                    notification_received: {
                        notification: notificationData,
                    },
                    id: [socketId],
                };
                this.controleur.envoie(this, realtimeMessage);
            }

            return notification;
        } catch (error) {
            console.error("Error creating system notification:", error);
            throw error;
        }
    }
}

export default NotificationsService;
