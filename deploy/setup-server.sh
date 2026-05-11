#!/bin/bash
# Run this ONCE on the Selectel server:
#   ssh root@195.225.111.248
#   curl -fsSL https://raw.githubusercontent.com/yuriihelp/medkarta/main/deploy/setup-server.sh | bash
set -e

echo "=== ПУЛЬС — Настройка сервера Ubuntu 24.04 ==="

# --- System update ---
apt-get update -qq && apt-get upgrade -y -qq

# --- Docker ---
if ! command -v docker &>/dev/null; then
  echo "→ Устанавливаем Docker..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
else
  echo "✓ Docker уже установлен"
fi

# --- Docker Compose plugin ---
if ! docker compose version &>/dev/null; then
  echo "→ Устанавливаем Docker Compose plugin..."
  apt-get install -y docker-compose-plugin
fi

# --- Git ---
apt-get install -y git curl unzip ufw

# --- Firewall ---
echo "→ Настраиваем UFW firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
echo "✓ Firewall настроен: открыты 22, 80, 443"

# --- App directory ---
APP_DIR=/opt/puls
mkdir -p "$APP_DIR"
echo "✓ Директория приложения: $APP_DIR"

# --- Swap (страховка для 8 GB RAM) ---
if [ ! -f /swapfile ]; then
  echo "→ Создаём swap 2G..."
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo ""
echo "=== Сервер готов ==="
echo ""
echo "Следующий шаг — задеплоить приложение:"
echo "  cd /opt/puls && bash deploy/deploy.sh"
echo ""
