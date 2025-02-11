/**
 * Liste des messages émis
 * @type {string[]}
 */
const ListeMessagesEmis = [
    "client_deconnexion", // No data
    "login_request", // { login: string, mdp: string }
    "signup_request", // { login: string, mdp: string, firstname: string, lastname: string, user_phone: string, user_job: string, user_desc: string }
    "users_list_request", // No data
    "messages_get_request", // { userEmail: string | undefined, otherUserEmail: string }
    "message_send_request", // { userEmail: string, otherUserEmail: string, text: string }
]

/**
 * Liste des messages reçus
 * @type {string[]}
 */
const ListeMessagesRecus = [
    "client_deconnexion", // No data
    "login_response", // { etat: string, user?: { firstname: string, lastname: string, email: string } }
    "signup_response", // { etat: string, user?: { firstname: string, lastname: string, email: string } }
    "users_list_response", // { etat: boolean, users?: User[], error?: string }
    "messages_get_response", // { etat: boolean, messages?: Message[], error?: string }
    "message_send_response", // { etat: boolean, error?: string }
]

module.exports = {
    ListeMessagesEmis,
    ListeMessagesRecus,
}
