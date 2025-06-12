"use client";
import React, { useState } from "react";
import { useNotificationContext } from "@/context/NotificationContext";
import {
    Settings,
    Bell,
    MessageSquare,
    Hash,
    Users,
    Shield,
    Phone,
    FileText,
    Volume2,
    VolumeX,
    Monitor,
    Mail,
    Clock,
} from "lucide-react";
import styles from "./NotificationSettings.module.css";

interface NotificationSettingsProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
    isOpen,
    onClose,
}) => {
    const { settings, updateSettings, isLoading } = useNotificationContext();
    const [localSettings, setLocalSettings] = useState(settings);
    const [hasChanges, setHasChanges] = useState(false);

    React.useEffect(() => {
        if (settings) {
            setLocalSettings(settings);
            setHasChanges(false);
        }
    }, [settings]);

    const handleSettingChange = (key: string, value: boolean | any) => {
        setLocalSettings((prev) => ({
            ...prev,
            [key]: value,
        }));
        setHasChanges(true);
    };

    const handleQuietHoursChange = (key: string, value: string | boolean) => {
        setLocalSettings((prev) => ({
            ...prev,
            quietHours: {
                ...prev?.quietHours,
                [key]: value,
            },
        }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        if (localSettings) {
            await updateSettings(localSettings);
            setHasChanges(false);
        }
    };

    const handleCancel = () => {
        if (settings) {
            setLocalSettings(settings);
            setHasChanges(false);
        }
        onClose();
    };

    if (!isOpen || !localSettings) return null;

    const settingGroups = [
        {
            title: "Types de notifications",
            icon: Bell,
            settings: [
                {
                    key: "messageNotifications",
                    label: "Messages privés",
                    description:
                        "Recevoir des notifications pour les nouveaux messages",
                    icon: MessageSquare,
                },
                {
                    key: "channelNotifications",
                    label: "Publications de canaux",
                    description:
                        "Recevoir des notifications pour les nouvelles publications",
                    icon: Hash,
                },
                {
                    key: "teamNotifications",
                    label: "Invitations d'équipe",
                    description:
                        "Recevoir des notifications pour les invitations d'équipe",
                    icon: Users,
                },
                {
                    key: "systemNotifications",
                    label: "Notifications système",
                    description:
                        "Recevoir des notifications système importantes",
                    icon: Shield,
                },
                {
                    key: "callNotifications",
                    label: "Appels",
                    description:
                        "Recevoir des notifications pour les appels entrants",
                    icon: Phone,
                },
            ],
        },
        {
            title: "Méthodes de notification",
            icon: Settings,
            settings: [
                {
                    key: "desktopNotifications",
                    label: "Notifications bureau",
                    description: "Afficher les notifications sur le bureau",
                    icon: Monitor,
                },
                {
                    key: "soundEnabled",
                    label: "Sons",
                    description:
                        "Jouer un son pour les nouvelles notifications",
                    icon: Volume2,
                },
                {
                    key: "emailNotifications",
                    label: "Notifications email",
                    description: "Envoyer des notifications par email",
                    icon: Mail,
                },
            ],
        },
    ];

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={styles.title}>
                        <Settings size={20} />
                        <span>Paramètres de notifications</span>
                    </div>
                    <button className={styles.closeButton} onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className={styles.content}>
                    {settingGroups.map((group) => (
                        <div key={group.title} className={styles.settingGroup}>
                            <div className={styles.groupHeader}>
                                <group.icon size={18} />
                                <h3>{group.title}</h3>
                            </div>

                            {group.settings.map((setting) => (
                                <div
                                    key={setting.key}
                                    className={styles.settingItem}
                                >
                                    <div className={styles.settingInfo}>
                                        <div className={styles.settingIcon}>
                                            <setting.icon size={16} />
                                        </div>
                                        <div className={styles.settingDetails}>
                                            <label
                                                className={styles.settingLabel}
                                            >
                                                {setting.label}
                                            </label>
                                            <p
                                                className={
                                                    styles.settingDescription
                                                }
                                            >
                                                {setting.description}
                                            </p>
                                        </div>
                                    </div>

                                    <label className={styles.toggle}>
                                        <input
                                            type="checkbox"
                                            checked={
                                                localSettings[
                                                    setting.key as keyof typeof localSettings
                                                ] as boolean
                                            }
                                            onChange={(e) =>
                                                handleSettingChange(
                                                    setting.key,
                                                    e.target.checked
                                                )
                                            }
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    ))}

                    {/* Quiet Hours */}
                    <div className={styles.settingGroup}>
                        <div className={styles.groupHeader}>
                            <Clock size={18} />
                            <h3>Heures silencieuses</h3>
                        </div>

                        <div className={styles.settingItem}>
                            <div className={styles.settingInfo}>
                                <div className={styles.settingIcon}>
                                    <VolumeX size={16} />
                                </div>
                                <div className={styles.settingDetails}>
                                    <label className={styles.settingLabel}>
                                        Activer les heures silencieuses
                                    </label>
                                    <p className={styles.settingDescription}>
                                        Désactiver les notifications pendant les
                                        heures spécifiées
                                    </p>
                                </div>
                            </div>

                            <label className={styles.toggle}>
                                <input
                                    type="checkbox"
                                    checked={
                                        localSettings.quietHours?.enabled ||
                                        false
                                    }
                                    onChange={(e) =>
                                        handleQuietHoursChange(
                                            "enabled",
                                            e.target.checked
                                        )
                                    }
                                />
                                <span className={styles.slider}></span>
                            </label>
                        </div>

                        {localSettings.quietHours?.enabled && (
                            <div className={styles.quietHoursSettings}>
                                <div className={styles.timeInputs}>
                                    <div className={styles.timeInput}>
                                        <label>Début</label>
                                        <input
                                            type="time"
                                            value={
                                                localSettings.quietHours
                                                    ?.startTime || "22:00"
                                            }
                                            onChange={(e) =>
                                                handleQuietHoursChange(
                                                    "startTime",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                    <div className={styles.timeInput}>
                                        <label>Fin</label>
                                        <input
                                            type="time"
                                            value={
                                                localSettings.quietHours
                                                    ?.endTime || "08:00"
                                            }
                                            onChange={(e) =>
                                                handleQuietHoursChange(
                                                    "endTime",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.footer}>
                    <button
                        className={styles.cancelButton}
                        onClick={handleCancel}
                        disabled={isLoading}
                    >
                        Annuler
                    </button>
                    <button
                        className={styles.saveButton}
                        onClick={handleSave}
                        disabled={!hasChanges || isLoading}
                    >
                        {isLoading ? "Sauvegarde..." : "Sauvegarder"}
                    </button>
                </div>
            </div>
        </div>
    );
};
