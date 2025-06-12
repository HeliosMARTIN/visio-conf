# Configuration UTF-8 complete pour l'affichage correct des caracteres
# Forcer la page de code UTF-8 dans la console
chcp 65001 > $null

# Configuration de l'encodage pour PowerShell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# Variables globales pour l'encodage
$PSDefaultParameterValues['*:Encoding'] = 'utf8'
$env:PYTHONIOENCODING = "utf-8"

function Write-Color($text, $color = "White") {
    Write-Host $text -ForegroundColor $color
}

Write-Color "=== Demarrage de MMI-VisioConf ===" Cyan
Write-Color "1. Demarrer avec Docker (recommande)" Green
Write-Color "2. Installation locale" Blue

do {
    $choice = Read-Host "Choix (1 ou 2)"
} while ($choice -notmatch '^[12]$')

if ($choice -eq "1") {
    Write-Color ">> Mode Docker selectionne" Cyan
    
    # Verifier Docker
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Color "X Docker non detecte. Installez Docker Desktop : https://www.docker.com/products/docker-desktop" Red
        Read-Host "`nAppuyez sur Entree pour quitter"
        exit 1
    }

    # Docker Compose
    if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
        Write-Color "X Docker Compose manquant." Red
        Read-Host "`nAppuyez sur Entree pour quitter"
        exit 1
    }docker-compose down
    docker-compose up -d --build    if ($LASTEXITCODE -eq 0) {
        Start-Sleep -Seconds 10
        docker exec backend node initDb.js        Write-Color "`n** Application lancee avec succes !" Green
        Write-Color "** Frontend: http://localhost:3000" Cyan
        Write-Color "**  Backend: http://localhost:3220" Cyan
        Write-Color "** Connexion suggeree: john.doe@example.com | mdp" Yellow
    } else {
        Write-Color "X Erreur au demarrage avec Docker." Red
    }
}
else {
    Write-Color ">> Mode installation locale selectionne" Cyan
    
    # Verification Node.js
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Color "X Node.js non detecte. Telechargez-le sur https://nodejs.org/" Red
        Read-Host "`nAppuyez sur Entree pour quitter"
        exit 1
    }    # Verification MongoDB et mongosh
    $mongoAvailable = $false
    
    # Essayer mongosh d'abord (nouveau shell MongoDB)
    if (Get-Command mongosh -ErrorAction SilentlyContinue) {
        try {
            & mongosh --eval 'db.stats()' --quiet > $null 2>&1
            $mongoAvailable = $true
            Write-Color "V MongoDB et mongosh detectes." Green
        } catch {
            Write-Color "!! mongosh detecte mais MongoDB service non demarre." Yellow
        }
    }
    # Essayer mongo (ancien shell) si mongosh ne fonctionne pas
    elseif (Get-Command mongo -ErrorAction SilentlyContinue) {
        try {
            & mongo --eval 'db.stats()' --quiet > $null 2>&1
            $mongoAvailable = $true
            Write-Color "V MongoDB detecte (mongo)." Green
        } catch {
            Write-Color "!! mongo detecte mais MongoDB service non demarre." Yellow
        }
    }
    
    if (-not $mongoAvailable) {
        Write-Color "X MongoDB Shell (mongosh) non detecte." Red
        Write-Color "Pour l'installation locale, vous devez installer :" Yellow
        Write-Color "  1. MongoDB Community Server : https://www.mongodb.com/try/download/community" Yellow
        Write-Color "  2. MongoDB Shell (mongosh) : https://www.mongodb.com/try/download/shell" Yellow
        Write-Color "  3. Demarrer le service MongoDB" Yellow
        Write-Color "  4. Ajouter mongosh au PATH" Yellow
        Write-Color "" White
        Write-Color "Alternative : Utilisez Docker (option 1) pour eviter cette configuration." Cyan
        Read-Host "`nAppuyez sur Entree pour quitter"
        exit 1
    }# Backend
    Set-Location BACKEND
    if (!(Test-Path ".env") -and (Test-Path ".env.example")) {
        Copy-Item ".env.example" ".env"
    }
    npm install

    # Frontend
    Set-Location ../FRONTEND
    if (!(Test-Path ".env.local") -and (Test-Path ".env.example")) {
        Copy-Item ".env.example" ".env.local"
    }
    npm install

    # Retour au dossier racine
    Set-Location ..

    # Lancer les services
    $scriptDir = Get-Location
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir'; cd BACKEND; npm start"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir'; Start-Sleep 5; cd FRONTEND; npm run dev"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir'; Start-Sleep 10; cd BACKEND; node initDb.js"    Write-Color "`n** Application en cours de lancement..." Green
    Write-Color "** Frontend: http://localhost:3000" Cyan
    Write-Color "**  Backend: http://localhost:3220" Cyan
    Write-Color "** Connexion suggeree: john.doe@example.com | mdp" Yellow
}

Read-Host "`nAppuyez sur Entree pour quitter"
