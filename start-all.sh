#!/bin/bash

set -e

cd "$(dirname "$0")"

# Backend setup
cd backend
[ ! -d "node_modules" ] && npm install

npx prisma generate
npx prisma db push

# Check mit Node/Prisma
STATION_COUNT=$(node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.policeStation.count()
  .then(count => { console.log(count); process.exit(0); })
  .catch(() => { console.log(0); process.exit(0); });
")

echo "📊 Station Count: $STATION_COUNT"

[ "$STATION_COUNT" = "0" ] && npx tsx src/scripts/seed.ts

# Backend starten
nohup node simple-server.js > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "🚀 Backend läuft (PID $BACKEND_PID)"
cd ..

# Frontend starten - NICHT ./start-all.sh aufrufen!
pnpm vite