/**
 * Liste des messages émis
 * @type {string[]}
 */
export const ListeMessagesEmis = [
  "client_deconnexion", // No data
  "login_request", // { login: string, mdp: string }
  "signup_request", // { login: string, mdp: string, firstname: string, lastname: string, phone: string, job: string, desc: string }
  "users_list_request", // { }
  "messages_get_request", // { convId: uuid }
  "message_send_request", // { userEmail: string, otherUserEmail?: string[], convId?:uuid , text: string }
  "user_info_request", // { token: string }
  "discuss_list_request", // { userId : uuid }
  "users_shearch_request", // { requestArgs : string }
  "discuss_remove_member_request", // { UserId : uuid, convId : uuid }
];

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
  "discuss_list_response", //{ etat: boolean, discussList? : Discussion[], error?: string }
  "users_shearch_response", // {  etat: boolean, users?: User[], error?: string }
  "discuss_remove_member_response", // { etat: boolean, error?: string }
];
