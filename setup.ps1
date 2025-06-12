# Script de démarrage interactif pour MMI-VisioConf (Windows PowerShell)
# Ce script propose un choix entre Docker et installation locale

Write-Host "🎥 Installation et démarrage de MMI-VisioConf" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Choisissez votre méthode d'installation :" -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣  Docker (Recommandé - Plus simple)" -ForegroundColor Green
Write-Host "    ✅ Installation automatique de toutes les dépendances"
Write-Host "    ✅ MongoDB inclus et configuré"
Write-Host "    ✅ Environnement isolé et reproductible"
Write-Host ""
Write-Host "2️⃣  Installation locale" -ForegroundColor Blue
Write-Host "    🔧 Nécessite Node.js et MongoDB installés"
Write-Host "    🔧 Configuration manuelle requise"
Write-Host "    🔧 Plus de contrôle sur l'environnement"
Write-Host ""

do {
    $choice = Read-Host "Votre choix (1 ou 2)"
} while ($choice -notmatch "^[12]$")

Write-Host ""

if ($choice -eq "1") {
    Write-Host "🐳 Installation avec Docker" -ForegroundColor Cyan
    Write-Host "============================" -ForegroundColor Cyan
    
    # Vérifier si Docker est installé
    try {
        $dockerVersion = docker --version
        Write-Host "✅ Docker détecté: $dockerVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ Docker n'est pas installé ou n'est pas démarré" -ForegroundColor Red
        Write-Host "💡 Installez Docker Desktop depuis https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
        Write-Host "   Puis redémarrez ce script." -ForegroundColor Yellow
        Read-Host "Appuyez sur Entrée pour continuer..."
        exit 1
    }
    
    # Vérifier si Docker Compose est disponible
    try {
        $composeVersion = docker-compose --version
        Write-Host "✅ Docker Compose détecté: $composeVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ Docker Compose n'est pas disponible" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "🚀 Lancement de l'application avec Docker..." -ForegroundColor Yellow
    
    # Arrêter les conteneurs existants (si ils existent)
    Write-Host "🛑 Arrêt des conteneurs existants..." -ForegroundColor Gray
    docker-compose down 2>$null
    
    # Construire et lancer les conteneurs
    Write-Host "🔨 Construction et démarrage des conteneurs..." -ForegroundColor Yellow
    docker-compose up -d --build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "⏳ Attente du démarrage des services..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        
        Write-Host "📊 Initialisation de la base de données..." -ForegroundColor Yellow
        docker exec -it backend node initDb.js
        
        Write-Host ""
        Write-Host "🎉 Installation terminée avec succès !" -ForegroundColor Green
        Write-Host "=======================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "🌐 Votre application est accessible sur :" -ForegroundColor White
        Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "   Backend API: http://localhost:3220" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "👤 Compte administrateur :" -ForegroundColor White
        Write-Host "   Email: admin@example.com" -ForegroundColor Yellow
        Write-Host "   Mot de passe: admin123" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "📋 Commandes utiles :" -ForegroundColor White
        Write-Host "   Arrêter: docker-compose down" -ForegroundColor Gray
        Write-Host "   Logs: docker-compose logs -f" -ForegroundColor Gray
        Write-Host "   Redémarrer: docker-compose restart" -ForegroundColor Gray
        
    } else {
        Write-Host "❌ Erreur lors du démarrage de Docker" -ForegroundColor Red
        Write-Host "💡 Vérifiez que Docker Desktop est bien démarré" -ForegroundColor Yellow
        exit 1
    }
    
} else {
    Write-Host "💻 Installation locale" -ForegroundColor Cyan
    Write-Host "======================" -ForegroundColor Cyan
    
    # Vérifier si Node.js est installé
    try {
        $nodeVersion = node --version
        Write-Host "✅ Node.js détecté: $nodeVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ Node.js n'est pas installé" -ForegroundColor Red
        Write-Host "💡 Installez Node.js depuis https://nodejs.org/ (version 18+)" -ForegroundColor Yellow
        Read-Host "Appuyez sur Entrée pour continuer..."
        exit 1
    }
    
    # Vérifier si MongoDB est disponible
    Write-Host "🔍 Vérification de MongoDB..." -ForegroundColor Yellow
    try {
        # Tenter de se connecter à MongoDB local
        $mongoTest = mongosh --eval "db.version()" mongodb://localhost:27017/test 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ MongoDB local détecté et accessible" -ForegroundColor Green
            $mongoLocal = $true
        } else {
            throw "MongoDB local non accessible"
        }
    } catch {
        Write-Host "⚠️  MongoDB local non détecté" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Options MongoDB :" -ForegroundColor White
        Write-Host "1. Installer MongoDB localement" -ForegroundColor Blue
        Write-Host "2. Utiliser MongoDB Atlas (cloud)" -ForegroundColor Blue
        Write-Host "3. Continuer sans MongoDB (à configurer manuellement)" -ForegroundColor Blue
        Write-Host ""
        
        do {
            $mongoChoice = Read-Host "Votre choix (1, 2 ou 3)"
        } while ($mongoChoice -notmatch "^[123]$")
        
        if ($mongoChoice -eq "1") {
            Write-Host "💡 Pour installer MongoDB localement :" -ForegroundColor Yellow
            Write-Host "   1. Téléchargez MongoDB Community depuis: https://www.mongodb.com/try/download/community" -ForegroundColor Gray
            Write-Host "   2. Installez-le avec les options par défaut" -ForegroundColor Gray
            Write-Host "   3. Redémarrez ce script" -ForegroundColor Gray
            Read-Host "Appuyez sur Entrée pour continuer..."
            exit 1
        } elseif ($mongoChoice -eq "2") {
            Write-Host "💡 Pour utiliser MongoDB Atlas :" -ForegroundColor Yellow
            Write-Host "   1. Créez un compte gratuit sur: https://www.mongodb.com/atlas" -ForegroundColor Gray
            Write-Host "   2. Créez un cluster gratuit" -ForegroundColor Gray
            Write-Host "   3. Notez l'URI de connexion" -ForegroundColor Gray
            Write-Host "   4. Vous devrez modifier le fichier BACKEND/.env après l'installation" -ForegroundColor Gray
        }
        $mongoLocal = $false
    }
    
    Write-Host ""
    Write-Host "📦 Configuration du Backend..." -ForegroundColor Yellow
    Set-Location BACKEND
    
    if (!(Test-Path .env)) {
        Copy-Item .env.example .env
        Write-Host "✅ Fichier .env créé pour le Backend" -ForegroundColor Green
        
        if (!$mongoLocal) {
            Write-Host "⚠️  N'oubliez pas de modifier BACKEND/.env avec votre URI MongoDB" -ForegroundColor Yellow
        }
    } else {
        Write-Host "ℹ️  Fichier .env déjà existant pour le Backend" -ForegroundColor Blue
    }
    
    Write-Host "📦 Installation des dépendances Backend..." -ForegroundColor Yellow
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur lors de l'installation des dépendances Backend" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "🎨 Configuration du Frontend..." -ForegroundColor Yellow
    Set-Location ../FRONTEND
    
    if (!(Test-Path .env.local)) {
        Copy-Item .env.example .env.local
        Write-Host "✅ Fichier .env.local créé pour le Frontend" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  Fichier .env.local déjà existant pour le Frontend" -ForegroundColor Blue
    }
    
    Write-Host "📦 Installation des dépendances Frontend..." -ForegroundColor Yellow
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur lors de l'installation des dépendances Frontend" -ForegroundColor Red
        exit 1
    }
    
    Set-Location ..
    
    Write-Host ""
    Write-Host "🚀 Démarrage de l'application..." -ForegroundColor Yellow
    
    # Créer des scripts de démarrage temporaires
    $backendScript = @"
Set-Location BACKEND
Write-Host "🔧 Démarrage du Backend..." -ForegroundColor Yellow
npm start
"@
    
    $frontendScript = @"
Start-Sleep -Seconds 5
Set-Location FRONTEND
Write-Host "🎨 Démarrage du Frontend..." -ForegroundColor Yellow
npm run dev
"@
    
    $initScript = @"
Start-Sleep -Seconds 10
Set-Location BACKEND
Write-Host "📊 Initialisation de la base de données..." -ForegroundColor Yellow
node initDb.js
Write-Host ""
Write-Host "🎉 Installation terminée !" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Votre application est accessible sur :" -ForegroundColor White
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Backend API: http://localhost:3220" -ForegroundColor Cyan
Write-Host ""
Write-Host "👤 Compte administrateur :" -ForegroundColor White
Write-Host "   Email: admin@example.com" -ForegroundColor Yellow
Write-Host "   Mot de passe: admin123" -ForegroundColor Yellow
"@
    
    # Lancer les services en parallèle
    Write-Host "🔧 Lancement du Backend..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript
    
    Write-Host "🎨 Lancement du Frontend..." -ForegroundColor Yellow  
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript
    
    Write-Host "📊 Initialisation de la base de données..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $initScript
    
    Write-Host ""
    Write-Host "✅ Tous les services sont en cours de démarrage..." -ForegroundColor Green
    Write-Host "📱 Frontend sera disponible sur: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "🔧 Backend sera disponible sur: http://localhost:3220" -ForegroundColor Cyan
}

Read-Host "Appuyez sur Entrée pour fermer cette fenêtre..."
