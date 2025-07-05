#!/bin/bash

# Debug-Script für Coolify Port-Konflikte
# Hilft bei der Diagnose von Port-Problemen

set -e

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Coolify Port-Diagnose${NC}"
echo "================================"

# Prüfe Port 3001
echo -e "${BLUE}📡 Prüfe Port 3001...${NC}"
if lsof -i :3001 > /dev/null 2>&1; then
    echo -e "${RED}❌ Port 3001 ist belegt!${NC}"
    echo "Aktive Verbindungen:"
    lsof -i :3001
    echo ""
    echo -e "${YELLOW}💡 Lösung: Verwende Port 3003${NC}"
else
    echo -e "${GREEN}✅ Port 3001 ist frei${NC}"
fi

# Prüfe Port 3003
echo -e "${BLUE}📡 Prüfe Port 3003...${NC}"
if lsof -i :3003 > /dev/null 2>&1; then
    echo -e "${RED}❌ Port 3003 ist belegt!${NC}"
    echo "Aktive Verbindungen:"
    lsof -i :3003
else
    echo -e "${GREEN}✅ Port 3003 ist frei${NC}"
fi

# Prüfe Docker Container
echo -e "${BLUE}🐳 Prüfe Docker Container...${NC}"
if docker ps --format "table {{.Names}}\t{{.Ports}}" | grep -E "(3001|3003)"; then
    echo -e "${YELLOW}⚠️  Docker Container mit diesen Ports gefunden:${NC}"
    docker ps --format "table {{.Names}}\t{{.Ports}}" | grep -E "(3001|3003)"
else
    echo -e "${GREEN}✅ Keine Docker Container mit diesen Ports${NC}"
fi

# Prüfe Coolify Services
echo -e "${BLUE}☁️  Prüfe Coolify Services...${NC}"
if command -v coolify &> /dev/null; then
    if coolify whoami &> /dev/null; then
        echo -e "${GREEN}✅ Coolify CLI verfügbar und eingeloggt${NC}"
        echo "Verfügbare Services:"
        coolify app list 2>/dev/null || echo "Keine Services gefunden"
    else
        echo -e "${YELLOW}⚠️  Coolify CLI nicht eingeloggt${NC}"
    fi
else
    echo -e "${RED}❌ Coolify CLI nicht installiert${NC}"
fi

# Empfehlungen
echo ""
echo -e "${BLUE}💡 Empfehlungen:${NC}"
echo "=================="
echo "1. Verwende Port 3003 für das Backend"
echo "2. Stelle sicher, dass alle Konfigurationsdateien aktualisiert sind:"
echo "   - docker-compose.coolify.yml"
echo "   - backend/Dockerfile.coolify"
echo "   - env.coolify.example"
echo "3. Starte das Deployment neu mit:"
echo "   ./deploy-coolify.sh"
echo ""
echo -e "${GREEN}✅ Diagnose abgeschlossen!${NC}" 