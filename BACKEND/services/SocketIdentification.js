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

        this.verbose = false // Activer pour plus de logs
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

            const userInfo = this.socketToUser.get(socketId)

            if (this.verbose) {
                if (userInfo) {
                    console.log(
                        `INFO (SocketIdentificationService): Utilisateur trouvé pour le socket ${socketId}`
                    )
                } else {
                    console.log(
                        `INFO (SocketIdentificationService): Aucun utilisateur trouvé pour le socket ${socketId}`
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
     */
    async updateUserSocket(userId, socketId, userInfo = null) {
        try {
            if (!userId || !socketId) {
                console.error(
                    "ERREUR (SocketIdentificationService): userId et socketId sont requis"
                )
                return null
            }

            // Si userInfo n'est pas fourni, utiliser les informations existantes ou créer un objet minimal
            const updatedUserInfo =
                userInfo || this.userToSocket.has(userId)
                    ? this.socketToUser.get(this.userToSocket.get(userId))
                    : { _id: userId }

            // Si l'utilisateur avait déjà un socket, le supprimer
            if (this.userToSocket.has(userId)) {
                const oldSocketId = this.userToSocket.get(userId)
                this.socketToUser.delete(oldSocketId)
            }

            // Mettre à jour les associations
            this.userToSocket.set(userId, socketId)
            this.socketToUser.set(socketId, updatedUserInfo)

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
