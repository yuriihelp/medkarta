#!/bin/bash
# Deploy / update ПУЛЬС on the Selectel server
# Run from /opt/puls on the server:
#   bash deploy/deploy.sh
set -e

APP_DIR=/opt/puls
cd "$APP_DIR"

echo "=== ПУЛЬС — Деплой ==="

# --- Check .env ---
if [ ! -f .env ]; then
  echo "❌ Файл .env не найден!"
  echo "   cp .env.prod.example .env && nano .env"
  exit 1
fi

# --- Pull latest code ---
echo "→ Обновляем код из git..."
git pull origin claude/design-mvp-structure-NltqD

# --- Build frontend (Expo web static export) ---
echo "→ Собираем фронтенд (Expo web)..."
cd frontend
npm install --silent
npx expo export --platform web --output-dir dist
cd ..

# --- Build & restart backend ---
echo "→ Пересобираем и запускаем контейнеры..."
docker compose -f docker-compose.prod.yml build backend
docker compose -f docker-compose.prod.yml up -d

# --- Health check ---
echo "→ Проверяем статус..."
sleep 5
if curl -sf http://localhost/api/health > /dev/null; then
  echo "✅ Приложение доступно: http://195.225.111.248"
else
  echo "⚠️  Health check не прошёл, смотрите логи:"
  echo "   docker compose -f docker-compose.prod.yml logs --tail=30"
fi

echo ""
echo "=== Деплой завершён ==="
