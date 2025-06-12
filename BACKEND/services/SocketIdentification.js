import User from "../models/user.js"

/**
 * Service responsable de la gestion des associations entre utilisateurs et sockets WebSocket
 * Cette version utilise le stockage en mémoire au lieu de la base de données
 * Note: Les données seront perdues si le serveur redémarre
 */
class SocketIdentificationService {
    constructor() {
        // Structure de données pour stocker les associations socket-utilisateur
        // socketId -> userInfo
        this.socketToUser = new Map()

        // Structure de données pour stocker les associations utilisateur-socket
        // userId -> socketId
        this.userToSocket = new Map()

        this.verbose = false // Activer pour plus de logs temporairement
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
                    )
                return null
            }

            let userInfo = this.socketToUser.get(socketId)

            // Si userInfo absent ou incomplet, tente de charger depuis la base
            if (
                !userInfo ||
                !userInfo._id ||
                !userInfo.uuid ||
                !userInfo.email
            ) {
                // Cherche l'userId via userToSocket
                let userId = null
                for (const [uid, sid] of this.userToSocket.entries()) {
                    if (sid === socketId) {
                        userId = uid
                        break
                    }
                }
                if (userId) {
                    userInfo = await User.findById(
                        userId,
                        "uuid firstname lastname email picture phone job desc roles disturb_status date_create last_connection"
                    )
                        .populate("roles", "role_label")
                        .lean()
                    if (userInfo) {
                        this.socketToUser.set(socketId, userInfo)
                        console.log(
                            `DEBUG (SocketIdentificationService): Utilisateur rechargé depuis DB pour socket ${socketId}:`,
                            {
                                uuid: userInfo.uuid,
                                email: userInfo.email,
                                _id: userInfo._id,
                            }
                        )
                    }
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
                    )
                } else {
                    console.log(
                        `INFO (SocketIdentificationService): Aucun utilisateur trouvé pour le socket ${socketId}`
                    )
                    console.log(
                        `DEBUG (SocketIdentificationService): État des Maps - socketToUser.size=${this.socketToUser.size}, userToSocket.size=${this.userToSocket.size}`
                    )
                    console.log(
                        `DEBUG (SocketIdentificationService): userToSocket entries:`,
                        Array.from(this.userToSocket.entries())
                    )
                }
            }

            return userInfo || null
        } catch (error) {
            console.error(
                `ERREUR (SocketIdentificationService): Impossible de récupérer l'utilisateur - ${error.message}`
            )
            return null
        }
    }

    /**
     * Met à jour l'identifiant de socket d'un utilisateur lors de l'établissement d'une connexion
     * @param {string} userId - L'identifiant de l'utilisateur
     * @param {string} socketId - Le nouvel identifiant de socket WebSocket
     * @param {Object} userInfo - Les informations de l'utilisateur (optionnel)
     * @returns {Object|null} - Les informations de l'utilisateur mises à jour ou null en cas d'erreur
     */ async updateUserSocket(userId, socketId, userInfo = null) {
        try {
            if (!userId || !socketId) {
                console.error(
                    "ERREUR (SocketIdentificationService): userId et socketId sont requis"
                )
                return null
            }

            console.log(
                `DEBUG (SocketIdentificationService): Mise à jour socket pour user ${userId} avec socket ${socketId}`
            )

            let updatedUserInfo = userInfo
            if (!updatedUserInfo) {
                // Cherche l'ancien socket pour ce user
                const oldSocketId = this.userToSocket.get(userId)
                console.log(
                    `DEBUG (SocketIdentificationService): Ancien socket pour user ${userId}:`,
                    oldSocketId
                )
                console.log(
                    "DEBUG (SocketIdentificationService): userToSocket Map:",
                    Array.from(this.userToSocket.entries())
                )

                if (oldSocketId) {
                    updatedUserInfo = await this.getUserInfoBySocketId(
                        oldSocketId
                    )
                }
                // Si toujours rien, charger depuis la DB
                if (!updatedUserInfo) {
                    updatedUserInfo = await User.findById(userId).lean()
                    console.log(
                        `DEBUG (SocketIdentificationService): Chargé depuis DB pour ${userId}:`,
                        updatedUserInfo ? "trouvé" : "non trouvé"
                    )
                }
                // Si toujours rien, objet minimal
                if (!updatedUserInfo) {
                    updatedUserInfo = { _id: userId }
                    console.log(
                        `DEBUG (SocketIdentificationService): Objet minimal créé pour ${userId}`
                    )
                }
            }

            // Si l'utilisateur avait déjà un socket, le supprimer
            if (this.userToSocket.has(userId)) {
                const oldSocketId = this.userToSocket.get(userId)
                this.socketToUser.delete(oldSocketId)
                console.log(
                    `DEBUG (SocketIdentificationService): Supprimé ancien socket ${oldSocketId} pour user ${userId}`
                )
            } // Mettre à jour les associations
            this.userToSocket.set(userId, socketId)
            this.socketToUser.set(socketId, updatedUserInfo)

            console.log(
                `DEBUG (SocketIdentificationService): Socket mis à jour avec succès pour l'utilisateur ${userId}. Associations: userToSocket=${this.userToSocket.size}, socketToUser=${this.socketToUser.size}`
            )
            console.log(
                `DEBUG (SocketIdentificationService): UserInfo stocké:`,
                JSON.stringify(
                    {
                        _id: updatedUserInfo._id,
                        uuid: updatedUserInfo.uuid,
                        email: updatedUserInfo.email,
                        firstname: updatedUserInfo.firstname,
                        lastname: updatedUserInfo.lastname,
                    },
                    null,
                    2
                )
            )

            if (this.verbose) {
                console.log(
                    `INFO (SocketIdentificationService): Socket mis à jour pour l'utilisateur ${userId}`
                )
            }

            return updatedUserInfo
        } catch (error) {
            console.error(
                `ERREUR (SocketIdentificationService): Impossible de mettre à jour le socket - ${error.message}`
            )
            return null
        }
    }

    /**
     * Vérifie si un utilisateur est actuellement connecté
     * @param {string} userId - L'identifiant de l'utilisateur à vérifier
     * @returns {boolean} - true si l'utilisateur est connecté, false sinon
     */
    async isUserConnected(userId) {
        try {
            if (!userId) return false
            return this.userToSocket.has(userId)
        } catch (error) {
            console.error(
                `ERREUR (SocketIdentificationService): Impossible de vérifier la connexion - ${error.message}`
            )
            return false
        }
    }

    /**
     * Récupère tous les utilisateurs actuellement connectés
     * @returns {Array} - Liste des utilisateurs connectés
     */
    async getConnectedUsers() {
        try {
            const connectedUsers = Array.from(this.socketToUser.values())

            if (this.verbose) {
                console.log(
                    `INFO (SocketIdentificationService): ${connectedUsers.length} utilisateurs connectés trouvés`
                )
            }

            return connectedUsers
        } catch (error) {
            console.error(
                `ERREUR (SocketIdentificationService): Impossible de récupérer les utilisateurs connectés - ${error.message}`
            )
            return []
        }
    }

    /**
     * Récupère le socket ID d'un utilisateur spécifique
     * @param {string} userId - L'identifiant de l'utilisateur
     * @returns {string|null} - L'identifiant du socket ou null
     */
    async getUserSocketId(userId) {
        try {
            if (!userId) return null
            return this.userToSocket.get(userId) || null
        } catch (error) {
            console.error(
                `ERREUR (SocketIdentificationService): Impossible de récupérer le socket ID - ${error.message}`
            )
            return null
        }
    }
}

// Exporte une instance singleton du service
export default new SocketIdentificationService()
