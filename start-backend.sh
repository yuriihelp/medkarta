#!/bin/bash
set -e

cd "$(dirname "$0")/backend"

# Create venv if missing
if [ ! -d ".venv" ]; then
  echo "→ Создаём виртуальное окружение..."
  python3 -m venv .venv
fi

source .venv/bin/activate

echo "→ Устанавливаем зависимости..."
pip install -q -r requirements.txt

echo "→ Запускаем FastAPI на http://localhost:8000"
echo "   Docs: http://localhost:8000/docs"
echo ""
uvicorn main:app --reload --host 0.0.0.0 --port 8000
