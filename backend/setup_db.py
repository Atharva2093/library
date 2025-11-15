#!/usr/bin/env python3
"""
Database setup script - creates initial migration and sets up database
"""
import os
import sys
import subprocess
from pathlib import Path

# Add the backend root to Python path
backend_root = Path(__file__).parent
sys.path.append(str(backend_root))

from app.core.config import settings
from app.db.init_db import check_db_connection
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def run_command(cmd, cwd=None):
    """Run a command and handle errors"""
    logger.info(f"Running: {' '.join(cmd)}")
    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True, cwd=cwd)
        if result.stdout:
            logger.info(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Command failed: {e}")
        if e.stdout:
            logger.error(f"STDOUT: {e.stdout}")
        if e.stderr:
            logger.error(f"STDERR: {e.stderr}")
        return False


def setup_database():
    """Complete database setup process"""
    logger.info("Starting database setup...")
    
    # Check database connection
    logger.info("Checking database connection...")
    if not check_db_connection():
        logger.error("Database connection failed. Please check your database configuration.")
        return False
    
    # Set working directory
    os.chdir(backend_root)
    
    # Create initial migration if no migrations exist
    versions_dir = backend_root / "alembic" / "versions"
    if not versions_dir.exists() or not any(versions_dir.glob("*.py")):
        logger.info("Creating initial migration...")
        if not run_command(["alembic", "revision", "--autogenerate", "-m", "Initial migration"]):
            logger.error("Failed to create initial migration")
            return False
    else:
        logger.info("Migrations already exist, skipping initial migration creation")
    
    # Run migrations
    logger.info("Running database migrations...")
    if not run_command(["alembic", "upgrade", "head"]):
        logger.error("Failed to run migrations")
        return False
    
    # Initialize sample data
    logger.info("Initializing sample data...")
    try:
        from app.db.init_db import create_superuser, create_sample_data
        create_superuser()
        create_sample_data()
        logger.info("Sample data created successfully")
    except Exception as e:
        logger.error(f"Failed to create sample data: {e}")
        return False
    
    logger.info("Database setup completed successfully!")
    return True


def reset_database():
    """Reset database by dropping and recreating all tables"""
    logger.warning("This will destroy all data in the database!")
    confirm = input("Are you sure you want to reset the database? (y/N): ")
    
    if confirm.lower() != 'y':
        logger.info("Database reset cancelled")
        return False
    
    logger.info("Resetting database...")
    
    try:
        from app.db.utils import reset_database
        reset_database()
        logger.info("Database reset completed")
        
        # Re-run setup
        return setup_database()
        
    except Exception as e:
        logger.error(f"Failed to reset database: {e}")
        return False


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Database setup and management")
    parser.add_argument(
        "--reset", 
        action="store_true", 
        help="Reset database (WARNING: destroys all data)"
    )
    
    args = parser.parse_args()
    
    if args.reset:
        success = reset_database()
    else:
        success = setup_database()
    
    if not success:
        sys.exit(1)


if __name__ == "__main__":
    main()