#!/bin/bash

# Script de démarrage interactif pour MMI-VisioConf (Linux/macOS)
# Ce script propose un choix entre Docker et installation locale

echo "🎥 Installation et démarrage de MMI-VisioConf"
echo "==============================================="
echo ""
echo "Choisissez votre méthode d'installation :"
echo ""
echo "1️⃣  Docker (Recommandé - Plus simple)"
echo "    ✅ Installation automatique de toutes les dépendances"
echo "    ✅ MongoDB inclus et configuré"
echo "    ✅ Environnement isolé et reproductible"
echo ""
echo "2️⃣  Installation locale"
echo "    🔧 Nécessite Node.js et MongoDB installés"
echo "    🔧 Configuration manuelle requise"
echo "    🔧 Plus de contrôle sur l'environnement"
echo ""

while true; do
    read -p "Votre choix (1 ou 2): " choice
    case $choice in
        [1] ) break;;
        [2] ) break;;
        * ) echo "Veuillez entrer 1 ou 2.";;
    esac
done

echo ""

if [ "$choice" = "1" ]; then
    echo "🐳 Installation avec Docker"
    echo "============================"
    
    # Vérifier si Docker est installé
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker n'est pas installé"
        echo "💡 Installez Docker depuis https://www.docker.com/products/docker-desktop/"
        echo "   Puis redémarrez ce script."
        read -p "Appuyez sur Entrée pour continuer..."
        exit 1
    fi
    
    echo "✅ Docker détecté: $(docker --version)"
    
    # Vérifier si Docker Compose est disponible
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose n'est pas disponible"
        exit 1
    fi
    
    echo "✅ Docker Compose détecté: $(docker-compose --version)"
    
    echo ""
    echo "🚀 Lancement de l'application avec Docker..."
    
    # Arrêter les conteneurs existants (si ils existent)
    echo "🛑 Arrêt des conteneurs existants..."
    docker-compose down 2>/dev/null
    
    # Construire et lancer les conteneurs
    echo "🔨 Construction et démarrage des conteneurs..."
    docker-compose up -d --build
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "⏳ Attente du démarrage des services..."
        sleep 10
        
        echo "📊 Initialisation de la base de données..."
        docker exec -it backend node initDb.js
        
        echo ""
        echo "🎉 Installation terminée avec succès !"
        echo "======================================="
        echo ""
        echo "🌐 Votre application est accessible sur :"
        echo "   Frontend: http://localhost:3000"
        echo "   Backend API: http://localhost:3220"
        echo ""
        echo "👤 Compte administrateur :"
        echo "   Email: admin@example.com"
        echo "   Mot de passe: admin123"
        echo ""
        echo "📋 Commandes utiles :"
        echo "   Arrêter: docker-compose down"
        echo "   Logs: docker-compose logs -f"
        echo "   Redémarrer: docker-compose restart"
        
    else
        echo "❌ Erreur lors du démarrage de Docker"
        echo "💡 Vérifiez que Docker est bien démarré"
        exit 1
    fi
    
else
    echo "💻 Installation locale"
    echo "======================"
    
    # Vérifier si Node.js est installé
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js n'est pas installé"
        echo "💡 Installez Node.js depuis https://nodejs.org/ (version 18+)"
        read -p "Appuyez sur Entrée pour continuer..."
        exit 1
    fi
    
    echo "✅ Node.js détecté: $(node --version)"
    
    # Vérifier si MongoDB est disponible
    echo "🔍 Vérification de MongoDB..."
    if mongosh --eval "db.version()" mongodb://localhost:27017/test &>/dev/null; then
        echo "✅ MongoDB local détecté et accessible"
        mongo_local=true
    else
        echo "⚠️  MongoDB local non détecté"
        echo ""
        echo "Options MongoDB :"
        echo "1. Installer MongoDB localement"
        echo "2. Utiliser MongoDB Atlas (cloud)"
        echo "3. Continuer sans MongoDB (à configurer manuellement)"
        echo ""
        
        while true; do
            read -p "Votre choix (1, 2 ou 3): " mongo_choice
            case $mongo_choice in
                [1] ) 
                    echo "💡 Pour installer MongoDB localement :"
                    echo "   Ubuntu/Debian: sudo apt-get install mongodb"
                    echo "   macOS: brew install mongodb-community"
                    echo "   Ou téléchargez depuis: https://www.mongodb.com/try/download/community"
                    echo "   Puis redémarrez ce script."
                    read -p "Appuyez sur Entrée pour continuer..."
                    exit 1
                    ;;
                [2] ) 
                    echo "💡 Pour utiliser MongoDB Atlas :"
                    echo "   1. Créez un compte gratuit sur: https://www.mongodb.com/atlas"
                    echo "   2. Créez un cluster gratuit"
                    echo "   3. Notez l'URI de connexion"
                    echo "   4. Vous devrez modifier le fichier BACKEND/.env après l'installation"
                    mongo_local=false
                    break
                    ;;
                [3] ) 
                    mongo_local=false
                    break
                    ;;
                * ) echo "Veuillez entrer 1, 2 ou 3.";;
            esac
        done
    fi
    
    echo ""
    echo "📦 Configuration du Backend..."
    cd BACKEND
    
    if [ ! -f .env ]; then
        cp .env.example .env
        echo "✅ Fichier .env créé pour le Backend"
        
        if [ "$mongo_local" = false ]; then
            echo "⚠️  N'oubliez pas de modifier BACKEND/.env avec votre URI MongoDB"
        fi
    else
        echo "ℹ️  Fichier .env déjà existant pour le Backend"
    fi
    
    echo "📦 Installation des dépendances Backend..."
    npm install
    
    if [ $? -ne 0 ]; then
        echo "❌ Erreur lors de l'installation des dépendances Backend"
        exit 1
    fi
    
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
    
    if [ $? -ne 0 ]; then
        echo "❌ Erreur lors de l'installation des dépendances Frontend"
        exit 1
    fi
    
    cd ..
    
    echo ""
    echo "🚀 Démarrage de l'application..."
    
    # Fonction pour lancer les services en arrière-plan
    echo "🔧 Lancement du Backend..."
    cd BACKEND
    nohup npm start > ../backend.log 2>&1 &
    backend_pid=$!
    cd ..
    
    echo "🎨 Lancement du Frontend..."
    cd FRONTEND  
    sleep 5
    nohup npm run dev > ../frontend.log 2>&1 &
    frontend_pid=$!
    cd ..
    
    echo "📊 Initialisation de la base de données..."
    sleep 10
    cd BACKEND
    node initDb.js
    cd ..
    
    echo ""
    echo "🎉 Installation terminée !"
    echo "========================="
    echo ""
    echo "🌐 Votre application est accessible sur :"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:3220"
    echo ""
    echo "👤 Compte administrateur :"
    echo "   Email: admin@example.com"
    echo "   Mot de passe: admin123"
    echo ""
    echo "📋 Logs des services :"
    echo "   Backend: tail -f backend.log"
    echo "   Frontend: tail -f frontend.log"
    echo ""
    echo "📋 Arrêter les services :"
    echo "   kill $backend_pid $frontend_pid"
    echo ""
    echo "✅ Les services fonctionnent en arrière-plan"
fi

read -p "Appuyez sur Entrée pour fermer ce script..."
