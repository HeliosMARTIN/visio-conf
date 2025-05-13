# Documentation de la classe FileService

## Vue d'ensemble

La classe `FileService` est responsable de la gestion des fichiers et dossiers dans l'application Visioconf. Elle gère les requêtes de type CRUD pour les fichiers et dossiers, ainsi que les opérations comme le partage, le déplacement, le renommage ou le téléchargement.

## Architecture

`FileService` suit le modèle orienté messages où il s'enregistre auprès d’un contrôleur central pour recevoir et émettre des messages liés aux fichiers. Il s’appuie sur des identifiants de socket pour récupérer l'utilisateur associé aux requêtes.

## Propriétés

| Propriété               | Description                                              |
| ----------------------- | -------------------------------------------------------- |
| `controleur`            | Référence au contrôleur central                          |
| `nomDInstance`          | Identifiant unique de l'instance du service              |
| `listeDesMessagesEmis`  | Liste des types de messages que le service peut émettre  |
| `listeDesMessagesRecus` | Liste des types de messages que le service peut recevoir |

## Messages gérés

### Messages reçus

| Message                 | Format                                                                                   | Émetteur                |
| ----------------------- | ---------------------------------------------------------------------------------------- | ----------------------- |
| `files_list_request`    | `{ folderId?: string }`                                                                  | FileExplorer (frontend) |
| `folders_list_request`  | `{ excludeFolderId?: string }`                                                           | FileExplorer (frontend) |
| `file_upload_request`   | `{ name: string, size: number, mimeType: string, extension: string, parentId?: string }` | FileExplorer (frontend) |
| `file_delete_request`   | `{ fileId: string }`                                                                     | FileExplorer (frontend) |
| `file_rename_request`   | `{ fileId: string, newName: string }`                                                    | FileExplorer (frontend) |
| `file_move_request`     | `{ fileId: string, newParentId: string }`                                                | FileExplorer (frontend) |
| `file_share_request`    | `{ fileId: string, isPublic: boolean, userIds?: string[] }`                              | FileExplorer (frontend) |
| `folder_create_request` | `{ name: string, parentId?: string }`                                                    | FileExplorer (frontend) |

### Messages émis

| Message                 | Format                                                  | Récepteur    |
| ----------------------- | ------------------------------------------------------- | ------------ |
| `files_list_response`   | `{ etat: boolean, files?: File[], error?: string }`     | FileExplorer |
| `folders_list_response` | `{ etat: boolean, folders?: Folder[], error?: string }` | FileExplorer |
| `file_delete_response`  | `{ etat: boolean, fileId?: string, error?: string }`    | FileExplorer |
| `file_rename_response`  | `{ etat: boolean, error?: string }`                     | FileExplorer |
| `file_move_response`    | `{ etat: boolean, error?: string }`                     | FileExplorer |
| `file_share_response`   | `{ etat: boolean, error?: string }`                     | FileExplorer |

## Méthodes

### `constructor(controleur, nom)`

Initialise le service, configure les types de messages pris en charge et s'enregistre auprès du contrôleur.

### `traitementMessage(mesg)`

Méthode principale pour traiter les messages. Redirige vers la méthode appropriée selon le type de requête :

-   `files_list_request` → liste les fichiers dans un dossier donné
-   `folders_list_request` → liste des dossiers pour déplacement
-   `file_upload_request` → enregistre un nouveau fichier
-   `file_delete_request` → suppression logique d’un fichier ou dossier (soft delete)
-   `file_rename_request` → renomme un fichier ou dossier
-   `file_move_request` → déplace un fichier ou dossier
-   `file_share_request` → partage un fichier ou dossier
-   `folder_create_request` → crée un dossier
-   `file_download_request` → demande de téléchargement, relai vers `AwsS3Service`

### Méthodes utilitaires

| Méthode                                      | Description                                                           |
| -------------------------------------------- | --------------------------------------------------------------------- |
| `getAllDescendantFolders(folderId, ownerId)` | Récupère récursivement tous les dossiers enfants d’un dossier donné.  |
| `recursiveDelete(folderId, ownerId)`         | Supprime logiquement tous les éléments contenus dans un dossier.      |
| `isCircularReference(sourceId, targetId)`    | Vérifie si le déplacement d’un dossier crée une référence circulaire. |

## Sécurité

-   L'accès aux fichiers se fait via le `socketId` et le `ownerId`, empêchant toute action non autorisée.
-   Les fichiers ne sont jamais supprimés physiquement immédiatement : un champ `deleted` est mis à `true`.
-   Les fichiers peuvent être partagés publiquement ou à des utilisateurs spécifiques via `sharedWith`.

## Flux typiques

### Ajout d’un fichier

1. L’utilisateur envoie `file_upload_request`
2. Le service génère un identifiant unique, une entrée en base, et enregistre le fichier
3. Aucune réponse directe, mais un rafraîchissement peut être déclenché côté client

### Suppression d’un fichier

1. L’utilisateur envoie `file_delete_request`
2. Le service vérifie l’accès et effectue un soft delete
3. Répond avec `file_delete_response`
