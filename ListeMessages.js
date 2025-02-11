/**
 * Liste des messages émis
 * @type {string[]}
 */
const ListeMessagesEmis = [
    "client_deconnexion", // No data
    "connexion_requete", // { login: string, mdp: string }
    "inscription_requete", // { login: string, mdp: string, firstname: string, lastname: string, user_phone: string, user_job: string, user_desc: string }
    "liste_utilisateurs_requete", // No data
    "messages_requete", // No data
]

/**
 * Liste des messages reçus
 * @type {string[]}
 */
const ListeMessagesRecus = [
    "client_deconnexion", // No data
    "connexion_reponse", // { etat: string, user?: { firstname: string, lastname: string, email: string } }
    "inscription_reponse", // { etat: string, user?: { firstname: string, lastname: string, email: string } }
    "liste_utilisateurs_reponse", // { etat: boolean, users?: User[], error?: string }
    "messages_reponse", // { etat: boolean, messages?: Message[], error?: string }
]

module.exports = {
    ListeMessagesEmis,
    ListeMessagesRecus,
}
