"""
Database migration utilities
"""
from alembic import command
from alembic.config import Config
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


class MigrationManager:
    """Class to manage database migrations programmatically"""
    
    def __init__(self):
        self.backend_root = Path(__file__).parent.parent
        self.alembic_cfg = Config(str(self.backend_root / "alembic.ini"))
    
    def create_migration(self, message: str, autogenerate: bool = True):
        """Create a new migration"""
        try:
            if autogenerate:
                command.revision(self.alembic_cfg, message=message, autogenerate=True)
            else:
                command.revision(self.alembic_cfg, message=message)
            logger.info(f"Created migration: {message}")
            return True
        except Exception as e:
            logger.error(f"Failed to create migration: {e}")
            return False
    
    def upgrade(self, revision: str = "head"):
        """Upgrade database to specified revision"""
        try:
            command.upgrade(self.alembic_cfg, revision)
            logger.info(f"Upgraded to revision: {revision}")
            return True
        except Exception as e:
            logger.error(f"Failed to upgrade: {e}")
            return False
    
    def downgrade(self, revision: str):
        """Downgrade database to specified revision"""
        try:
            command.downgrade(self.alembic_cfg, revision)
            logger.info(f"Downgraded to revision: {revision}")
            return True
        except Exception as e:
            logger.error(f"Failed to downgrade: {e}")
            return False
    
    def current_revision(self):
        """Get current database revision"""
        try:
            return command.current(self.alembic_cfg)
        except Exception as e:
            logger.error(f"Failed to get current revision: {e}")
            return None
    
    def history(self):
        """Get migration history"""
        try:
            return command.history(self.alembic_cfg)
        except Exception as e:
            logger.error(f"Failed to get history: {e}")
            return None
    
    def stamp(self, revision: str):
        """Stamp database with specified revision"""
        try:
            command.stamp(self.alembic_cfg, revision)
            logger.info(f"Stamped with revision: {revision}")
            return True
        except Exception as e:
            logger.error(f"Failed to stamp: {e}")
            return False


# Global instance
migration_manager = MigrationManager()