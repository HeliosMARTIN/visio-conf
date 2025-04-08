# Documentation des Messages – VisioConf

Ce document décrit l'ensemble des messages utilisés dans l'application VisioConf, en précisant pour chacun :

-   **Format** attendu (les propriétés et leur type)
-   **Exemple de contenu** (un exemple représentatif)
-   **Émetteur** (la partie applicative qui envoie le message)
-   **Récepteur** (la partie applicative qui traite ou consomme le message)

> **Note :** Pour chaque message `request`, le message `response` correspondant a les rôles inversés :
>
> -   _Émetteur de la response_ = _Récepteur de la request_
> -   _Récepteur de la response_ = _Émetteur de la request_

---

## 1. Authentification

### Table des messages d'authentification

| **Message**         | **Format**                                                                                                           | **Exemple de contenu**                                                                                                                                    | **Émetteur**           | **Récepteur**          |
| ------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ---------------------- |
| **login_request**   | `{ login: string, password: string }`                                                                                | `{ login: "usertest123", password: "mdp" }`                                                                                                               | LoginPage (frontend)   | UsersService (backend) |
| **login_response**  | `{ etat: boolean, token?: string }`                                                                                  | `{ etat: true, token: "abc123token" }`                                                                                                                    | UsersService (backend) | LoginPage (frontend)   |
| **signup_request**  | `{ login: string, password: string, firstname: string, lastname: string, phone: string, job: string, desc: string }` | `{ login: "usertest123", password: "mdp", firstname: "Hélios", lastname: "Martin", phone: "0123456789", job: "developpeur", desc: "un étudiant en mmi" }` | SignupPage (frontend)  | UsersService (backend) |
| **signup_response** | `{ etat: boolean, token?: string }`                                                                                  | `{ etat: true, token: "def456token" }`                                                                                                                    | UsersService (backend) | LoginPage (frontend)   |

---

## 2. Utilisateurs

### Table des messages utilisateurs

| **Message**               | **Format**                                                                   | **Exemple de contenu**                                                        | **Émetteur**              | **Récepteur**             |
| ------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------- | ------------------------- |
| **users_list_request**    | `No data`                                                                    | `Aucun contenu`                                                               | AnnuairePage (frontend)   | UsersService (backend)    |
| **users_list_response**   | `{ etat: boolean, users?: User[], error?: string }`                          | `{ etat: true, users: [ { id: "u1", name:"Alice" } ] }`                       | UsersService (backend)    | AnnuairePage (frontend)   |
| **update_user_request**   | `{ any field of User }`                                                      | `{ name: "Alice Updated" }`                                                   | ProfilePage (frontend)    | UsersService (backend)    |
| **update_user_response**  | `{ etat: boolean, newUserInfo: User, error?: string }`                       | `{ etat: true, newUserInfo: { id:"u1", name:"Alice Updated" } }`              | UsersService (backend)    | ProfilePage (frontend)    |
| **user_info_request**     | `{ user_info_request: { userId: string } }`                                  | `{ user_info_request: { userId: "u1" } }`                                     | AppContext (frontend)     | UsersService (backend)    |
| **user_info_response**    | `{ user_info_response: { etat: boolean, userInfo?: User, error?: string } }` | `{ user_info_response: { etat: true, userInfo: { id:"u1", name:"Alice" } } }` | UsersService (backend)    | AppContext (frontend)     |
| **users_search_request**  | `{ requestArgs: string }`                                                    | `{ requestArgs: "Alice" }`                                                    | DiscussionPage (frontend) | MessagesService (backend) |
| **users_search_response** | `{ etat: boolean, users?: User[], error?: string }`                          | `{ etat: true, users: [ { id: "u1", name:"Alice" } ] }`                       | MessagesService (backend) | DiscussionPage (frontend) |

---

## 3. Discussions & Messages

### Table des messages de discussion et messagerie

| **Message**                         | **Format**                                                                      | **Exemple de contenu**                                                                                | **Émetteur**               | **Récepteur**              |
| ----------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------- | -------------------------- |
| **messages_get_request**            | `{ convId: uuid }`                                                              | `{ convId: "4fc3b11b-5be1-4e94-9616-183d90dbf6e3" }`                                                  | DiscussionPage (frontend)  | MessagesService (backend)  |
| **messages_get_response**           | `{ etat: boolean, messages?: Message[], error?: string }`                       | `{ etat: true, messages: [ { id:"m1", text:"Bonjour" } ] }`                                           | MessagesService (backend)  | DiscussionPage (frontend)  |
| **message_send_request**            | `{ userEmail: string, otherUserEmail?: string[], convId?: uuid, text: string }` | `{ userEmail: "alice@example.com", convId: "4fc3b11b-5be1-4e94-9616-183d90dbf6e3", text: "Salut !" }` | DiscussionPage (frontend)  | MessagesService (backend)  |
| **message_send_response**           | `{ etat: boolean, error?: string }`                                             | `{ etat: true }`                                                                                      | MessagesService (backend)  | DiscussionPage (frontend)  |
| **discuss_list_request**            | `{ userId: uuid }`                                                              | `{ userId: "d2e98a2e-498c-4be3-9e67-8df9b89a4d02" }`                                                  | DiscussionsPage (frontend) | MessagesService (backend)  |
| **discuss_list_response**           | `{ etat: boolean, discussList?: Discussion[], error?: string }`                 | `{ etat: true, discussList: [ { convId: "c1", title: "Discussion A" } ] }`                            | MessagesService (backend)  | DiscussionsPage (frontend) |
| **discuss_remove_member_request**   | `{ UserId: uuid, convId: uuid }`                                                | `{ UserId: "u1", convId: "c1" }`                                                                      | DiscussionsPage (frontend) | MessagesService (backend)  |
| **discuss_remove_member_response**  | `{ etat: boolean, error?: string }`                                             | `{ etat: true }`                                                                                      | MessagesService (backend)  | DiscussionsPage (frontend) |
| **discuss_remove_message_request**  | `{ messageId: uuid, convId: uuid }`                                             | `{ messageId: "m1", convId: "c1" }`                                                                   | DiscussionsPage (frontend) | MessagesService (backend)  |
| **discuss_remove_message_response** | `{ etat: boolean, error?: string }`                                             | `{ etat: true }`                                                                                      | MessagesService (backend)  | DiscussionsPage (frontend) |

---

## 4. Rôles & Permissions

### Table des messages concernant les rôles et permissions

| **Message**             | **Format**                                       | **Exemple de contenu**                                               | **Émetteur**               | **Récepteur**              |
| ----------------------- | ------------------------------------------------ | -------------------------------------------------------------------- | -------------------------- | -------------------------- |
| **roles_list_request**  | `No data`                                        | `Aucun contenu`                                                      | RoleListDisplay (frontend) | RolesService (backend)     |
| **roles_list_response** | `{ role_list: Role[] }`                          | `{ role_list: [ { id:"r1", name:"Admin" } ] }`                       | RolesService (backend)     | RoleListDisplay (frontend) |
| **one_role_request**    | `{ role_id: ObjectId }`                          | `{ role_id: "r1" }`                                                  | AddUpdateRole (frontend)   | RolesService (backend)     |
| **one_role_response**   | `{ role: Role }`                                 | `{ role: { id:"r1", name:"Admin", perms: [ "p1", "p2" ] } }`         | RolesService (backend)     | AddUpdateRole (frontend)   |
| **create_role_request** | `{ name: string, perms: Permission._id[] }`      | `{ name: "Editor", perms: [ "p3", "p4" ] }`                          | AddUpdateRole (frontend)   | RolesService (backend)     |
| **created_role**        | `{ role_id: ObjectId }`                          | `{ role_id: "r2" }`                                                  | RolesService (backend)     | AddUpdateRole (frontend)   |
| **update_role_request** | `{ role_id: ObjectId, perms: Permission._id[] }` | `{ role_id: "r1", perms: [ "p1", "p3" ] }`                           | AddUpdateRole (frontend)   | RolesService (backend)     |
| **updated_role**        | `{ state: boolean }`                             | `{ state: true }`                                                    | RolesService (backend)     | AddUpdateRole (frontend)   |
| **delete_role_request** | `{ role_id: ObjectId }`                          | `{ role_id: "r1" }`                                                  | RoleListDisplay (frontend) | RolesService (backend)     |
| **deleted_role**        | `{ state: boolean }`                             | `{ state: true }`                                                    | RolesService (backend)     | RoleListDisplay (frontend) |
| **perms_list_request**  | `No data`                                        | `Aucun contenu`                                                      | AddUpdateRole (frontend)   | RolesService (backend)     |
| **perms_list_response** | `{ perms?: Permission[] }`                       | `{ perms: [ { id:"p1", name:"READ" }, { id:"p2", name:"WRITE" } ] }` | RolesService (backend)     | AddUpdateRole (frontend)   |

---

## 5. Fichiers & Dossiers

### Table des messages liés aux fichiers et dossiers

| **Message**                | **Format**                                                                                  | **Exemple de contenu**                                                                                    | **Émetteur**          | **Récepteur**         |
| -------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------- | --------------------- |
| **files_list_request**     | `{ folderId?: string }`                                                                     | `{ folderId: "folder123" }` ou `Aucun contenu`                                                            | FilesPage (frontend)  | FileService (backend) |
| **files_list_response**    | `{ etat: boolean, files?: File[], error?: string }`                                         | `{ etat: true, files: [ { id:"f1", name:"doc.pdf" } ] }`                                                  | FileService (backend) | FilesPage (frontend)  |
| **file_upload_request**    | `{ name: string, size: number, mimeType: string, extension: string, parentId?: string }`    | `{ name: "doc.pdf", size: 102400, mimeType: "application/pdf", extension: ".pdf", parentId:"folder123" }` | FilesPage (frontend)  | FileService (backend) |
| **file_upload_response**   | `{ etat: boolean, error?: string, fileId?: string, fileName?: string, signedUrl?: string }` | `{ etat: true, fileId: "f1", fileName: "doc.pdf", signedUrl:"http://..." }`                               | FileService (backend) | FilesPage (frontend)  |
| **file_delete_request**    | `{ fileId: string }`                                                                        | `{ fileId: "f1" }`                                                                                        | FilesPage (frontend)  | FileService (backend) |
| **file_delete_response**   | `{ etat: boolean, fileId?: string, error?: string }`                                        | `{ etat: true, fileId: "f1" }`                                                                            | FileService (backend) | FilesPage (frontend)  |
| **file_rename_request**    | `{ fileId: string, newName: string }`                                                       | `{ fileId: "f1", newName: "nouveau_nom.pdf" }`                                                            | FilesPage (frontend)  | FileService (backend) |
| **file_rename_response**   | `{ etat: boolean, fileId?: string, newName?: string, error?: string }`                      | `{ etat: true, fileId: "f1", newName:"nouveau_nom.pdf" }`                                                 | FileService (backend) | FilesPage (frontend)  |
| **file_move_request**      | `{ fileId: string, newParentId: string }`                                                   | `{ fileId: "f1", newParentId: "folder456" }`                                                              | FilesPage (frontend)  | FileService (backend) |
| **file_move_response**     | `{ etat: boolean, fileId?: string, newParentId?: string, error?: string }`                  | `{ etat: true, fileId:"f1", newParentId:"folder456" }`                                                    | FileService (backend) | FilesPage (frontend)  |
| **file_share_request**     | `{ fileId: string, isPublic: boolean, userIds?: string[] }`                                 | `{ fileId: "f1", isPublic: false, userIds: ["u1", "u2"] }`                                                | FilesPage (frontend)  | FileService (backend) |
| **file_share_response**    | `{ etat: boolean, fileId?: string, error?: string }`                                        | `{ etat: true, fileId: "f1" }`                                                                            | FileService (backend) | FilesPage (frontend)  |
| **folder_create_request**  | `{ name: string, parentId?: string }`                                                       | `{ name: "Nouveau Dossier", parentId: "folder123" }`                                                      | FilesPage (frontend)  | FileService (backend) |
| **folder_create_response** | `{ etat: boolean, folderId?: string, folderName?: string, error?: string }`                 | `{ etat: true, folderId:"folder456", folderName:"Nouveau Dossier" }`                                      | FileService (backend) | FilesPage (frontend)  |
| **file_download_request**  | `{ fileId: string }`                                                                        | `{ fileId: "f1" }`                                                                                        | FilesPage (frontend)  | FileService (backend) |
| **file_download_response** | `{ etat: boolean, fileId?: string, downloadUrl?: string, error?: string }`                  | `{ etat: true, fileId:"f1", downloadUrl:"http://..." }`                                                   | FileService (backend) | FilesPage (frontend)  |

---

# Conclusion

Cette documentation regroupe l'ensemble des échanges de messages entre le frontend et le backend de VisioConf. Elle permet de comprendre :

-   Quel format doit être respecté pour chaque message.
-   Quel est l’exemple type de payload.
-   Quels composants ou services interagissent à chaque échange.

Ce format en Markdown est facilement éditable et consultable. Il est également possible de le transformer en HTML ou en PDF pour des besoins de diffusion ultérieure.
