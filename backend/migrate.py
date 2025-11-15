#!/usr/bin/env python3
"""
Database migration management script
"""
import os
import sys
import subprocess
import argparse
from pathlib import Path

# Add the backend root to Python path
backend_root = Path(__file__).parent
sys.path.append(str(backend_root))

from app.core.config import settings


def run_command(cmd):
    """Run a command and handle errors"""
    print(f"Running: {' '.join(cmd)}")
    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error: {e}")
        if e.stdout:
            print(f"STDOUT: {e.stdout}")
        if e.stderr:
            print(f"STDERR: {e.stderr}")
        return False


def init_alembic():
    """Initialize Alembic (already done, but kept for reference)"""
    print("Alembic is already initialized in this project.")
    return True


def create_migration(message):
    """Create a new migration"""
    if not message:
        message = input("Enter migration message: ")
    
    cmd = ["alembic", "revision", "--autogenerate", "-m", message]
    return run_command(cmd)


def upgrade_database(revision="head"):
    """Upgrade database to specified revision"""
    cmd = ["alembic", "upgrade", revision]
    return run_command(cmd)


def downgrade_database(revision):
    """Downgrade database to specified revision"""
    cmd = ["alembic", "downgrade", revision]
    return run_command(cmd)


def show_history():
    """Show migration history"""
    cmd = ["alembic", "history", "--verbose"]
    return run_command(cmd)


def show_current():
    """Show current migration"""
    cmd = ["alembic", "current"]
    return run_command(cmd)


def show_heads():
    """Show head migrations"""
    cmd = ["alembic", "heads"]
    return run_command(cmd)


def stamp_database(revision):
    """Stamp database with specified revision (without running migrations)"""
    cmd = ["alembic", "stamp", revision]
    return run_command(cmd)


def main():
    parser = argparse.ArgumentParser(description="Database migration management")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Create migration
    create_parser = subparsers.add_parser("create", help="Create a new migration")
    create_parser.add_argument("-m", "--message", help="Migration message")

    # Upgrade
    upgrade_parser = subparsers.add_parser("upgrade", help="Upgrade database")
    upgrade_parser.add_argument("revision", nargs="?", default="head", help="Target revision (default: head)")

    # Downgrade
    downgrade_parser = subparsers.add_parser("downgrade", help="Downgrade database")
    downgrade_parser.add_argument("revision", help="Target revision")

    # History
    subparsers.add_parser("history", help="Show migration history")

    # Current
    subparsers.add_parser("current", help="Show current migration")

    # Heads
    subparsers.add_parser("heads", help="Show head migrations")

    # Stamp
    stamp_parser = subparsers.add_parser("stamp", help="Stamp database with revision")
    stamp_parser.add_argument("revision", help="Revision to stamp")

    # Initialize (kept for reference)
    subparsers.add_parser("init", help="Initialize Alembic (already done)")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return

    # Set working directory to backend
    os.chdir(backend_root)

    # Execute command
    if args.command == "create":
        success = create_migration(args.message)
    elif args.command == "upgrade":
        success = upgrade_database(args.revision)
    elif args.command == "downgrade":
        success = downgrade_database(args.revision)
    elif args.command == "history":
        success = show_history()
    elif args.command == "current":
        success = show_current()
    elif args.command == "heads":
        success = show_heads()
    elif args.command == "stamp":
        success = stamp_database(args.revision)
    elif args.command == "init":
        success = init_alembic()
    else:
        print(f"Unknown command: {args.command}")
        success = False

    if not success:
        sys.exit(1)


if __name__ == "__main__":
    main()