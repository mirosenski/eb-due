#!/bin/bash

echo "🧹 Interaktive Projekt-Bereinigung"
echo "=================================="

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Funktion zum sicheren Löschen
safe_delete() {
    local file="$1"
    local description="$2"
    
    if [ -f "$file" ]; then
        echo -e "\n${YELLOW}🗑️ $description${NC}"
        echo -e "Datei: ${BLUE}$file${NC}"
        echo -e "Größe: $(ls -lh "$file" | awk '{print $5}')"
        
        read -p "Möchtest du diese Datei löschen? (j/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Jj]$ ]]; then
            rm "$file"
            echo -e "${GREEN}✅ $file wurde gelöscht${NC}"
        else
            echo -e "${BLUE}⏭️ $file wurde übersprungen${NC}"
        fi
    fi
}

# Funktion zum sicheren Löschen von Verzeichnissen
safe_delete_dir() {
    local dir="$1"
    local description="$2"
    
    if [ -d "$dir" ]; then
        echo -e "\n${YELLOW}🗑️ $description${NC}"
        echo -e "Verzeichnis: ${BLUE}$dir${NC}"
        echo -e "Inhalt: $(ls "$dir" | wc -l) Dateien"
        
        read -p "Möchtest du dieses Verzeichnis löschen? (j/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Jj]$ ]]; then
            rm -rf "$dir"
            echo -e "${GREEN}✅ $dir wurde gelöscht${NC}"
        else
            echo -e "${BLUE}⏭️ $dir wurde übersprungen${NC}"
        fi
    fi
}

echo -e "\n${GREEN}🎯 Bereinigungskategorien:${NC}"
echo "1. Build-Artefakte (sicher zu löschen)"
echo "2. Doppelte Docker-Compose-Dateien"
echo "3. Doppelte Dockerfiles"
echo "4. Package Manager Lock-Dateien"
echo "5. Veraltete Deployment-Skripte"
echo "6. Veraltete Environment-Dateien"

read -p "Welche Kategorie möchtest du zuerst bereinigen? (1-6): " category

case $category in
    1)
        echo -e "\n${YELLOW}🏗️ Build-Artefakte bereinigen:${NC}"
        safe_delete "tsconfig.tsbuildinfo" "TypeScript Build-Info (wird beim nächsten Build neu erstellt)"
        safe_delete "dist" "Build-Verzeichnis (wird beim nächsten Build neu erstellt)"
        safe_delete "build" "Build-Verzeichnis (wird beim nächsten Build neu erstellt)"
        safe_delete ".next" "Next.js Build-Verzeichnis"
        ;;
    2)
        echo -e "\n${YELLOW}🐳 Docker-Compose-Dateien bereinigen:${NC}"
        echo -e "${BLUE}Hinweis: Überprüfe, welche Versionen du wirklich brauchst${NC}"
        safe_delete "docker-compose.frontend-simple.yml" "Einfache Frontend Docker-Compose (falls du die normale Version verwendest)"
        safe_delete "docker-compose.coolify.simple.yml" "Einfache Coolify Docker-Compose (falls du die normale Version verwendest)"
        safe_delete "docker-compose.frontend.only.yml" "Nur Frontend Docker-Compose (falls du Full-Stack verwendest)"
        ;;
    3)
        echo -e "\n${YELLOW}📦 Dockerfiles bereinigen:${NC}"
        echo -e "${BLUE}Hinweis: Überprüfe, welche Dockerfiles du wirklich brauchst${NC}"
        safe_delete "backend/Dockerfile.coolify.simple" "Einfache Coolify Dockerfile (falls du die normale Version verwendest)"
        ;;
    4)
        echo -e "\n${YELLOW}🔒 Package Manager Lock-Dateien bereinigen:${NC}"
        echo -e "${BLUE}Hinweis: Entscheide dich für einen Package Manager${NC}"
        if [ -f "package-lock.json" ] && [ -f "pnpm-lock.yaml" ]; then
            echo -e "${YELLOW}Du hast sowohl NPM als auch PNPM Lock-Dateien${NC}"
            read -p "Welchen Package Manager möchtest du behalten? (npm/pnpm): " pm_choice
            if [[ $pm_choice == "npm" ]]; then
                safe_delete "pnpm-lock.yaml" "PNPM Lock-Datei (NPM wird beibehalten)"
            elif [[ $pm_choice == "pnpm" ]]; then
                safe_delete "package-lock.json" "NPM Lock-Datei (PNPM wird beibehalten)"
            fi
        fi
        ;;
    5)
        echo -e "\n${YELLOW}🚀 Deployment-Skripte bereinigen:${NC}"
        echo -e "${BLUE}Hinweis: Überprüfe, welche Deployment-Methoden du verwendest${NC}"
        safe_delete "deploy-vercel.sh" "Vercel Deployment-Skript (falls du es nicht verwendest)"
        safe_delete "deploy-coolify.sh" "Coolify Deployment-Skript (falls du es nicht verwendest)"
        ;;
    6)
        echo -e "\n${YELLOW}⚙️ Environment-Dateien bereinigen:${NC}"
        echo -e "${BLUE}Hinweis: Überprüfe, welche Environment-Dateien du brauchst${NC}"
        safe_delete "env.frontend.example" "Frontend Environment-Beispiel (falls du es nicht brauchst)"
        safe_delete "env.coolify.example" "Coolify Environment-Beispiel (falls du es nicht brauchst)"
        ;;
    *)
        echo -e "${RED}Ungültige Auswahl${NC}"
        exit 1
        ;;
esac

echo -e "\n${GREEN}✅ Bereinigung abgeschlossen!${NC}"
echo -e "\n${BLUE}💡 Tipps:${NC}"
echo "- Verwende 'git status' um zu sehen, welche Dateien geändert wurden"
echo "- Teste dein Projekt nach der Bereinigung"
echo "- Committe die Änderungen, wenn alles funktioniert" 