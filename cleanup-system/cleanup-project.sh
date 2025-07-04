#!/bin/bash

echo "🔍 Projekt-Bereinigung gestartet..."
echo "=================================="

# Farben für bessere Lesbarkeit
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funktion zum Anzeigen von Dateien mit Größe
show_files() {
    local pattern="$1"
    local description="$2"
    echo -e "\n${BLUE}📁 $description:${NC}"
    if ls $pattern 1> /dev/null 2>&1; then
        ls -lah $pattern
    else
        echo "Keine Dateien gefunden."
    fi
}

# Funktion zum Überprüfen von Referenzen
check_references() {
    local file="$1"
    local search_pattern="$2"
    local count=$(grep -r "$search_pattern" . --exclude-dir=.git --exclude-dir=node_modules 2>/dev/null | wc -l)
    echo "$count"
}

echo -e "\n${YELLOW}📋 Analyse der Projektstruktur:${NC}"

# 1. Docker-Compose-Dateien analysieren
echo -e "\n${YELLOW}🐳 Docker-Compose-Dateien:${NC}"
show_files "docker-compose*.yml" "Root-Level Docker-Compose-Dateien"
show_files "backend/docker-compose*.yml" "Backend Docker-Compose-Dateien"

# 2. Dockerfiles analysieren
echo -e "\n${YELLOW}📦 Dockerfiles:${NC}"
show_files "Dockerfile*" "Root-Level Dockerfiles"
show_files "backend/Dockerfile*" "Backend Dockerfiles"

# 3. Deployment-Skripte
echo -e "\n${YELLOW}🚀 Deployment-Skripte:${NC}"
show_files "deploy-*.sh" "Deployment-Skripte"

# 4. Lock-Dateien
echo -e "\n${YELLOW}🔒 Lock-Dateien:${NC}"
show_files "package-lock.json" "NPM Lock-Datei"
show_files "pnpm-lock.yaml" "PNPM Lock-Datei"

# 5. Environment-Dateien
echo -e "\n${YELLOW}⚙️ Environment-Dateien:${NC}"
show_files "env*.example" "Environment-Beispieldateien"

# 6. Build-Artefakte
echo -e "\n${YELLOW}🏗️ Build-Artefakte:${NC}"
show_files "tsconfig.tsbuildinfo" "TypeScript Build-Info"

echo -e "\n${GREEN}✅ Analyse abgeschlossen!${NC}"
echo -e "\n${YELLOW}💡 Empfehlungen für die Bereinigung:${NC}"

# Empfehlungen basierend auf der Analyse
echo -e "\n${RED}🗑️ Potentielle Löschkandidaten:${NC}"

# Prüfe, welche Docker-Compose-Dateien verwendet werden
echo -e "\n1. ${YELLOW}Docker-Compose-Dateien:${NC}"
echo "   - Überprüfe, ob du sowohl 'simple' als auch normale Versionen brauchst"
echo "   - 'frontend.only.yml' könnte veraltet sein, wenn du Full-Stack verwendest"

# Prüfe Package Manager
if [ -f "package-lock.json" ] && [ -f "pnpm-lock.yaml" ]; then
    echo -e "\n2. ${YELLOW}Package Manager:${NC}"
    echo "   - Du hast sowohl NPM (package-lock.json) als auch PNPM (pnpm-lock.yaml)"
    echo "   - Entscheide dich für einen Package Manager und lösche die andere Lock-Datei"
fi

# Prüfe Build-Artefakte
if [ -f "tsconfig.tsbuildinfo" ]; then
    echo -e "\n3. ${YELLOW}Build-Artefakte:${NC}"
    echo "   - tsconfig.tsbuildinfo kann gelöscht werden (wird beim nächsten Build neu erstellt)"
fi

echo -e "\n${GREEN}🎯 Nächste Schritte:${NC}"
echo "1. Überprüfe die Docker-Compose-Dateien und behalte nur die, die du wirklich brauchst"
echo "2. Entscheide dich für einen Package Manager (NPM oder PNPM)"
echo "3. Lösche veraltete Deployment-Skripte"
echo "4. Überprüfe, ob alle Environment-Dateien noch benötigt werden"

echo -e "\n${BLUE}💡 Tipp: Verwende 'git status' um zu sehen, welche Dateien noch nicht committed sind${NC}" 