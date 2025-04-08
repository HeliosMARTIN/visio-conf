# Documentation de la classe UsersService

## Vue d'ensemble

La classe `UsersService` est responsable de la gestion des utilisateurs dans l'application Visioconf. Elle utilise un modèle de communication basé sur des messages pour interagir avec d'autres composants du système via un contrôleur central.

## Architecture

`UsersService` s'inscrit dans une architecture orientée messages où chaque service communique via un contrôleur central qui route les messages entre les différents composants. Cette approche permet un découplage fort entre les services.

## Propriétés

| Propriété      | Description                                           |
| -------------- | ----------------------------------------------------- |
| `controleur`   | Référence au contrôleur central qui gère les messages |
| `nomDInstance` | Identifiant unique de l'instance du service           |

## Messages gérés

### Messages reçus

| Message               | Format                                                                                                             | Exemple de contenu                                                                                                                                | Émetteur                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `login_request`       | { login: string, password: string }                                                                                | { login: "john_doe", password: "securepassword123" }                                                                                              | LoginPage (frontend)    |
| `signup_request`      | { login: string, password: string, firstname: string, lastname: string, phone: string, job: string, desc: string } | { login: "jane_doe", password: "mypassword", firstname: "Jane", lastname: "Doe", phone: "0102030405", job: "Designer", desc: "Graphic designer" } | SignupPage (frontend)   |
| `users_list_request`  | No data                                                                                                            | Aucun contenu                                                                                                                                     | AnnuairePage (frontend) |
| `update_user_request` | { id?: string, firstname?: string, lastname?: string, phone?: string, job?: string, desc?: string }                | { firstname: "Alice updated" }                                                                                                                    | ProfilePage (frontend)  |
| `user_info_request`   | { user_info_request: { userId: string } }                                                                          | { user_info_request: { userId: "u1" } }                                                                                                           | AppContext (frontend)   |

### Messages émis

| Message                | Format                                                                     | Exemple de contenu                                                                                                                                                                                                                                        | Récepteur               |
| ---------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `login_response`       | { etat: boolean, token?: string }                                          | { etat: true, token: "abc123JWTtoken" }                                                                                                                                                                                                                   | LoginPage (frontend)    |
| `signup_response`      | { etat: boolean, token?: string }                                          | { etat: true, token: "def456JWTtoken" }                                                                                                                                                                                                                   | LoginPage (frontend)    |
| `users_list_response`  | { etat: boolean, users?: User[], error?: string }                          | { etat: true, users: [ { id: "u1", firstname: "Alice", lastname: "Dupont" "phone: "0123456789", job: "Developer", desc: "Programmer" }, { id: "u2", firstname: "John", lastname: "Dupont" "phone: "0123456789", job: "Developer", desc: "Programmer"} ] } | AnnuairePage (frontend) |
| `update_user_response` | { etat: boolean, newUserInfo: User, error?: string }                       | { etat: true, newUserInfo: { id: "u1", firstname: "Alice updated", lastname: "Dupont" "phone: "0123456789", job: "Developer", desc: "Programmer" } }                                                                                                      | ProfilePage (frontend)  |
| `user_info_response`   | { user_info_response: { etat: boolean, userInfo?: User, error?: string } } | { user_info_response: { etat: true, userInfo: { firstname:"Alice" } } }                                                                                                                                                                                   | AppContext (frontend)   |

## Méthodes

### `constructor(c, nom)`

Initialise le service et l'inscrit auprès du contrôleur.

**Paramètres:**

-   `c`: Le contrôleur central
-   `nom`: Le nom d'instance du service

**Fonctionnement:**

1. Stocke les références au contrôleur et au nom d'instance
2. Affiche un message de log si le mode verbose est activé
3. S'inscrit auprès du contrôleur en fournissant:
    - Une référence à l'instance courante (`this`)
    - La liste des messages que le service peut émettre
    - La liste des messages que le service peut recevoir

### `traitementMessage(mesg)`

Point d'entrée principal pour le traitement des messages reçus. Cette méthode agit comme un routeur qui délègue le traitement aux méthodes spécialisées.

**Paramètres:**

-   `mesg`: Le message à traiter

**Fonctionnement:**

1. Affiche le message reçu dans les logs si le mode verbose est activé
2. Identifie le type de message en vérifiant la présence de propriétés spécifiques
3. Délègue le traitement à la méthode spécialisée correspondante:
    - `login_request` → `handleLogin`
    - `signup_request` → `handleSignup`
    - `users_list_request` → `handleUsersList`
    - `update_user_request` → `handleUpdateUser`
    - `user_info_request` → `handleUserInfo`

### `handleLogin(mesg)`

Traite les demandes de connexion en vérifiant les identifiants de l'utilisateur.

**Paramètres:**

-   `mesg`: Le message contenant la demande de connexion

**Fonctionnement:**

1. Extrait les informations de login et mot de passe du message
2. Hache le mot de passe avec SHA-256 pour comparaison sécurisée
3. Recherche l'utilisateur dans la base de données avec le login et le mot de passe haché
4. Si l'utilisateur est trouvé:
    - Génère un token JWT contenant l'ID de l'utilisateur avec une expiration de 1 jour
    - Envoie une réponse positive avec le token
5. Si l'utilisateur n'est pas trouvé ou en cas d'erreur:
    - Envoie une réponse négative avec un message d'erreur
6. Utilise un bloc try-catch pour gérer les erreurs potentielles

### `handleSignup(mesg)`

Traite les demandes d'inscription en créant un nouvel utilisateur.

**Paramètres:**

-   `mesg`: Le message contenant la demande d'inscription

**Fonctionnement:**

1. Extrait toutes les informations utilisateur du message (login, password, firstname, lastname, etc.)
2. Vérifie si un utilisateur avec le même login existe déjà
3. Si l'utilisateur existe, renvoie une erreur
4. Sinon:
    - Hache le mot de passe avec SHA-256
    - Crée un nouvel objet utilisateur avec un UUID généré
    - Sauvegarde l'utilisateur dans la base de données
    - Génère un token JWT pour l'authentification immédiate
    - Envoie une réponse positive avec le token
5. En cas d'erreur, envoie une réponse négative avec le message d'erreur
6. Utilise un bloc try-catch pour gérer les erreurs potentielles

### `handleUsersList(mesg)`

Récupère et renvoie la liste de tous les utilisateurs.

**Paramètres:**

-   `mesg`: Le message contenant la demande de liste d'utilisateurs

**Fonctionnement:**

1. Interroge la base de données pour récupérer tous les utilisateurs
2. Limite les champs retournés pour des raisons de sécurité et de performance (firstname, lastname, email, picture, phone)
3. Formate les données des utilisateurs pour correspondre à la structure attendue par le frontend
4. Envoie une réponse contenant la liste des utilisateurs formatée
5. En cas d'erreur, envoie une réponse négative avec le message d'erreur
6. Utilise un bloc try-catch pour gérer les erreurs potentielles

### `handleUpdateUser(mesg)`

Met à jour les informations d'un utilisateur existant.

**Paramètres:**

-   `mesg`: Le message contenant la demande de mise à jour d'utilisateur

**Fonctionnement:**

1. Récupère l'ID du socket émetteur pour identifier l'utilisateur
2. Vérifie que l'ID du socket est disponible
3. Extrait les champs à mettre à jour du message
4. Utilise le service SocketIdentificationService pour obtenir les informations de l'utilisateur à partir de l'ID du socket
5. Met à jour uniquement les champs fournis dans la base de données
6. Récupère les informations mises à jour de l'utilisateur
7. Formate et renvoie les nouvelles informations utilisateur
8. En cas d'erreur (utilisateur non trouvé, etc.), envoie une réponse négative
9. Utilise un bloc try-catch pour gérer les erreurs potentielles

### `handleUserInfo(mesg)`

Récupère et renvoie les informations d'un utilisateur spécifique.

**Paramètres:**

-   `mesg`: Le message contenant la demande d'informations sur un utilisateur

**Fonctionnement:**

1. Extrait l'ID de l'utilisateur demandé du message
2. Recherche l'utilisateur dans la base de données par son ID
3. Limite les champs retournés pour des raisons de sécurité (firstname, lastname, email, picture, phone)
4. Si l'utilisateur est trouvé:
    - Formate les informations utilisateur
    - Envoie une réponse positive avec les informations
5. Si l'utilisateur n'est pas trouvé:
    - Envoie une réponse négative avec un message d'erreur
6. Utilise un bloc try-catch pour gérer les erreurs potentielles

### `sha256(text)`

Génère un hash SHA-256 d'une chaîne de texte pour sécuriser les mots de passe.

**Paramètres:**

-   `text`: Le texte à hacher (généralement un mot de passe)

**Fonctionnement:**

1. Encode le texte en un tableau d'octets (Uint8Array) à l'aide de TextEncoder
2. Utilise l'API SubtleCrypto pour générer le hash SHA-256
3. Convertit le buffer résultant en une chaîne hexadécimale
4. Retourne la chaîne hexadécimale représentant le hash
5. Cette méthode est asynchrone et retourne une Promise

## Flux de travail typiques

### Authentification

1. Le client envoie un message `login_request` avec login et mot de passe
2. Le service hache le mot de passe et vérifie les identifiants
3. Si valide, génère un token JWT et répond avec `login_response` (succès)
4. Si invalide, répond avec `login_response` (échec)

### Inscription

1. Le client envoie un message `signup_request` avec les informations utilisateur
2. Le service vérifie si le login existe déjà
3. Si non, crée un nouvel utilisateur avec mot de passe haché
4. Génère un token JWT et répond avec `signup_response` (succès)
5. Si échec, répond avec `signup_response` (échec)

### Récupération de la liste des utilisateurs

1. Le client envoie un message `users_list_request` (sans données)
2. Le service récupère tous les utilisateurs de la base de données
3. Formate les données et répond avec `users_list_response`

## Sécurité

-   Les mots de passe sont hachés avec SHA-256 avant stockage
-   L'authentification utilise des tokens JWT avec expiration
-   Les réponses ne contiennent que les informations nécessaires (pas de mot de passe)
