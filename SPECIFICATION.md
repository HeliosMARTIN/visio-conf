# SPECIFICATIONS - MMI VisioConf

## FRONTEND

### Admin

#### --> Home Admin

| Variable/Fonction                 | Type/Variables            | Description                           |
| --------------------------------- |:-------------------------:| ------------------------------------  | 
| [selectedTab, setSelectedTab]     | string[ ]                 |  Liste des permissions de l'utilisateur connecté |
| [onlineUsers, setOnlineUsers]     | int                       | Nombre d'utilisateurs connectés
| [isAdmin, setIsAdmin]             | boolean     | Détermine si l'utilisateur connecté est admin ou non |
| tabs                              | {name : string, icon : JSXElement, color : string, click : Function}[ ]     | Onglet de l'interface admin sélectionnée |
| nomDInstance                      | string                    | Nom qui identifie le composant        |
| controleur                        |                           | Pointe vers l'instance du controleur  |
| verbose                           | boolean                   | Afficher les logs ou non du composant |
| listeMessageEmis                  | string[ ]                 | Contient les messages suivants : "users_list_request", "user_perms_request" |
| listeMessageRecus                 | string[ ]                 | Contient les messages suivants : "users_list_response", "user_perms_response", "update_user_roles_response", "updated_role" |
| traitementMessage (msg)           | msg est le message à traiter  | Traite les message qui viennent du controleur |

#### --> Admin Menu

| Variable/Fonction                 | Type/Variables            | Description                           |
| --------------------------------- |:-------------------------:| ------------------------------------  | 
| tabs                              | {name : string, icon : JSXElement, subOptions : array, click : Function }[ ]|  Liste des onglets de l'interface admin |

#### --> Home User Gestion

| Variable/Fonction                 | Type/Variables            | Description                           |
| --------------------------------- |:-------------------------:| ------------------------------------  | 
| [regex, setRegex]                 | string                    | Regex pour la recherche d'utilisateur |
| [userList, setUserList]           | User[]                    | Liste des utilisateurs                |
| [selectedUser, setSelectedUser]   | User                      | Utilisateur sélectionné               |
| [rows, setRows]                   | Any                       | Lignes du tableau des utilisateurs    |
| [openChangeStatus, setOpenChangeStatus] | boolean             |                                       |
| [openAlert, setOpenAlert]         | boolean                   | Ouvrir/Fermer la modale d'alerte      |
| [updateUser, setUpdateUser]       | boolean                   | Définir si un utilisateur est modifié ou non |
| [alertSeverity, setAlertSeverity] | string                    | Type de message de la modale d'alerte |
| [alertMessage, setAlertMessage]   | string                    | Contenu du message de la modale d'alerte |
| [action, setAction]               | sttring                   | Action effectué sur un utilisateur    |
| nomDInstance                      | string                    | Nom qui identifie le composant        |
| controleur                        |                           | Pointe vers l'instance du controleur  |
| verbose                           | boolean                   | Afficher les logs ou non du composant |
| listeMessageEmis                  | string[ ]                 | Contient les messages suivants : "users_list_request", "update_user_status_request", "update_user_roles_request" |
| listeMessageRecus                 | string[ ]                 | Contient les messages suivants : "users_list_response", "update_user_status_response", "update_user_roles_response" |
| traitementMessage (msg)           | msg est le message à traiter  | Traite les message qui viennent du controleur |
| handleChangeStatus()              | aucun                     | Envoie le changement de status de l'utilisateur |