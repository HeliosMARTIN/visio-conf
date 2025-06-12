# 🚀 Guide de démarrage rapide

Ce guide vous permettra de faire fonctionner MMI-VisioConf en quelques minutes.

## Option 1 : Démarrage automatique avec Docker 🐳

**C'est la méthode recommandée !**

1. **Prérequis** : Assurez-vous d'avoir Docker et Docker Compose installés
2. **Une seule commande** :

```bash
docker-compose up -d
```

3. **Initialiser les données** :

```bash
docker exec -it backend node initDb.js
```

4. **C'est tout !**
    - Frontend : http://localhost:3000
    - Backend : http://localhost:3220

## Option 2 : Installation manuelle

### Méthode rapide avec script

**Windows PowerShell :**

```powershell
.\setup.ps1
```

**Linux/macOS :**

```bash
chmod +x setup.sh
./setup.sh
```

### Méthode manuelle

1. **Backend** :

```bash
cd BACKEND
npm install
cp .env.example .env
npm start
```

2. **Frontend** (nouveau terminal) :

```bash
cd FRONTEND
npm install
cp .env.example .env.local
npm run dev
```

3. **Initialiser la base de données** (nouveau terminal) :

```bash
cd BACKEND
node initDb.js
```

## 📝 Configuration MongoDB

### Problème courant : MongoDB non démarré

Si vous voyez cette erreur :

```
MongooseServerSelectionError: connect ECONNREFUSED
```

**Solutions :**

1. **Avec Docker** : Déjà inclus ! MongoDB démarre automatiquement
2. **Installation locale Windows** :
    - Installer [MongoDB Community](https://www.mongodb.com/try/download/community)
    - Démarrer le service MongoDB
3. **MongoDB Atlas (cloud)** :
    - Créer un compte gratuit sur [MongoDB Atlas](https://www.mongodb.com/atlas)
    - Modifier `MONGO_URI` dans `BACKEND/.env`

## 🔑 Compte administrateur par défaut

Après avoir exécuté `node initDb.js`, vous pouvez vous connecter avec :

-   **Email** : admin@example.com
-   **Mot de passe** : admin123

## ❓ Problèmes fréquents

### Port déjà utilisé

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### Variables d'environnement non chargées

-   Redémarrer les serveurs après modification des fichiers `.env`
-   Vérifier que les variables Frontend commencent par `NEXT_PUBLIC_`

### Erreur CORS

-   Vérifier que `FRONTEND_URL=http://localhost:3000` dans `BACKEND/.env`
-   Redémarrer le Backend

## 📚 Commandes utiles

```bash
# Arrêter Docker
docker-compose down

# Voir les logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Nettoyer les uploads
cd BACKEND
npm run clear-uploads

# Réinitialiser la base de données
cd BACKEND
node initDb.js
```

---

**🎯 Objectif : Faire fonctionner l'application en moins de 5 minutes !**
