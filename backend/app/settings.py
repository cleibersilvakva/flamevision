from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    api_port: int = 8081
    default_timezone: str = "America/Sao_Paulo"
    sim_mode: bool = True  # simulador para dev
    sim_furnace_id: str = "CMC2"
    log_level: str = "INFO"

    class Config:
        env_prefix = ""
        env_file = ".env"
        extra = "ignore"

settings = Settings()
