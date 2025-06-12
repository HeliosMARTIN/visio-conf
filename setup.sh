#!/bin/bash

# Script de démarrage rapide pour MMI-VisioConf
# Ce script configure automatiquement les variables d'environnement et lance le projet

echo "🎥 Configuration automatique de MMI-VisioConf"
echo "============================================="

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer depuis https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js détecté: $(node --version)"

# Configuration Backend
echo ""
echo "📦 Configuration du Backend..."
cd BACKEND

if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Fichier .env créé pour le Backend"
    echo "⚠️  Modifiez BACKEND/.env pour personnaliser la configuration (optionnel)"
else
    echo "ℹ️  Fichier .env déjà existant pour le Backend"
fi

echo "📦 Installation des dépendances Backend..."
npm install

# Configuration Frontend
echo ""
echo "🎨 Configuration du Frontend..."
cd ../FRONTEND

if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "✅ Fichier .env.local créé pour le Frontend"
else
    echo "ℹ️  Fichier .env.local déjà existant pour le Frontend"
fi

echo "📦 Installation des dépendances Frontend..."
npm install

cd ..

echo ""
echo "🚀 Configuration terminée !"
echo "============================================="
echo ""
echo "Pour démarrer le projet :"
echo ""
echo "Option 1 - Avec Docker (recommandé) :"
echo "  docker-compose up -d"
echo "  docker exec -it backend node initDb.js"
echo ""
echo "Option 2 - Manuellement :"
echo "  Terminal 1: cd BACKEND && npm start"
echo "  Terminal 2: cd FRONTEND && npm run dev"
echo "  Terminal 3: cd BACKEND && node initDb.js"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:3220"
echo ""
echo "💡 Assurez-vous d'avoir MongoDB en cours d'exécution !"
