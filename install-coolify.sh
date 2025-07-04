#!/bin/bash

# Coolify Installation Script für Revierkompass
# Ausführen als root auf deinem Server

set -e

echo "🚀 Coolify Installation für Revierkompass wird gestartet..."

# 1. System aktualisieren
echo "📦 System wird aktualisiert..."
apt update && apt upgrade -y

# 2. Notwendige Pakete installieren
echo "🔧 Notwendige Pakete werden installiert..."
apt install -y curl wget git jq openssl ufw

# 3. Firewall konfigurieren
echo "🔥 Firewall wird konfiguriert..."
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 8000/tcp  # Coolify Admin Interface
ufw allow 3001/tcp  # Backend API
ufw --force enable

# 4. Coolify installieren
echo "⚡ Coolify wird installiert..."
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash

# 5. Installation Status prüfen
echo "✅ Installation abgeschlossen!"
echo ""
echo "🌐 Coolify ist verfügbar unter: http://$(hostname -I | awk '{print $1}'):8000"
echo "🔑 Erstelle sofort dein Admin-Konto!"
echo ""
echo "📋 Nächste Schritte:"
echo "1. Öffne http://$(hostname -I | awk '{print $1}'):8000"
echo "2. Erstelle dein Admin-Konto"
echo "3. Konfiguriere deine Domain: revierkompass.mirosens.com"
echo "4. Deploye das Backend"
echo ""
echo "💡 Tipp: Nutze 'docker ps' um zu prüfen ob Coolify läuft" 