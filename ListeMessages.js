/**
 * @fileoverview Fichier contenant les constantes des messages émis et reçus par le composant SocketIO
 * À savoir que les messages émis sont les messages envoyés par le client au serveur et les messages reçus sont les messages envoyés par le serveur au client
 *
 * @author Mathis LAMBERT
 * @module ListeMessages
 */

/**
 * Liste des messages émis
 * @type {string[]}
 */
const ListeMessagesEmis = [
    "client_deconnexion",
    "connexion_requete",
    "inscription_requete",
    "liste_utilisateurs_requete",
    "messages_requete",
]

/**
 * Liste des messages reçus
 * @type {string[]}
 */
const ListeMessagesRecus = [
    "client_deconnexion",
    "connexion_reponse",
    "inscription_reponse",
    "liste_utilisateurs_reponse",
    "messages_reponse",
]

module.exports = {
    ListeMessagesEmis,
    ListeMessagesRecus,
}
