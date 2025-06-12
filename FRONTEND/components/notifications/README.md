# Système de Notifications - VisioConf

## Vue d'ensemble

Le système de notifications de VisioConf offre une solution complète pour gérer les notifications temporaires et persistantes. Il comprend :

-   **Notifications temporaires** (toast) : Apparaissent et disparaissent automatiquement
-   **Notifications persistantes** : Stockées en base de données et accessibles via le panneau
-   **Système de paramètres** : Permet aux utilisateurs de personnaliser leurs préférences
-   **Intégration temps réel** : Utilise Socket.io pour les notifications instantanées

## Architecture

### Backend

#### Modèles

-   `Notification` : Stocke les notifications avec métadonnées
-   `NotificationSettings` : Gère les préférences utilisateur

#### Service

-   `NotificationsService` : Gère toutes les opérations CRUD et la logique métier

### Frontend

#### Composants

-   `NotificationBell` : Cloche avec badge de comptage
-   `NotificationPanel` : Panneau de gestion des notifications
-   `NotificationSettings` : Modal de paramètres
-   `ToastNotification` : Notifications temporaires
-   `NotificationSystem` : Composant principal d'intégration

#### Context

-   `NotificationContext` : Gère l'état global et les interactions

## Types de Notifications

```typescript
enum NotificationType {
    MESSAGE = "message",
    CHANNEL_POST = "channel_post",
    CHANNEL_INVITE = "channel_invite",
    TEAM_INVITE = "team_invite",
    ROLE_UPDATE = "role_update",
    SYSTEM = "system",
    CALL = "call",
    FILE_SHARE = "file_share",
}
```

## Priorités

```typescript
enum NotificationPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent",
}
```

## Utilisation

### 1. Intégration dans l'application

Le système est déjà intégré dans `AppContext.tsx` et `Menu.tsx`. Pour l'utiliser dans d'autres composants :

```tsx
import { useNotifications } from "@/components/notifications/NotificationSystem";

const MyComponent = () => {
    const { createNotification, success, error, warning, info } =
        useNotifications();

    const handleAction = () => {
        // Notification personnalisée
        createNotification({
            type: "message",
            title: "Nouveau message",
            message: "Vous avez reçu un message",
            priority: "medium",
            actionUrl: "/discussion",
            actionText: "Voir le message",
        });

        // Ou utiliser les méthodes de commodité
        success("Succès", "Opération réussie !");
        error("Erreur", "Une erreur s'est produite");
        warning("Attention", "Action irréversible");
        info("Information", "Info importante");
    };
};
```

### 2. Création de notifications côté backend

```javascript
// Dans un service backend
const notificationService = new NotificationsService(
    controleur,
    "NotificationsService"
);

// Créer une notification système
await notificationService.createSystemNotification(
    userId,
    "message",
    "Nouveau message",
    "Vous avez reçu un message de Jean",
    {
        priority: "medium",
        actionUrl: "/discussion",
        actionText: "Voir le message",
        isPersistent: true,
    }
);
```

### 3. Intégration avec les événements existants

Pour intégrer les notifications dans les services existants (Messages, Channels, etc.) :

```javascript
// Exemple dans MessagesService.js
if (mesg.message_send_request) {
    // ... logique existante ...

    // Créer une notification pour les destinataires
    const recipients = discussion.discussion_members.filter(
        (member) => member._id.toString() !== sender._id.toString()
    );

    for (const recipient of recipients) {
        await this.controleur.notificationsService.createSystemNotification(
            recipient._id,
            "message",
            `Nouveau message de ${sender.firstname}`,
            messageContent.substring(0, 100) + "...",
            {
                priority: "medium",
                actionUrl: `/discussion/${discussion.discussion_uuid}`,
                actionText: "Voir le message",
                data: {
                    discussionId: discussion.discussion_uuid,
                    senderId: sender._id,
                    messageId: message_uuid,
                },
            }
        );
    }
}
```

## Fonctionnalités

### Notifications Temporaires (Toast)

-   Apparaissent en haut à droite
-   Disparaissent automatiquement après 5 secondes
-   Barre de progression visuelle
-   Animations fluides
-   Couleurs basées sur la priorité

### Notifications Persistantes

-   Stockées en base de données MongoDB
-   Accessibles via le panneau de notifications
-   Filtrage par type
-   Marquer comme lu/supprimer
-   Comptage des non-lues

### Paramètres Utilisateur

-   Activer/désactiver par type de notification
-   Notifications bureau
-   Sons
-   Heures silencieuses
-   Notifications email (préparé pour l'extension)

### Intégration Temps Réel

-   Socket.io pour les notifications instantanées
-   Mise à jour en temps réel du compteur
-   Notifications bureau natives (si autorisées)

## Personnalisation

### Styles

Tous les composants utilisent des modules CSS avec des variables CSS pour la cohérence :

```css
:root {
    --notification-primary: #3b82f6;
    --notification-success: #10b981;
    --notification-warning: #f59e0b;
    --notification-error: #ef4444;
}
```

### Thèmes

Le système s'adapte automatiquement au thème de l'application via les classes CSS.

## Tests

Un composant de test est disponible : `NotificationTest.tsx`

Pour l'utiliser, ajoutez-le à une page :

```tsx
import { NotificationTest } from "@/components/notifications/NotificationTest";

// Dans votre page
<NotificationTest />;
```

## Extensions Futures

1. **Notifications Email** : Intégration avec un service SMTP
2. **Notifications Push** : Service Worker pour les notifications hors ligne
3. **Notifications Mobiles** : Intégration avec les notifications natives
4. **Templates** : Système de templates pour les notifications complexes
5. **Analytics** : Suivi des interactions avec les notifications

## Maintenance

### Nettoyage Automatique

Les notifications temporaires expirées sont automatiquement supprimées par MongoDB (TTL index).

### Monitoring

Le système inclut des logs détaillés pour le debugging et le monitoring.

## Support

Pour toute question ou problème avec le système de notifications, consultez :

-   Les logs du serveur pour les erreurs backend
-   La console du navigateur pour les erreurs frontend
-   Le composant `NotificationTest` pour tester les fonctionnalités
