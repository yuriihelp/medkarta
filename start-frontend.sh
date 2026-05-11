#!/bin/bash
set -e

cd "$(dirname "$0")/frontend"

if [ ! -d "node_modules" ]; then
  echo "→ Устанавливаем зависимости..."
  npm install
fi

echo "→ Запускаем Expo"
echo "   Web:     http://localhost:8081"
echo "   Mobile:  откройте Expo Go и отсканируйте QR"
echo ""
npx expo start --web
