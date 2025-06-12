import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: [
                "message",
                "channel_post",
                "channel_invite",
                "team_invite",
                "role_update",
                "system",
                "call",
                "file_share",
            ],
            required: true,
        },
        title: {
            type: String,
            required: true,
            maxlength: 200,
        },
        message: {
            type: String,
            required: true,
            maxlength: 1000,
        },
        data: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true,
        },
        isPersistent: {
            type: Boolean,
            default: false,
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high", "urgent"],
            default: "medium",
        },
        actionUrl: {
            type: String,
            maxlength: 500,
        },
        actionText: {
            type: String,
            maxlength: 100,
        },
        expiresAt: {
            type: Date,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index pour les requêtes fréquentes
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1, isRead: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Méthodes statiques
notificationSchema.statics.findByUser = function (userId, options = {}) {
    const query = { userId };

    if (options.unreadOnly) {
        query.isRead = false;
    }

    if (options.type) {
        query.type = options.type;
    }

    return this.find(query)
        .sort({ createdAt: -1 })
        .limit(options.limit || 50)
        .populate("userId", "firstname lastname email picture");
};

notificationSchema.statics.markAsRead = function (userId, notificationIds) {
    return this.updateMany(
        {
            _id: { $in: notificationIds },
            userId: userId,
        },
        { isRead: true }
    );
};

notificationSchema.statics.getUnreadCount = function (userId) {
    return this.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                isRead: false,
            },
        },
        {
            $group: {
                _id: "$type",
                count: { $sum: 1 },
            },
        },
    ]);
};

notificationSchema.statics.cleanupExpired = function () {
    return this.deleteMany({
        expiresAt: { $lt: new Date() },
        isPersistent: false,
    });
};

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
