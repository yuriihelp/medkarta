#!/bin/bash
# Deploy / update ПУЛЬС on the server
# Run from /opt/medkarta:
#   bash deploy/deploy.sh
set -e

APP_DIR=/opt/medkarta
cd "$APP_DIR"

echo "=== ПУЛЬС — Деплой ==="

# --- Check Docker ---
if ! command -v docker &> /dev/null; then
  echo "❌ Docker не установлен. Устанавливаем..."
  curl -fsSL https://get.docker.com | sh
  echo "✅ Docker установлен"
fi

# --- Check .env ---
if [ ! -f .env ]; then
  echo "❌ Файл .env не найден!"
  echo "   Создайте его:"
  echo "   cp .env.example .env && nano .env"
  exit 1
fi

# --- Pull latest code ---
echo "→ Обновляем код из git..."
git pull origin claude/design-mvp-structure-NltqD

# --- Build frontend (Expo web static export) ---
echo "→ Собираем фронтенд (Expo web)..."
cd frontend
npm install --silent

# Unset EXPO_PUBLIC_API_URL so the build uses relative /api paths (nginx proxy)
unset EXPO_PUBLIC_API_URL
npx expo export --platform web --output-dir dist
cd ..

# --- Build & restart containers ---
echo "→ Пересобираем и запускаем контейнеры..."
docker compose -f docker-compose.prod.yml build backend
docker compose -f docker-compose.prod.yml up -d

# --- Health check ---
echo "→ Ждём запуска..."
sleep 6
if curl -sf http://localhost/api/health > /dev/null; then
  echo "✅ Готово! Приложение доступно: http://$(curl -s ifconfig.me 2>/dev/null || echo 'SERVER_IP')"
else
  echo "⚠️  Health check не прошёл. Логи:"
  docker compose -f docker-compose.prod.yml logs --tail=40
fi

echo ""
echo "=== Деплой завершён ==="
