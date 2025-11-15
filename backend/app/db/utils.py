from typing import Generator
from sqlalchemy.orm import Session
from app.database import SessionLocal


def get_db() -> Generator[Session, None, None]:
    """
    Dependency function that yields database sessions.
    This is used by FastAPI to inject database sessions into route handlers.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_db_session() -> Session:
    """
    Get a database session for use outside of FastAPI dependency injection.
    Remember to close the session when done.
    """
    return SessionLocal()


class DatabaseManager:
    """
    Context manager for database sessions.
    Usage:
        with DatabaseManager() as db:
            # use db session
            pass
    """
    
    def __enter__(self) -> Session:
        self.db = SessionLocal()
        return self.db
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            self.db.rollback()
        self.db.close()


def reset_database():
    """
    WARNING: This will drop all tables and recreate them.
    Only use in development!
    """
    from app.database import Base, engine
    import logging
    
    logger = logging.getLogger(__name__)
    logger.warning("Resetting database - all data will be lost!")
    
    # Drop all tables
    Base.metadata.drop_all(bind=engine)
    
    # Recreate all tables
    Base.metadata.create_all(bind=engine)
    
    logger.info("Database reset completed")