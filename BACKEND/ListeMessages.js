/**
 * Liste des messages émis
 * @type {string[]}
 */
export const ListeMessagesEmis = [
  "client_deconnexion", // No data
  "login_request", // { login: string, password: string }
  "signup_request", // { login: string, password: string, firstname: string, lastname: string, phone: string, job: string, desc: string }
  "users_list_request", // No data
  "upload_request", // { media: string }
  "update_user_request", // { any field of User }
  "user_info_request", // { user_info_request: { userId: string } }
  //---- DISCUSS ----
  "messages_get_request", // { convId: uuid }
  "message_send_request", // { userEmail: string, otherUserEmail?: string[], convId?:uuid , text: string }
  "discuss_list_request", // { userId : uuid }
  "users_shearch_request", // { requestArgs : string }
  "discuss_remove_member_request", // { UserId : uuid, convId : uuid }
  "discuss_remove_message_request", // { messageId : uuid, convId : uuid }
  //---- ROLES ----
  "roles_list_request", // No data
  "one_role_request", // { role_id : ObjectId}
  "create_role_request", // { name : string, perms : Permission._id[]}
  "update_role_request", // { role_id : ObjectId, perms : Permission._id[]}
  "delete_role_request", // {role_id : ObjectId}
  //---- PERMISSIONS ----
  "perms_list_request", // No data
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
  "upload_response", // { etat: boolean, error?: string, fileName?: string }
  "update_user_response", // { etat: boolean, newUserInfo: User | null,  error?: string }
  "user_info_response", // { user_info_response: { etat: boolean, userInfo?: User, error?: string } }
  //---- DISCUSS ----
  "messages_get_response", // { etat: boolean, messages?: Message[], error?: string }
  "message_send_response", // { etat: boolean, error?: string }
  "discuss_list_response", //{ etat: boolean, discussList? : Discussion[], error?: string }
  "users_shearch_response", // {  etat: boolean, users?: User[], error?: string }
  "discuss_remove_member_response", // { etat: boolean, error?: string }
  "discuss_remove_message_response", // { etat: boolean, error?: string }
  //---- ROLES ----
  "roles_list_response", // {role_list : Role[]}
  "one_role_response", // {role : Role}
  "created_role", // { role_id : ObjectId }
  "role_already_exists", // { state : boolean }
  "updated_role", //{ state : boolean}
  "deleted_role", // {state : boolean}
  //---- PERMISSIONS ----
  "perms_list_response", // { perms?: Permission[]}
];
