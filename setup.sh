#!/bin/bash

# Script de demarrage interactif pour MMI-VisioConf (Linux/macOS)
# Ce script propose un choix entre Docker et installation locale

echo "=== Demarrage de MMI-VisioConf ==="
echo "1. Demarrer avec Docker (recommande)"
echo "2. Installation locale"

while true; do
    read -p "Choix (1 ou 2): " choice
    case $choice in
        [1] ) break;;
        [2] ) break;;
        * ) echo "Veuillez entrer 1 ou 2.";;
    esac
done

echo ""

if [ "$choice" = "1" ]; then
    echo ">> Mode Docker selectionne"
    
    # Verifier Docker
    if ! command -v docker &> /dev/null; then
        echo "X Docker non detecte. Installez Docker Desktop : https://www.docker.com/products/docker-desktop/"
        read -p "Appuyez sur Entree pour quitter..."
        exit 1
    fi
    
    # Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        echo "X Docker Compose manquant."
        read -p "Appuyez sur Entree pour quitter..."
        exit 1
    fi
    
    docker-compose down 2>/dev/null
    docker-compose up -d --build
    
    if [ $? -eq 0 ]; then
        sleep 10
        docker exec backend node initDb.js
        
        echo ""
        echo "** Application lancee avec succes !"
        echo "** Frontend: http://localhost:3000"
        echo "**  Backend: http://localhost:3220"
        echo "** Connexion suggeree: john.doe@example.com | password123"
    else
        echo "X Erreur au demarrage avec Docker."
    fi
    
else
    echo ">> Mode installation locale selectionne"
    
    # Verification Node.js
    if ! command -v node &> /dev/null; then
        echo "X Node.js non detecte. Telechargez-le sur https://nodejs.org/"
        read -p "Appuyez sur Entree pour quitter..."
        exit 1
    fi
    
    # Verification MongoDB et mongosh
    mongoAvailable=false
    
    # Essayer mongosh d'abord (nouveau shell MongoDB)
    if command -v mongosh &> /dev/null; then
        if mongosh --eval "db.stats()" --quiet mongodb://localhost:27017/test &>/dev/null; then
            mongoAvailable=true
            echo "V MongoDB et mongosh detectes."
        else
            echo "!! mongosh detecte mais MongoDB service non demarre."
        fi
    # Essayer mongo (ancien shell) si mongosh ne fonctionne pas
    elif command -v mongo &> /dev/null; then
        if mongo --eval "db.stats()" --quiet mongodb://localhost:27017/test &>/dev/null; then
            mongoAvailable=true
            echo "V MongoDB detecte (mongo)."
        else
            echo "!! mongo detecte mais MongoDB service non demarre."
        fi
    fi
    
    if [ "$mongoAvailable" = false ]; then
        echo "X MongoDB Shell (mongosh) non detecte."
        echo "Pour l'installation locale, vous devez installer :"
        echo "  1. MongoDB Community Server : https://www.mongodb.com/try/download/community"
        echo "  2. MongoDB Shell (mongosh) : https://www.mongodb.com/try/download/shell"
        echo "  3. Demarrer le service MongoDB"
        echo "  4. Ajouter mongosh au PATH"
        echo ""
        echo "Alternative : Utilisez Docker (option 1) pour eviter cette configuration."
        read -p "Appuyez sur Entree pour quitter..."
        exit 1
    fi    
    # Backend
    cd BACKEND
    if [ ! -f .env ] && [ -f .env.example ]; then
        cp .env.example .env
    fi
    npm install
    
    # Frontend
    cd ../FRONTEND
    if [ ! -f .env.local ] && [ -f .env.example ]; then
        cp .env.example .env.local
    fi
    npm install
    
    # Retour au dossier racine
    cd ..
    
    # Lancer les services
    scriptDir=$(pwd)
    cd "$scriptDir/BACKEND" && npm start &
    sleep 5
    cd "$scriptDir/FRONTEND" && npm run dev &
    sleep 10
    cd "$scriptDir/BACKEND" && node initDb.js
    
    echo ""
    echo "** Application en cours de lancement..."
    echo "** Frontend: http://localhost:3000"
    echo "**  Backend: http://localhost:3220"
    echo "** Connexion suggeree: john.doe@example.com | password123"
fi

read -p "Appuyez sur Entree pour quitter..."
