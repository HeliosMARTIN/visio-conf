# Script de démarrage rapide pour MMI-VisioConf (Windows PowerShell)
# Ce script configure automatiquement les variables d'environnement et lance le projet

Write-Host "🎥 Configuration automatique de MMI-VisioConf" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Vérifier si Node.js est installé
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js détecté: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js n'est pas installé. Veuillez l'installer depuis https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Configuration Backend
Write-Host ""
Write-Host "📦 Configuration du Backend..." -ForegroundColor Yellow
Set-Location BACKEND

if (!(Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "✅ Fichier .env créé pour le Backend" -ForegroundColor Green
    Write-Host "⚠️  Modifiez BACKEND/.env pour personnaliser la configuration (optionnel)" -ForegroundColor Yellow
} else {
    Write-Host "ℹ️  Fichier .env déjà existant pour le Backend" -ForegroundColor Blue
}

Write-Host "📦 Installation des dépendances Backend..." -ForegroundColor Yellow
npm install

# Configuration Frontend
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

Set-Location ..

Write-Host ""
Write-Host "🚀 Configuration terminée !" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pour démarrer le projet :" -ForegroundColor White
Write-Host ""
Write-Host "Option 1 - Avec Docker (recommandé) :" -ForegroundColor Yellow
Write-Host "  docker-compose up -d"
Write-Host "  docker exec -it backend node initDb.js"
Write-Host ""
Write-Host "Option 2 - Manuellement :" -ForegroundColor Yellow
Write-Host "  Terminal 1: cd BACKEND; npm start"
Write-Host "  Terminal 2: cd FRONTEND; npm run dev"
Write-Host "  Terminal 3: cd BACKEND; node initDb.js"
Write-Host ""
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend API: http://localhost:3220" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Assurez-vous d'avoir MongoDB en cours d'exécution !" -ForegroundColor Magenta
