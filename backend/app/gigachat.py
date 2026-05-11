import httpx
import uuid
import time
from typing import Optional

SYSTEM_PROMPT = """Ты — медицинский ИИ-ассистент приложения ПУЛЬС (единая медицинская книжка).
Твои задачи:
- Объяснять результаты анализов простым языком
- Расшифровывать медицинские термины и аббревиатуры
- Давать общую информацию о заболеваниях, симптомах, лекарствах
- Помогать понять заключения врачей

Правила:
- Всегда напоминай, что не заменяешь врача и не ставишь диагнозы
- Отвечай на русском языке, кратко и понятно
- Если вопрос не связан с медициной — вежливо верни к медицинской теме
- При отклонениях в анализах рекомендуй обратиться к конкретному специалисту"""


class GigaChatClient:
    AUTH_URL = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth"
    API_URL = "https://gigachat.devices.sberbank.ru/api/v1/chat/completions"

    def __init__(self, auth_key: str):
        self.auth_key = auth_key
        self._token: Optional[str] = None
        self._token_expires: float = 0

    async def _refresh_token(self) -> None:
        async with httpx.AsyncClient(verify=False) as client:
            resp = await client.post(
                self.AUTH_URL,
                headers={
                    "Authorization": f"Basic {self.auth_key}",
                    "Content-Type": "application/x-www-form-urlencoded",
                    "RqUID": str(uuid.uuid4()),
                    "Accept": "application/json",
                },
                data={"scope": "GIGACHAT_API_PERS"},
                timeout=15.0,
            )
            resp.raise_for_status()
            data = resp.json()
            self._token = data["access_token"]
            self._token_expires = data["expires_at"] / 1000 - 60  # 1 min buffer

    async def chat(self, user_message: str, context: str = "") -> str:
        if not self._token or time.time() > self._token_expires:
            await self._refresh_token()

        system = SYSTEM_PROMPT
        if context:
            system += f"\n\nКонтекст из медкарты пациента:\n{context}"

        async with httpx.AsyncClient(verify=False, timeout=30.0) as client:
            resp = await client.post(
                self.API_URL,
                headers={
                    "Authorization": f"Bearer {self._token}",
                    "Accept": "application/json",
                },
                json={
                    "model": "GigaChat",
                    "messages": [
                        {"role": "system", "content": system},
                        {"role": "user", "content": user_message},
                    ],
                    "stream": False,
                    "max_tokens": 1024,
                    "temperature": 0.7,
                },
            )
            resp.raise_for_status()
            return resp.json()["choices"][0]["message"]["content"]


# Singleton — created once, reuses token across requests
_client: Optional[GigaChatClient] = None


def get_gigachat(auth_key: str) -> GigaChatClient:
    global _client
    if _client is None:
        _client = GigaChatClient(auth_key)
    return _client
