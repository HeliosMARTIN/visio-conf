import mongoose from "mongoose";

const notificationSettingsSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        messageNotifications: {
            type: Boolean,
            default: true,
        },
        channelNotifications: {
            type: Boolean,
            default: true,
        },
        teamNotifications: {
            type: Boolean,
            default: true,
        },
        systemNotifications: {
            type: Boolean,
            default: true,
        },
        callNotifications: {
            type: Boolean,
            default: true,
        },
        emailNotifications: {
            type: Boolean,
            default: false,
        },
        soundEnabled: {
            type: Boolean,
            default: true,
        },
        desktopNotifications: {
            type: Boolean,
            default: true,
        },
        quietHours: {
            enabled: {
                type: Boolean,
                default: false,
            },
            startTime: {
                type: String,
                default: "22:00",
            },
            endTime: {
                type: String,
                default: "08:00",
            },
        },
    },
    {
        timestamps: true,
    }
);

// Méthodes statiques
notificationSettingsSchema.statics.getOrCreate = async function (userId) {
    let settings = await this.findOne({ userId });

    if (!settings) {
        settings = await this.create({ userId });
    }

    return settings;
};

notificationSettingsSchema.statics.updateSettings = async function (
    userId,
    updates
) {
    return this.findOneAndUpdate({ userId }, updates, {
        new: true,
        upsert: true,
    });
};

const NotificationSettings = mongoose.model(
    "NotificationSettings",
    notificationSettingsSchema
);

export default NotificationSettings;
