#!/bin/bash

echo "🔍 Suche nach unbenutzten Dateien..."
echo "===================================="

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Temporäre Datei für Ergebnisse
TEMP_FILE="/tmp/unused_files_$$.txt"

# Funktion zum Überprüfen, ob eine Datei referenziert wird
check_file_usage() {
    local file="$1"
    local filename=$(basename "$file")
    local count=$(grep -r "$filename" . --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=build 2>/dev/null | wc -l)
    echo "$count"
}

# Funktion zum Überprüfen von Import-Referenzen
check_import_usage() {
    local file="$1"
    local filename=$(basename "$file" | sed 's/\.[^.]*$//')
    local count=$(grep -r "import.*$filename\|from.*$filename" . --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=build 2>/dev/null | wc -l)
    echo "$count"
}

echo -e "\n${YELLOW}📁 Suche nach unbenutzten TypeScript/JavaScript-Dateien:${NC}"

# Suche nach .ts und .tsx Dateien
find src -name "*.ts" -o -name "*.tsx" | while read file; do
    if [ "$file" != "src/main.tsx" ] && [ "$file" != "src/App.tsx" ]; then
        usage_count=$(check_import_usage "$file")
        if [ "$usage_count" -eq 0 ]; then
            echo "UNUSED: $file"
        fi
    fi
done

echo -e "\n${YELLOW}📁 Suche nach unbenutzten CSS-Dateien:${NC}"

# Suche nach .css Dateien
find src -name "*.css" | while read file; do
    if [ "$file" != "src/index.css" ] && [ "$file" != "src/App.css" ]; then
        usage_count=$(check_file_usage "$file")
        if [ "$usage_count" -eq 0 ]; then
            echo "UNUSED: $file"
        fi
    fi
done

echo -e "\n${YELLOW}📁 Suche nach unbenutzten Komponenten:${NC}"

# Suche nach React-Komponenten
find src/components -name "*.tsx" -o -name "*.ts" 2>/dev/null | while read file; do
    component_name=$(basename "$file" | sed 's/\.[^.]*$//')
    usage_count=$(grep -r "$component_name" . --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=build 2>/dev/null | wc -l)
    if [ "$usage_count" -le 1 ]; then
        echo "POTENTIALLY_UNUSED: $file (nur $usage_count Referenzen)"
    fi
done

echo -e "\n${YELLOW}📁 Suche nach unbenutzten Hooks:${NC}"

# Suche nach Custom Hooks
find src/hooks -name "*.ts" -o -name "*.tsx" 2>/dev/null | while read file; do
    hook_name=$(basename "$file" | sed 's/\.[^.]*$//')
    usage_count=$(grep -r "$hook_name" . --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=build 2>/dev/null | wc -l)
    if [ "$usage_count" -le 1 ]; then
        echo "POTENTIALLY_UNUSED: $file (nur $usage_count Referenzen)"
    fi
done

echo -e "\n${YELLOW}📁 Suche nach unbenutzten Services:${NC}"

# Suche nach Services
find src/services -name "*.ts" -o -name "*.tsx" 2>/dev/null | while read file; do
    service_name=$(basename "$file" | sed 's/\.[^.]*$//')
    usage_count=$(grep -r "$service_name" . --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=build 2>/dev/null | wc -l)
    if [ "$usage_count" -le 1 ]; then
        echo "POTENTIALLY_UNUSED: $file (nur $usage_count Referenzen)"
    fi
done

echo -e "\n${YELLOW}📁 Suche nach unbenutzten Utilities:${NC}"

# Suche nach Utility-Funktionen
find src/lib -name "*.ts" -o -name "*.tsx" 2>/dev/null | while read file; do
    util_name=$(basename "$file" | sed 's/\.[^.]*$//')
    usage_count=$(grep -r "$util_name" . --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=build 2>/dev/null | wc -l)
    if [ "$usage_count" -le 1 ]; then
        echo "POTENTIALLY_UNUSED: $file (nur $usage_count Referenzen)"
    fi
done

echo -e "\n${GREEN}✅ Suche abgeschlossen!${NC}"
echo -e "\n${BLUE}💡 Hinweise:${NC}"
echo "- 'UNUSED' bedeutet, dass die Datei wahrscheinlich nicht verwendet wird"
echo "- 'POTENTIALLY_UNUSED' bedeutet, dass die Datei nur wenige Referenzen hat"
echo "- Überprüfe die Ergebnisse manuell, bevor du Dateien löschst"
echo "- Einige Dateien könnten dynamisch importiert werden" 