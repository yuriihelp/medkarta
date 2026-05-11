#!/bin/bash
# First-time deploy: клонируем репо и настраиваем .env
# Запускать на сервере от root:
#   bash <(curl -fsSL https://raw.githubusercontent.com/yuriihelp/medkarta/claude/design-mvp-structure-NltqD/deploy/first-deploy.sh)
set -e

APP_DIR=/opt/puls
REPO="https://github.com/yuriihelp/medkarta.git"
BRANCH="claude/design-mvp-structure-NltqD"

echo "=== ПУЛЬС — Первый деплой ==="

# Clone
if [ -d "$APP_DIR/.git" ]; then
  echo "✓ Репозиторий уже клонирован, обновляем..."
  cd "$APP_DIR" && git fetch && git checkout $BRANCH && git pull
else
  echo "→ Клонируем репозиторий..."
  git clone -b "$BRANCH" "$REPO" "$APP_DIR"
fi

cd "$APP_DIR"

# .env
if [ ! -f .env ]; then
  cp .env.prod.example .env
  echo ""
  echo "⚠️  Заполните .env перед запуском:"
  echo "   nano /opt/puls/.env"
  echo ""
  echo "   Обязательно:"
  echo "   - POSTGRES_PASSWORD (любой сложный пароль)"
  echo "   - SECRET_KEY (python3 -c \"import secrets; print(secrets.token_hex(32))\")"
  echo ""
  echo "После заполнения запустите:"
  echo "   bash /opt/puls/deploy/deploy.sh"
else
  echo "✓ .env уже существует"
  bash deploy/deploy.sh
fi
