#!/usr/bin/env python3
"""
Initialize the application - create database tables and initial data
"""
import logging
import sys
from app.db.init_db import init_db
from app.core.config import settings

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def main():
    """Initialize the application"""
    try:
        logger.info("Starting application initialization...")
        logger.info(f"Environment: {'Development' if settings.DEBUG else 'Production'}")
        logger.info(f"Database: {settings.MYSQL_SERVER}:{settings.MYSQL_PORT}/{settings.MYSQL_DB}")
        
        # Initialize database
        init_db()
        
        logger.info("Application initialization completed successfully!")
        logger.info("You can now start the server with: python dev_server.py")
        
    except Exception as e:
        logger.error(f"Application initialization failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()