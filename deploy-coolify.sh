#!/bin/bash

# Coolify Deployment Script für eb-due
# Automatisiertes Deployment für die eb-due Anwendung

echo "🚀 Coolify Deployment für eb-due wird gestartet..."

# Prüfe ob Coolify CLI installiert ist
if ! command -v coolify &> /dev/null; then
    echo "❌ Coolify CLI ist nicht installiert. Bitte installieren Sie es zuerst."
    exit 1
fi

# Prüfe ob .env Datei existiert
if [ ! -f ".env" ]; then
    echo "❌ .env Datei nicht gefunden. Bitte erstellen Sie eine .env Datei basierend auf env.coolify.example"
    exit 1
fi

# Lade Umgebungsvariablen
source .env

# Prüfe erforderliche Variablen
required_vars=("COOLIFY_URL" "COOLIFY_TOKEN" "PROJECT_NAME")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Erforderliche Umgebungsvariable $var ist nicht gesetzt"
        exit 1
    fi
done

echo "✅ Umgebungsvariablen geladen"
echo "🌐 Coolify URL: $COOLIFY_URL"
echo "📦 Projekt: $PROJECT_NAME"

# Erstelle temporäre Konfigurationsdatei
cat > coolify-config.json << EOF
{
  "name": "$PROJECT_NAME",
  "type": "application",
  "repository": {
    "url": "$REPOSITORY_URL",
    "branch": "main"
  },
  "buildPack": "nixpacks",
  "port": 3001,
  "environment": {
    "NODE_ENV": "production",
    "PORT": "3001",
    "DATABASE_URL": "postgresql://eb-due:eb-due_secure_password_2024@postgres:5432/eb-due",
    "DB_USER": "eb-due",
    "DB_PASSWORD": "eb-due_secure_password_2024",
    "DB_HOST": "postgres",
    "DB_PORT": "5432",
    "DB_NAME": "eb-due",
    "JWT_SECRET": "$JWT_SECRET",
    "FRONTEND_URL": "https://eb-due.mirosens.com",
    "CORS_ORIGIN": "https://eb-due.mirosens.com,https://www.eb-due.mirosens.com",
    "OSRM_URL": "http://osrm:5000",
    "VALHALLA_URL": "http://valhalla:8002",
    "NOMINATIM_URL": "http://nominatim:8080",
    "REDIS_URL": "redis://redis:6379"
  },
  "domains": [
    "eb-due.mirosens.com",
    "www.eb-due.mirosens.com"
  ]
}
EOF

echo "📋 Konfiguration erstellt"

# Deploye Anwendung
echo "🚀 Starte Deployment..."
coolify deploy --config coolify-config.json

if [ $? -eq 0 ]; then
    echo "✅ Deployment erfolgreich!"
    echo ""
    echo "📊 Deployment Details:"
    echo "   Projekt: $PROJECT_NAME"
    echo "   Domain: eb-due.mirosens.com"
    echo "   Port: 3001"
    echo "   Environment: Production"
    echo ""
    echo "🔗 URLs:"
    echo "   Frontend: https://eb-due.mirosens.com"
    echo "   API: https://eb-due.mirosens.com/api"
    echo "   Health: https://eb-due.mirosens.com/health"
    echo ""
    echo "🗄️ Datenbank:"
    echo "   Name: eb-due-db"
    echo "   Host: postgres"
    echo "   Port: 5432"
    echo "   User: eb-due"
    echo ""
    echo "🌐 Domain: eb-due.mirosens.com"
    echo ""
    echo "✅ Deployment abgeschlossen!"
else
    echo "❌ Deployment fehlgeschlagen"
    exit 1
fi

# Cleanup
rm -f coolify-config.json

echo "🧹 Temporäre Dateien aufgeräumt"
echo "🎉 Deployment-Prozess abgeschlossen!" 