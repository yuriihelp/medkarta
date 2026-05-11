from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./puls.db"  # local default; set DATABASE_URL=postgresql://... in .env for prod
    redis_url: str = "redis://localhost:6379"
    secret_key: str = "changeme-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080  # 7 days

    gigachat_api_key: str = ""
    yandexgpt_api_key: str = ""

    s3_bucket: str = "puls-documents"
    s3_endpoint: str = ""
    s3_access_key: str = ""
    s3_secret_key: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
