"use client";
import React from "react";
import { useNotifications } from "./NotificationSystem";
import { NotificationType, NotificationPriority } from "@/types/Notification";
import styles from "./NotificationTest.module.css";

export const NotificationTest: React.FC = () => {
    const { createNotification, success, error, warning, info } =
        useNotifications();

    const testNotifications = [
        {
            type: NotificationType.MESSAGE,
            title: "Nouveau message",
            message: "Vous avez reçu un nouveau message de Jean Dupont",
            priority: NotificationPriority.MEDIUM,
            actionUrl: "/discussion",
            actionText: "Voir le message",
        },
        {
            type: NotificationType.CHANNEL_POST,
            title: "Nouvelle publication",
            message:
                "Une nouvelle publication a été ajoutée dans le canal #général",
            priority: NotificationPriority.LOW,
            actionUrl: "/equipes",
            actionText: "Voir la publication",
        },
        {
            type: NotificationType.TEAM_INVITE,
            title: "Invitation d'équipe",
            message:
                "Vous avez été invité à rejoindre l'équipe 'Projet VisioConf'",
            priority: NotificationPriority.HIGH,
            actionUrl: "/equipes",
            actionText: "Accepter l'invitation",
        },
        {
            type: NotificationType.SYSTEM,
            title: "Maintenance prévue",
            message: "Une maintenance est prévue ce soir de 22h à 2h du matin",
            priority: NotificationPriority.URGENT,
            actionUrl: "/announcements",
            actionText: "Plus d'infos",
        },
    ];

    const handleTestNotification = (notification: any) => {
        createNotification({
            type: notification.type,
            title: notification.title,
            message: notification.message,
            priority: notification.priority,
            actionUrl: notification.actionUrl,
            actionText: notification.actionText,
        });
    };

    const handleTestConvenience = () => {
        success("Succès", "L'opération s'est déroulée avec succès !");
        setTimeout(
            () =>
                error(
                    "Erreur",
                    "Une erreur s'est produite lors de l'opération"
                ),
            1000
        );
        setTimeout(
            () =>
                warning(
                    "Attention",
                    "Attention, cette action est irréversible"
                ),
            2000
        );
        setTimeout(
            () => info("Information", "Voici une information importante"),
            3000
        );
    };

    return (
        <div className={styles.container}>
            <h2>Test du système de notifications</h2>

            <div className={styles.section}>
                <h3>Notifications de test</h3>
                <div className={styles.buttonGrid}>
                    {testNotifications.map((notification, index) => (
                        <button
                            key={index}
                            className={styles.testButton}
                            onClick={() => handleTestNotification(notification)}
                        >
                            {notification.title}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.section}>
                <h3>Méthodes de commodité</h3>
                <button
                    className={styles.convenienceButton}
                    onClick={handleTestConvenience}
                >
                    Tester toutes les méthodes
                </button>
            </div>

            <div className={styles.info}>
                <p>
                    💡 <strong>Instructions :</strong>
                </p>
                <ul>
                    <li>
                        Cliquez sur les boutons pour tester différents types de
                        notifications
                    </li>
                    <li>
                        Les notifications apparaîtront en haut à droite de
                        l'écran
                    </li>
                    <li>
                        Cliquez sur la cloche dans le menu pour voir toutes les
                        notifications
                    </li>
                    <li>
                        Les notifications temporaires disparaissent
                        automatiquement après 5 secondes
                    </li>
                </ul>
            </div>
        </div>
    );
};
