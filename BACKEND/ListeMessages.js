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
  "users_search_request", // { requestArgs : string }
  "discuss_remove_member_request", // { UserId : uuid, convId : uuid }
  "discuss_remove_message_request", // { messageId : uuid,
  //---- ROLES ----
  "roles_list_request", // No data
  "one_role_request", // { role_id : ObjectId}
  "create_role_request", // { name : string, perms : Permission._id[]}
  "update_role_request", // { role_id : ObjectId, perms : Permission._id[]}
  "delete_role_request", // {role_id : ObjectId}
  //---- PERMISSIONS ----
  "perms_list_request", // No data
  //---- FILES ----
  "files_list_request", // { folderId?: string }
  "file_upload_request", // { name: string, size: number, mimeType: string, extension: string, parentId?: string }
  "file_delete_request", // { fileId: string }
  "file_rename_request", // { fileId: string, newName: string }
  "file_move_request", // { fileId: string, newParentId: string }
  "file_share_request", // { fileId: string, isPublic: boolean, userIds?: string[] }
  "folder_create_request", // { name: string, parentId?: string }
  "file_download_request", // { fileId: string }
];
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
    "upload_request", // { media: string }
    "update_user_request", // { any field of User }
    "user_info_request", // { user_info_request: { userId: string } }
    //---- DISCUSS ----
    "messages_get_request", // { convId: uuid }
    "message_send_request", // { userEmail: string, otherUserEmail?: string[], convId?:uuid , text: string }
    "discuss_list_request", // { userId : uuid }
    "users_search_request", // { requestArgs : string }
    "discuss_remove_member_request", // { UserId : uuid, convId : uuid }
    "discuss_remove_message_request", // { messageId : uuid, convId : uuid }
    //---- ROLES ----
    "roles_list_request", // No data
    "one_role_request", // { role_id : ObjectId}=
    "create_role_request", // { name : string, perms : Permission._id[], action : string}=
    "update_role_request", // { role_id : ObjectId, perms : Permission._id[]}
    "delete_role_request", // {role_id : ObjectId}
    //---- PERMISSIONS ----
    "perms_list_request", // No data=
    "user_perms_request", //{ userId : ObjectId}
    "update_perm_request", // { perm_id : ObjectId, newLabel : string}
    "add_perm_request", // { newLabel : string, newUuid : string}=
    //---- FILES ----
    "files_list_request", // { folderId?: string }
    "file_upload_request", // { name: string, size: number, mimeType: string, extension: string, parentId?: string }
    "file_delete_request", // { fileId: string }
    "file_rename_request", // { fileId: string, newName: string }
    "file_move_request", // { fileId: string, newParentId: string }
    "file_share_request", // { fileId: string, teamId?: string }
    "folder_create_request", // { name: string, parentId?: string }
    //---- CHANNELS ----
    "channels_list_request", // { teamId?: string }
    "channel_create_request", // { name: string, teamId: string, isPublic: boolean, members?: string[] }
    "channel_update_request", // { id: string, name?: string, isPublic?: boolean }
    "channel_delete_request", // { channelId: string }
    "channel_join_request", // { channelId: string }
    "channel_leave_request", // { channelId: string }
    "channel_members_request", // { channelId: string }
    "channel_add_member_request", // { channelId: string, userId: string }
    "channel_remove_member_request", // { channelId: string, userId: string }
    "channel_posts_request", // { channelId: string }
    "channel_post_create_request", // { channelId: string, content: string }
    "channel_post_responses_request", // { postId: string }
    "channel_post_response_create_request", // { postId: string, content: string }
    //---- TEAMS ----
    "teams_list_request", // No data
    "team_create_request", // { name: string, description?: string }
    "team_update_request", // { teamId: string, name?: string, description?: string }
    "team_delete_request", // { teamId: string }
    "team_join_request", // { teamId: string }
    "team_leave_request", // { teamId: string }
    "team_members_request", // { teamId: string }
    "team_add_member_request", // { teamId: string, userId: string }
    "team_remove_member_request", // { teamId: string, userId: string }
    "team_channels_request", // { teamId: string }
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
  "upload_response", // { etat: boolean, error?: string, fileName?: string }
  "update_user_response", // { etat: boolean, newUserInfo: User | null,  error?: string }
  "user_info_response", // { user_info_response: { etat: boolean, userInfo?: User, error?: string } }
  //---- DISCUSS ----
  "messages_get_response", // { etat: boolean, messages?: Message[], error?: string }
  "message_send_response", // { etat: boolean, error?: string }
  "discuss_list_response", //{ etat: boolean, discussList? : Discussion[], error?: string }
  "users_search_response", // {  etat: boolean, users?: User[], error?: string }
  "discuss_remove_member_response", // { etat: boolean, error?: string }
  "discuss_remove_message_response", // { etat: boolean, error?: string }
  "message_status_response", // {etat: boolean, error?: string }
  //---- ROLES ----
  "roles_list_response", // {role_list : Role[]}
  "one_role_response", // {role : Role}
  "created_role", // { role_id : ObjectId }
  "role_already_exists", // { state : boolean }
  "updated_role", //{ state : boolean}
  "deleted_role", // {state : boolean}
  //---- PERMISSIONS ----
  "perms_list_response", // { perms?: Permission[]}
  //---- FILES ----
  "files_list_response", // { etat: boolean, files?: File[], error?: string }
  "file_upload_response", // { etat: boolean, error?: string, fileId?: string, fileName?: string, signedUrl?: string }
  "file_delete_response", // { etat: boolean, fileId?: string, error?: string }
  "file_rename_response", // { etat: boolean, fileId?: string, newName?: string, error?: string }
  "file_move_response", // { etat: boolean, fileId?: string, newParentId?: string, error?: string }
  "file_share_response", // { etat: boolean, fileId?: string, error?: string }
  "folder_create_response", // { etat: boolean, folderId?: string, folderName?: string, error?: string }
  "file_download_response", // { etat: boolean, fileId?: string, downloadUrl?: string, error?: string }
];
