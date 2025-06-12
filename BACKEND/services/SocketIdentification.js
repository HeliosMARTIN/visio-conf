import User from "../models/user.js";

/**
 * Service responsable de la gestion des associations entre utilisateurs et sockets WebSocket
 * Cette version utilise le stockage en mémoire au lieu de la base de données
 * Note: Les données seront perdues si le serveur redémarre
 */
class SocketIdentificationService {
    constructor() {
        // Structure de données pour stocker les associations socket-utilisateur
        // socketId -> userInfo
        this.socketToUser = new Map();

        // Structure de données pour stocker les associations utilisateur-socket
        // userId -> socketId
        this.userToSocket = new Map();

        this.verbose = false; // Activer pour plus de logs temporairement
        this.reconnectingSockets = new Map(); // Pour suivre les sockets en reconnexion
        this.pendingAuthentications = new Map(); // Nouveau: pour suivre les authentifications en cours
    }

    /**
     * Récupère les informations d'un utilisateur à partir de son identifiant de socket
     * @param {string} socketId - L'identifiant du socket WebSocket
     * @returns {Object|null} - Les informations de l'utilisateur ou null
     */
    async getUserInfoBySocketId(socketId) {
        try {
            if (!socketId) {
                if (this.verbose)
                    console.log(
                        "INFO (SocketIdentificationService): socketId non fourni"
                    );
                return null;
            }

            // Vérifier si l'authentification est en cours
            if (this.pendingAuthentications.has(socketId)) {
                console.log(`Socket ${socketId} en cours d'authentification`);
                return null;
            }

            let userInfo = this.socketToUser.get(socketId);

            // Si userInfo absent ou incomplet, tente de charger depuis la base
            if (
                !userInfo ||
                !userInfo._id ||
                !userInfo.uuid ||
                !userInfo.email
            ) {
                const user = await User.findOne({ socket_id: socketId });
                if (user) {
                    userInfo = user.toObject();
                    this.socketToUser.set(socketId, userInfo);
                    this.userToSocket.set(user._id, socketId);
                }
            }
            if (this.verbose) {
                if (userInfo) {
                    console.log(
                        `INFO (SocketIdentificationService): Utilisateur trouvé pour le socket ${socketId}`,
                        {
                            uuid: userInfo.uuid,
                            email: userInfo.email,
                            _id: userInfo._id,
                        }
                    );
                } else {
                    console.log(
                        `INFO (SocketIdentificationService): Aucun utilisateur trouvé pour le socket ${socketId}`
                    );
                    console.log(
                        `DEBUG (SocketIdentificationService): État des Maps - socketToUser.size=${this.socketToUser.size}, userToSocket.size=${this.userToSocket.size}`
                    );
                    console.log(
                        `DEBUG (SocketIdentificationService): userToSocket entries:`,
                        Array.from(this.userToSocket.entries())
                    );
                }
            }

            return userInfo || null;
        } catch (error) {
            console.error(
                `ERREUR (SocketIdentificationService): Impossible de récupérer l'utilisateur - ${error.message}`
            );
            return null;
        }
    }

    /**
     * Met à jour l'identifiant de socket d'un utilisateur lors de l'établissement d'une connexion
     * @param {string} userId - L'identifiant de l'utilisateur
     * @param {string} socketId - Le nouvel identifiant de socket WebSocket
     * @param {Object} userInfo - Les informations de l'utilisateur (optionnel)
     * @returns {Object|null} - Les informations de l'utilisateur mises à jour ou null en cas d'erreur
     */
    async updateUserSocket(userId, socketId, userInfo = null) {
        try {
            if (!userId || !socketId) {
                console.error(
                    "ERREUR (SocketIdentificationService): userId et socketId sont requis"
                );
                return null;
            }

            // Marquer l'authentification comme en cours
            this.pendingAuthentications.set(socketId, true);

            // Mettre à jour la base de données
            const updatedUser = await User.findOneAndUpdate(
                { _id: userId },
                {
                    $set: {
                        socket_id: socketId,
                        last_connection: new Date(),
                        is_online: true,
                        disturb_status: "available",
                    },
                },
                { new: true }
            );

            if (!updatedUser) {
                console.error(
                    `Utilisateur ${userId} non trouvé lors de la mise à jour du socket`
                );
                this.pendingAuthentications.delete(socketId);
                return null;
            }

            // Mettre à jour les Maps
            if (this.userToSocket.has(userId)) {
                const oldSocketId = this.userToSocket.get(userId);
                this.socketToUser.delete(oldSocketId);
            }

            let updatedUserInfo = userInfo || updatedUser.toObject();
            this.userToSocket.set(userId, socketId);
            this.socketToUser.set(socketId, updatedUserInfo);

            // Nettoyer le statut d'authentification après un court délai
            setTimeout(() => {
                this.pendingAuthentications.delete(socketId);
            }, 5000);

            console.log(
                `Socket ${socketId} mis à jour pour l'utilisateur ${userId} (${updatedUser.firstname} ${updatedUser.lastname})`
            );
            return updatedUserInfo;
        } catch (error) {
            console.error("Erreur lors de la mise à jour du socket:", error);
            this.pendingAuthentications.delete(socketId);
            return null;
        }
    }

    /**
     * Vérifie si un utilisateur est actuellement connecté
     * @param {string} userId - L'identifiant de l'utilisateur à vérifier
     * @returns {boolean} - true si l'utilisateur est connecté, false sinon
     */
    async isUserConnected(userId) {
        try {
            if (!userId) return false;
            return this.userToSocket.has(userId);
        } catch (error) {
            console.error(
                `ERREUR (SocketIdentificationService): Impossible de vérifier la connexion - ${error.message}`
            );
            return false;
        }
    }

    /**
     * Récupère tous les utilisateurs actuellement connectés
     * @returns {Array} - Liste des utilisateurs connectés
     */
    async getConnectedUsers() {
        try {
            const connectedUsers = Array.from(this.socketToUser.values());

            if (this.verbose) {
                console.log(
                    `INFO (SocketIdentificationService): ${connectedUsers.length} utilisateurs connectés trouvés`
                );
            }

            return connectedUsers;
        } catch (error) {
            console.error(
                `ERREUR (SocketIdentificationService): Impossible de récupérer les utilisateurs connectés - ${error.message}`
            );
            return [];
        }
    }

    /**
     * Récupère l'identifiant de socket d'un utilisateur
     * @param {string} userId - L'identifiant de l'utilisateur
     * @returns {string|null} - L'identifiant du socket ou null si non trouvé
     */
    async getUserSocketId(userId) {
        try {
            if (!userId) {
                if (this.verbose)
                    console.log(
                        "INFO (SocketIdentificationService): userId non fourni"
                    );
                return null;
            }

            // Vérifier d'abord dans la Map
            let socketId = this.userToSocket.get(userId);

            // Si non trouvé dans la Map, chercher dans la base de données
            if (!socketId) {
                const user = await User.findById(userId);
                if (user && user.socket_id) {
                    socketId = user.socket_id;
                    // Mettre à jour la Map
                    this.userToSocket.set(userId, socketId);
                    this.socketToUser.set(socketId, user.toObject());
                }
            }

            if (this.verbose) {
                if (socketId) {
                    console.log(
                        `INFO (SocketIdentificationService): Socket trouvé pour l'utilisateur ${userId}: ${socketId}`
                    );
                } else {
                    console.log(
                        `INFO (SocketIdentificationService): Aucun socket trouvé pour l'utilisateur ${userId}`
                    );
                }
            }

            // Retourner null si aucun socket n'est trouvé
            return socketId || null;
        } catch (error) {
            console.error(
                `ERREUR (SocketIdentificationService): Impossible de récupérer le socket - ${error.message}`
            );
            return null;
        }
    }

    async removeUserSocket(socketId) {
        try {
            // Ne pas supprimer si l'authentification est en cours
            if (this.pendingAuthentications.has(socketId)) {
                console.log(
                    `Socket ${socketId} en cours d'authentification, suppression annulée`
                );
                return true;
            }

            const userInfo = this.socketToUser.get(socketId);
            if (!userInfo) {
                console.log(
                    `Aucun utilisateur trouvé pour le socket ${socketId}`
                );
                return true;
            }

            // Supprimer des Maps
            this.socketToUser.delete(socketId);
            this.userToSocket.delete(userInfo._id);
            this.pendingAuthentications.delete(socketId);

            // Mettre à jour la base de données
            await User.findOneAndUpdate(
                { _id: userInfo._id },
                { $set: { socket_id: "none" } }
            );

            console.log(
                `Socket ${socketId} nettoyé pour l'utilisateur ${userInfo._id}`
            );
            return true;
        } catch (error) {
            console.error("Erreur lors de la suppression du socket:", error);
            return false;
        }
    }
}

// Exporte une instance singleton du service
export default new SocketIdentificationService();
