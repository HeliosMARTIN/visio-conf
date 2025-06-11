# 🎥 MMI-VisioConf

**WORK-IN-PROGRESS**  
Application web de visioconférence développée dans le cadre de la formation MMI à Toulon.

---

## 🚀 À propos

**VisioConf** est une application web fullstack inspirée de Discord et Microsoft Teams. Elle permet aux utilisateurs de créer des salons de discussion vocaux et textuels. Ce projet est développé en **fullstack JavaScript** (Next.js, Express.js, MongoDB, Socket.io) et peut être utilisé librement dans un esprit open source.

---

## 📁 Structure du projet

Ce dépôt contient **deux parties** :

-   `FRONTEND/` : l’interface utilisateur développée avec **Next.js**
-   `BACKEND/` : l’API et le serveur temps réel, développés avec **Express.js** et **Socket.io**

---

## 📸 Liens utiles

-   🧠 [Répartition projet (Google Sheet)](https://docs.google.com/spreadsheets/d/16RPy8aX9jTc8ohg1K-XuYi35fKyjXtvpPTFK2d26330/edit?usp=sharing)
-   🔁 [Liste des messages Socket.io](https://docs.google.com/spreadsheets/d/1PU2A-OddIKHMH3m5-PCLM-urDUQUkT3RFboCHYrBTA4/edit?usp=sharing)
-   🧪 [Ancienne maquette (Figma)](https://www.figma.com/design/7ThCs23ZaX0PXpY37B2qdf/VISIOCONF?node-id=0-1&t=TOgDrMpUMmIcWGKD-1)
-   🎨 [Nouvelle maquette (Figma)](https://www.figma.com/design/FhZD9N2AjSr0cu77KebYIc/Visio-conf?node-id=11-644&t=ObnywIOneUb5uQn1-0)

---

## ⚙️ Installation & Démarrage

### 1. Prérequis

-   Node.js v18+
-   MongoDB en local ou sur Atlas
-   Git

### 2. Cloner le projet

```bash
git clone https://github.com/HeliosMARTIN/visio-conf.git
cd visio-conf
```

### 3. Installation des dépendances

#### Backend

```bash
cd BACKEND
npm install
```

#### Frontend (Next.js)

```bash
cd ../FRONTEND
npm install
```


## ⚙️ Installation & Démarrage via Docker

### 1. Prérequis

-   Docker
-   Docker Compose

### 2. Cloner le projet

```bash
git clone https://github.com/HeliosMARTIN/visio-conf.git
cd visio-conf
```

### 3. Lancement du projet Docker

```Construction du projet et démarrage
docker-compose build --no-cache
docker-compose up -d
```

```Fermeture du projet
docker-compose down
```

### 4. 🗃️ Initialisation de la base de données (optionnel)

Si tu veux pré-remplir la base de données avec des exemples :

```Dans le terminal du conteneur BACKEND
node initDb.js
```

---

## 🔐 Configuration des variables d’environnement

Crée un fichier `.env` dans chacun le dossier `BACKEND`et remplis les clés nécessaires, en suivant le fichier `.env.example`

## 🗃️ Initialisation de la base de données (optionnel)

Si tu veux pré-remplir la base de données avec des exemples :

```bash
cd BACKEND
node initDb.js
```

---

## ▶️ Lancer le projet

### 1. Backend

```bash
cd BACKEND
node index.js
```

### 2. Frontend

Dans un autre terminal :

```bash
cd FRONTEND
npx next dev
```
