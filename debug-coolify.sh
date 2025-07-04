#!/bin/bash

echo "=== EB-Due Coolify Debug Script ==="
echo ""

echo "1. Container Status:"
echo "==================="
docker ps -a | grep eb-due
echo ""

echo "2. Laufende Container:"
echo "====================="
docker ps | grep eb-due
echo ""

echo "3. Frontend Container Logs (letzte 50 Zeilen):"
echo "============================================="
if docker ps | grep -q eb-due-frontend; then
    docker logs --tail 50 eb-due-frontend
else
    echo "Frontend Container läuft nicht!"
fi
echo ""

echo "4. Backend Container Logs (letzte 50 Zeilen):"
echo "============================================"
if docker ps | grep -q eb-due-backend; then
    docker logs --tail 50 eb-due-backend
else
    echo "Backend Container läuft nicht!"
fi
echo ""

echo "5. Netzwerk-Informationen:"
echo "========================="
docker network ls | grep -E "(eb-due|coolify)"
echo ""

echo "6. Frontend Container Details:"
echo "============================="
if docker ps | grep -q eb-due-frontend; then
    docker inspect eb-due-frontend | grep -A 10 -B 5 "NetworkMode\|PortBindings\|Health"
else
    echo "Frontend Container nicht gefunden!"
fi
echo ""

echo "7. Teste Frontend lokal (falls Container läuft):"
echo "==============================================="
if docker ps | grep -q eb-due-frontend; then
    echo "Versuche curl zu localhost:80..."
    docker exec eb-due-frontend wget -q -O- http://localhost:80/ | head -5
else
    echo "Frontend Container läuft nicht!"
fi
echo ""

echo "8. Coolify Netzwerk Test:"
echo "========================"
if docker network ls | grep -q coolify; then
    echo "Coolify Netzwerk gefunden"
    docker network inspect coolify | grep -A 5 -B 5 "Containers"
else
    echo "Coolify Netzwerk nicht gefunden!"
fi
echo ""

echo "Debug abgeschlossen!" 