/**
 * Liste des messages émis
 * @type {string[]}
 */
export const ListeMessagesEmis = [
    "client_deconnexion", // No data
    "login_request", // { login: string, mdp: string }
    "signup_request", // { login: string, mdp: string, firstname: string, lastname: string, phone: string, job: string, desc: string }
    "users_list_request", // No data
    "messages_get_request", // { userEmail: string | undefined, otherUserEmail: string }
    "message_send_request", // { userEmail: string, otherUserEmail: string, text: string }
    "user_info_request", // { token: string }
    "upload_request", // { media: string }
]

/**
 * Liste des messages reçus
 * @type {string[]}
 */
export const ListeMessagesRecus = [
    "client_deconnexion", // No data
    "login_response", // { etat: boolean, token?: string }
    "signup_response", // { etat: boolean, token?: string }
    "users_list_response", // { etat: boolean, users?: User[], error?: string }
    "messages_get_response", // { etat: boolean, messages?: Message[], error?: string }
    "message_send_response", // { etat: boolean, error?: string }
    "user_info_response", // { etat: boolean, token?: string, error?: string }
    "upload_response", // { etat: boolean, error?: string, url?: string }
]
