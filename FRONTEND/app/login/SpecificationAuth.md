# SPECIFICATIONS FRONTEND - Connexion/Inscription

## Vue d'ensemble

Les fonctionnalités de "Connexion" et "Inscription" permettent aux utilisateurs de s'authentifier sur la plateforme VisioConf et de créer de nouveaux comptes. Elles offrent une interface sécurisée et intuitive pour l'accès à l'application avec validation des données, gestion d'erreurs et intégration avec le système d'authentification backend.

## Composants

### 1. LoginPage

**Description**: Page de connexion principale avec formulaire d'authentification et liens de navigation.

| Variable/Fonction | Type/Variables | Description                            |
| ----------------- | :------------: | -------------------------------------- |
| nomDInstance      |     string     | Identifiant du composant ("LoginPage") |

**Fonctionnalités**:

-   Affichage du logo de l'université
-   Intégration du formulaire de connexion
-   Lien vers la page d'inscription
-   Redirection automatique si utilisateur déjà connecté
-   Vérification du token dans les cookies

**Dépendances**:

-   LoginForm (composant)
-   useAppContext (contexte)

### 2. LoginForm

**Description**: Formulaire de connexion avec validation et gestion d'erreurs.

| Variable/Fonction               | Type/Variables | Description                                |
| ------------------------------- | :------------: | ------------------------------------------ |
| nomDInstance                    |     string     | Identifiant du composant ("LoginForm")     |
| verbose                         |    boolean     | Contrôle l'affichage des logs du composant |
| listeMessageEmis                |    string[]    | Messages émis: ["login_request"]           |
| listeMessageRecus               |    string[]    | Messages reçus: ["login_response"]         |
| [email, setEmail]               |     string     | Adresse email de l'utilisateur             |
| [password, setPassword]         |     string     | Mot de passe de l'utilisateur              |
| [showPassword, setShowPassword] |    boolean     | Affichage/masquage du mot de passe         |
| [error, setError]               |     string     | Message d'erreur général                   |
| [loading, setLoading]           |    boolean     | État de chargement du formulaire           |
| [loginError, setLoginError]     |     string     | Message d'erreur de connexion spécifique   |
| handler                         |     object     | Gestionnaire de messages                   |
| handler.traitementMessage(msg)  |    Function    | Traite les messages reçus du contrôleur    |

**Champs du formulaire**:

-   email (requis) : Adresse email avec validation HTML5
-   password (requis) : Mot de passe

**Fonctionnalités**:

-   Validation email avec type="email" HTML5
-   Affichage/masquage du mot de passe avec icônes Eye/EyeOff (lucide-react)
-   Gestion des erreurs de connexion avec feedback visuel
-   Vérification de la connexion socket avant envoi de la requête
-   Soumission via WebSocket avec attente de connexion (max 3 secondes)
-   Stockage sécurisé du token dans cookies et localStorage de secours
-   Redirection automatique vers "/" après connexion réussie
-   Redirection préventive si utilisateur déjà connecté

**Dépendances**:

-   AppContext (contexte)

### 3. SignupPage

**Description**: Page d'inscription avec formulaire de création de compte.

| Variable/Fonction | Type/Variables | Description                             |
| ----------------- | :------------: | --------------------------------------- |
| nomDInstance      |     string     | Identifiant du composant ("SignupPage") |

**Fonctionnalités**:

-   Affichage du logo de l'université
-   Intégration du formulaire d'inscription
-   Lien vers la page de connexion
-   Redirection automatique si utilisateur déjà connecté

**Dépendances**:

-   SignupForm (composant)
-   useAppContext (contexte)

### 4. SignupForm

**Description**: Formulaire d'inscription avec validation complète et création de compte.

| Variable/Fonction               | Type/Variables | Description                                |
| ------------------------------- | :------------: | ------------------------------------------ |
| nomDInstance                    |     string     | Identifiant du composant ("SignupForm")    |
| verbose                         |    boolean     | Contrôle l'affichage des logs du composant |
| listeMessageEmis                |    string[]    | Messages émis: ["signup_request"]          |
| listeMessageRecus               |    string[]    | Messages reçus: ["signup_response"]        |
| [email, setEmail]               |     string     | Adresse email de l'utilisateur             |
| [password, setPassword]         |     string     | Mot de passe de l'utilisateur              |
| [firstname, setFirstname]       |     string     | Prénom de l'utilisateur                    |
| [lastname, setLastname]         |     string     | Nom de famille de l'utilisateur            |
| [phone, setPhone]               |     string     | Numéro de téléphone                        |
| [job, setJob]                   |     string     | Fonction/Métier                            |
| [desc, setDesc]                 |     string     | Description personnelle                    |
| [error, setError]               |     string     | Message d'erreur général                   |
| [loading, setLoading]           |    boolean     | État de chargement du formulaire           |
| [signupError, setSignupError]   |     string     | Message d'erreur d'inscription spécifique  |
| [showPassword, setShowPassword] |    boolean     | Affichage/masquage du mot de passe         |
| handler                         |     object     | Gestionnaire de messages                   |

**Champs du formulaire**:

-   firstname (requis) : Prénom
-   lastname (requis) : Nom de famille
-   email (requis) : Adresse email avec validation HTML5
-   password (requis) : Mot de passe
-   phone (requis) : Numéro de téléphone
-   job (requis) : Fonction/Métier
-   desc (requis) : Description personnelle
-   phone : Numéro de téléphone
-   job : Fonction/Métier
-   desc : Description personnelle

**Fonctionnalités**:

-   Disposition en lignes avec groupement logique des champs (firstname/lastname, phone/job)
-   Validation HTML5 pour les champs requis
-   Affichage/masquage du mot de passe avec icônes Eye/EyeOff (lucide-react)
-   Gestion des erreurs d'inscription avec feedback visuel
-   Vérification de la connexion socket avant envoi de la requête
-   Soumission via WebSocket avec attente de connexion (max 3 secondes)
-   Stockage automatique du token dans cookies et localStorage de secours
-   Redirection automatique vers "/" après inscription réussie
-   Redirection préventive si utilisateur déjà connecté

**Dépendances**:

-   AppContext (contexte)

## Messages échangés

### Messages émis

| Message        | Format                                                                                                             | Exemple de contenu                                                                                                                                        | Émetteur   | Récepteur    |
| -------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------ |
| login_request  | { email: string, password: string }                                                                                | { email: "john@example.com", password: "securepassword123" }                                                                                              | LoginForm  | UsersService |
| signup_request | { email: string, password: string, firstname: string, lastname: string, phone: string, job: string, desc: string } | { email: "jane@example.com", password: "mypassword", firstname: "Jane", lastname: "Doe", phone: "0102030405", job: "Designer", desc: "Graphic designer" } | SignupForm | UsersService |

### Messages reçus

| Message         | Format                            | Exemple de contenu                      | Émetteur     | Récepteur  |
| --------------- | --------------------------------- | --------------------------------------- | ------------ | ---------- |
| login_response  | { etat: boolean, token?: string } | { etat: true, token: "abc123JWTtoken" } | UsersService | LoginForm  |
| signup_response | { etat: boolean, token?: string } | { etat: true, token: "def456JWTtoken" } | UsersService | SignupForm |

## Validation des données

### Validation côté client

#### Connexion

-   **email** : Champ requis avec validation HTML5 type="email"
-   **password** : Champ requis

#### Inscription

-   **email** : Champ requis avec validation HTML5 type="email"
-   **password** : Champ requis
-   **firstname** : Champ requis
-   **lastname** : Champ requis
-   **phone** : Champ requis (type text)
-   **job** : Champ requis (type text)
-   **desc** : Champ requis (type text)

### Feedback visuel

-   Classes CSS conditionnelles pour les champs en erreur
-   Messages d'erreur spécifiques affichés sous les champs
-   État de chargement avec bouton désactivé pendant la soumission

## Gestion des erreurs

### Erreurs de connexion

-   **Identifiants incorrects** : "Email ou mot de passe incorrect"
-   **Erreur réseau** : "La connexion a échoué. Veuillez réessayer."
-   **Erreur socket** : "Impossible de se connecter au serveur"

### Erreurs d'inscription

-   **Échec d'inscription** : "Signup failed. Please try again."
-   **Erreur réseau** : "Signup failed. Please try again."
-   **Erreur socket** : "Impossible de se connecter au serveur"

### Affichage des erreurs

-   Messages d'erreur en rouge sous les champs concernés
-   Message d'erreur global en haut du formulaire pour les erreurs serveur
-   Nettoyage automatique des erreurs lors de la saisie
-   Maintien du focus sur le champ en erreur

## Sécurité

### Côté client

-   **Masquage des mots de passe** : Par défaut masqués avec option d'affichage
-   **Validation stricte** : Empêche l'envoi de données invalides
-   **Nettoyage des données** : Suppression des espaces en début/fin
-   **Pas de stockage local** : Aucune donnée sensible en localStorage

### Authentification

-   **Tokens JWT** : Stockés dans des cookies httpOnly (côté serveur)
-   **Expiration** : Tokens avec durée de vie limitée
-   **Hachage** : Mots de passe hachés côté serveur (SHA-256)
-   **Protection CSRF** : Cookies avec flags sécurisés

## États et UX

### Navigation

-   **Auto-redirection** : Vers la page d'accueil après authentification réussie
-   **Liens contextuels** : Navigation entre connexion et inscription
-   **Retour utilisateur connecté** : Redirection si déjà authentifié

## Intégration avec l'application

### AppContext

-   **currentUser** : Mise à jour automatique après authentification
-   **controleur** : Utilisation du contrôleur global pour la communication
-   **canal** : Communication via le canal WebSocket principal

### Cookies et tokens

-   **Stockage** : Token dans cookie `accessToken`
-   **Expiration** : Gestion automatique de l'expiration
-   **Nettoyage** : Suppression lors de la déconnexion

### Redirections

-   **Page d'accueil** : Après connexion/inscription réussie
-   **Page demandée** : Retour vers la page initialement demandée (futur)
-   **Protection des routes** : Middleware d'authentification sur les pages protégées
