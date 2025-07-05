#!/bin/bash

# Coolify Deployment Script für eb-due
# Dieses Script erstellt und deployt die Anwendung in Coolify

set -e

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Konfiguration
PROJECT_NAME="eb-due"
REPO_URL="https://github.com/mirosens/eb-due.git"
BRANCH="main"

echo -e "${BLUE}🚀 Coolify Deployment für eb-due${NC}"
echo "=================================="

# Prüfe ob Coolify CLI installiert ist
if ! command -v coolify &> /dev/null; then
    echo -e "${RED}❌ Coolify CLI ist nicht installiert${NC}"
    echo "Installiere mit: curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash"
    exit 1
fi

# Prüfe ob wir eingeloggt sind
if ! coolify whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Nicht bei Coolify eingeloggt${NC}"
    echo "Bitte logge dich ein mit: coolify login"
    exit 1
fi

echo -e "${GREEN}✅ Coolify CLI verfügbar${NC}"

# Erstelle oder aktualisiere das Projekt
echo -e "${BLUE}📦 Erstelle/aktualisiere Projekt in Coolify...${NC}"

# Erstelle die Anwendung in Coolify
coolify app create \
    --name "$PROJECT_NAME" \
    --repository "$REPO_URL" \
    --branch "$BRANCH" \
    --buildPack "dockerfile" \
    --dockerfilePath "backend/Dockerfile.coolify" \
    --port 3003 \
    --environmentVariables "NODE_ENV=production,PORT=3003" \
    --healthCheckPath "/api/health" \
    --healthCheckPort 3003

echo -e "${GREEN}✅ Projekt erstellt/aktualisiert${NC}"

# Erstelle die Datenbank
echo -e "${BLUE}🗄️  Erstelle PostgreSQL Datenbank...${NC}"

coolify database create \
    --name "${PROJECT_NAME}-postgres" \
    --type "postgresql" \
    --version "15" \
    --environmentVariables "POSTGRES_DB=eb_due_db,POSTGRES_USER=eb_due_user,POSTGRES_PASSWORD=eb_due_secure_password_2024"

echo -e "${GREEN}✅ Datenbank erstellt${NC}"

# Erstelle das Frontend
echo -e "${BLUE}🌐 Erstelle Frontend...${NC}"

coolify app create \
    --name "${PROJECT_NAME}-frontend" \
    --repository "$REPO_URL" \
    --branch "$BRANCH" \
    --buildPack "dockerfile" \
    --dockerfilePath "Dockerfile.frontend" \
    --port 80 \
    --environmentVariables "NODE_ENV=production,VITE_API_URL=http://${PROJECT_NAME}-backend:3003" \
    --healthCheckPath "/" \
    --healthCheckPort 80

echo -e "${GREEN}✅ Frontend erstellt${NC}"

# Deploy die Anwendungen
echo -e "${BLUE}🚀 Starte Deployment...${NC}"

# Deploy Backend
echo -e "${YELLOW}📦 Deploye Backend...${NC}"
coolify app deploy --name "$PROJECT_NAME"

# Deploy Frontend
echo -e "${YELLOW}🌐 Deploye Frontend...${NC}"
coolify app deploy --name "${PROJECT_NAME}-frontend"

echo -e "${GREEN}✅ Deployment abgeschlossen!${NC}"

# Zeige Status
echo -e "${BLUE}📊 Deployment Status:${NC}"
echo "=================================="
echo -e "${GREEN}Backend:${NC}"
echo "   Name: $PROJECT_NAME"
echo "   Port: 3003"
echo "   Health: /api/health"
echo ""
echo -e "${GREEN}Frontend:${NC}"
echo "   Name: ${PROJECT_NAME}-frontend"
echo "   Port: 80"
echo "   Health: /"
echo ""
echo -e "${GREEN}Datenbank:${NC}"
echo "   Name: ${PROJECT_NAME}-postgres"
echo "   Type: PostgreSQL 15"
echo ""
echo -e "${BLUE}🔗 URLs:${NC}"
echo "   Frontend: https://eb-due.mirosens.com"
echo "   Backend API: https://api.eb-due.mirosens.com"
echo ""
echo -e "${GREEN}🎉 Deployment erfolgreich!${NC}" 