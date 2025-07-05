#!/bin/bash

# Skript zur Behebung von npm-Cache-Problemen
echo "🔧 Behebe npm-Cache-Probleme..."

# Wechsle zum Backend-Verzeichnis
cd backend

# Lösche npm-Cache
echo "🗑️  Lösche npm-Cache..."
npm cache clean --force

# Lösche node_modules und package-lock.json
echo "🗑️  Lösche node_modules und package-lock.json..."
rm -rf node_modules package-lock.json

# Setze npm-Konfiguration
echo "⚙️  Setze npm-Konfiguration..."
npm config set registry https://registry.npmjs.org/
npm config set fetch-retries 5
npm config set fetch-retry-mintimeout 20000
npm config set fetch-retry-maxtimeout 120000

# Installiere Abhängigkeiten neu
echo "📦 Installiere Abhängigkeiten neu..."
npm install --no-audit --no-fund

# Prüfe Installation
echo "✅ Prüfe Installation..."
npm list --depth=0

echo "🎉 npm-Cache-Problem behoben!" 