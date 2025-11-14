from typing import List, Optional

from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    ALLOWED_HOSTS: List[str] = ['*']
    PROJECT_NAME: str = 'Bookstore API'

    model_config = {
        'env_file': '.env',
        'env_file_encoding': 'utf-8',
    }

    @field_validator('ALLOWED_HOSTS', mode='before')
    @classmethod
    def assemble_allowed_hosts(cls, v: Optional[object]) -> List[str]:
        if v is None:
            return []
        if isinstance(v, str):
            v = v.strip()
            if not v:
                return []
            if v == '*':
                return ['*']
            return [host.strip() for host in v.split(',') if host.strip()]
        if isinstance(v, (list, tuple)):
            return list(v)
        return [str(v)]


settings = Settings()

