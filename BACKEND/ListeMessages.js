/**
 * Liste des messages émis
 * @type {string[]}
 */
export const ListeMessagesEmis = [
    "client_deconnexion", // No data
    "login_request", // { login: string, password: string }
    "signup_request", // { login: string, password: string, firstname: string, lastname: string, phone: string, job: string, desc: string }
    "users_list_request", // No data
    "messages_get_request", // { userEmail: string | undefined, otherUserEmail: string }
    "message_send_request", // { userEmail: string, otherUserEmail: string, text: string }
    "upload_request", // { media: string }
    "update_user_request", // { any field of User }
    "update_user_status_request", // {user_id : ObjectId, action : string}
    "update_user_roles_request", // {user_id : ObjectId, roles : Role._id[]}
    //---- ROLES ----
    "roles_list_request", // No data
    "one_role_request", // { role_id : ObjectId}
    "create_role_request", // { name : string, perms : Permission._id[], action : string}
    "update_role_request", // { role_id : ObjectId, perms : Permission._id[]}
    "delete_role_request", // {role_id : ObjectId}
    //---- PERMISSIONS ----
    "perms_list_request", // No data
    "user_perms_request", //{ userId : ObjectId}
    "update_perm_request", // { perm_id : ObjectId, newLabel : string}
    "add_perm_request", // { newLabel : string, newUuid : string}
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
    "upload_response", // { etat: boolean, error?: string, url?: string }
    "update_user_response", // { etat: boolean, newUserInfo: User | null,  error?: string }
    "update_user_status_response", // {etat: boolean, action : string}
    "update_user_roles_response", // {userId : ObjectId}
    //---- ROLES ----
    "roles_list_response", // {role_list : Role[]}
    "one_role_response", // {role : Role}
    "created_role", // { role_id : ObjectId }
    "role_already_exists", // { state : boolean }
    "updated_role", //{ state : boolean}
    "deleted_role", // {state : boolean}
    //---- PERMISSIONS ----
    "perms_list_response", // { perms?: Permission[]} 
    "user_perms_response", // { perms : Permission[]}
    "update_perm_response", // { state : boolean }
    "add_perm_response", // {message : string }
]
