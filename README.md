# Entfernungsberechnung Dienststellen und -einrichtungen (eb-due)

Eine moderne Web-Anwendung zur Verwaltung und Navigation von Dienststellen und Einrichtungen in Baden-Württemberg.

## 🚀 Schnellstart

**1. Repository klonen**
```bash
git clone <repo-url>
cd eb-due
```

**2. Abhängigkeiten installieren**
```bash
pnpm install
```

**3. Umgebungsvariablen konfigurieren**
```bash
cp env.example .env
# .env-Datei bei Bedarf anpassen
```

**4. Anwendung starten**
```bash
pnpm run dev
```

**5. Stationen importieren**
Nach dem Start der Anwendung:
- Admin-Bereich öffnen
- Tab "Import" wählen
- "Alle Stationen importieren" klicken
- Stationen aus `/src/data` werden in die Datenbank importiert

## 🗺️ Offline-Karten (Optional)

Für vollständige Offline-Funktionalität mit echten Straßenrouten:

```bash
cd backend
docker-compose -f docker-compose-tiles.yml up -d
```

Dies startet:
- **PostgreSQL** mit PostGIS (Port 5432)
- **TileServer GL** für Offline-Karten (Port 8080)
- **OSRM** für Routing (Port 5000)
- **Valhalla** für erweiterte Routen (Port 8002)
- **Nominatim** für Offline-Geocoding (Port 8001)
- **Redis** für Caching (Port 6379)

## 🔧 Technologien

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Node.js, Express, Prisma
- **Datenbank**: SQLite (Entwicklung) / PostgreSQL mit PostGIS (Produktion)
- **Routing**: Echte Straßenrouten (OSRM, Valhalla)
- **Karten**: MapLibre GL mit Offline-Support
- **Docker**: Vollständige Containerisierung verfügbar

## 📊 Features

- ✅ Echte Straßenrouten statt Luftlinien
- ✅ Interaktive Karten mit MapLibre GL
- ✅ Admin-Bereich für Stationenverwaltung
- ✅ Custom-Adressen mit Koordinaten
- ✅ Responsive Design
- ✅ Offline-Karten über Docker
- ✅ JWT-Authentifizierung

## 🔑 Admin-Zugang

Nach dem Start verfügbar:
```
Email: admin@eb-due.de
Passwort: admin123
```

## 🌐 Wichtige URLs & Ports

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Admin-Bereich**: http://localhost:5173/admin
- **TileServer**: http://localhost:8080 (Docker)
- **OSRM Routing**: http://localhost:5000 (Docker)

## 📝 Lizenz

Proprietär - Alle Rechte vorbehalten
