#!/usr/bin/env python3
"""
Progressive Auto Push Script
Pushes 5 files to GitHub at increasing intervals: 10, 11, 12, 13, 14... minutes
"""
import os
import subprocess
import time
import logging
from datetime import datetime, timedelta
from pathlib import Path

# Setup logging with UTF-8 encoding for Windows compatibility
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('progressive_auto_push.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class ProgressiveAutoPush:
    def __init__(self, repo_path: str, start_interval: int = 3, files_per_push: int = 5):
        self.repo_path = Path(repo_path)
        self.current_interval = start_interval
        self.files_per_push = files_per_push
        self.push_count = 0
        self.fixed_interval = True  # Use fixed interval instead of progressive
        
    def run_git_command(self, command: list) -> tuple[bool, str]:
        """Run a git command and return success status and output"""
        try:
            result = subprocess.run(
                command,
                cwd=self.repo_path,
                capture_output=True,
                text=True,
                check=True
            )
            return True, result.stdout
        except subprocess.CalledProcessError as e:
            logger.error(f"Git command failed: {' '.join(command)}")
            logger.error(f"Error: {e.stderr}")
            return False, e.stderr
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            return False, str(e)
    
    def get_changed_files(self) -> tuple[list[str], list[str]]:
        """Get list of changed and untracked files"""
        # Get modified files
        success, output = self.run_git_command(['git', 'status', '--porcelain'])
        if not success:
            return [], []
        
        modified_files = []
        untracked_files = []
        
        for line in output.strip().split('\n'):
            if line.strip():
                status = line[:2]
                filename = line[3:].strip()
                
                if status.startswith('??'):  # Untracked files
                    untracked_files.append(filename)
                elif status.strip():  # Modified files
                    modified_files.append(filename)
        
        return modified_files, untracked_files
    
    def select_files_to_push(self, modified_files: list[str], untracked_files: list[str]) -> list[str]:
        """Select up to 5 files to push, prioritizing important files"""
        all_files = modified_files + untracked_files
        
        if not all_files:
            return []
        
        # Priority order for file selection
        priority_patterns = [
            # Documentation and reports (highest priority)
            lambda f: f.endswith('.md') and ('report' in f.lower() or 'readme' in f.lower()),
            # Configuration files
            lambda f: f.endswith(('.json', '.yml', '.yaml', '.toml', '.ini', '.conf')),
            # Python backend files
            lambda f: f.endswith('.py') and 'backend' in f,
            # Frontend React/TypeScript files
            lambda f: f.endswith(('.tsx', '.ts', '.jsx', '.js')) and 'frontend' in f,
            # Scripts and automation
            lambda f: f.endswith(('.sh', '.bat', '.ps1')) or 'script' in f.lower(),
            # Environment and Docker files
            lambda f: f.startswith('.env') or f.startswith('Dockerfile') or 'docker-compose' in f,
            # Other important files
            lambda f: f.endswith(('.css', '.html', '.xml')),
            # Any remaining files
            lambda f: True
        ]
        
        selected_files = []
        remaining_files = all_files.copy()
        
        # Select files based on priority
        for priority_func in priority_patterns:
            if len(selected_files) >= self.files_per_push:
                break
                
            priority_files = [f for f in remaining_files if priority_func(f)]
            needed = self.files_per_push - len(selected_files)
            
            if priority_files:
                selected_files.extend(priority_files[:needed])
                remaining_files = [f for f in remaining_files if f not in selected_files]
        
        return selected_files[:self.files_per_push]
    
    def push_files(self) -> bool:
        """Push selected files to GitHub"""
        self.push_count += 1
        logger.info(f"Push #{self.push_count} - Checking for files to push...")
        
        # Get changed files
        modified_files, untracked_files = self.get_changed_files()
        
        if not modified_files and not untracked_files:
            logger.info("No changes detected, skipping push")
            return True
        
        # Select files to push
        files_to_push = self.select_files_to_push(modified_files, untracked_files)
        
        if not files_to_push:
            logger.info("No suitable files found for pushing")
            return True
        
        logger.info(f"Selected {len(files_to_push)} files to push: {files_to_push}")
        
        # Add files to staging
        success, _ = self.run_git_command(['git', 'add'] + files_to_push)
        if not success:
            return False
        
        # Check if there's anything to commit after adding
        success, output = self.run_git_command(['git', 'diff', '--cached', '--name-only'])
        if not success or not output.strip():
            logger.info("No staged changes to commit")
            return True
        
        # Create descriptive commit message
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        file_types = self.get_file_types(files_to_push)
        commit_message = f"Auto-push #{self.push_count}: {timestamp}\n\n"
        commit_message += f"Files ({len(files_to_push)}): {file_types}\n"
        commit_message += f"Next push in {self.current_interval} minutes"
        
        # Commit changes
        success, _ = self.run_git_command(['git', 'commit', '-m', commit_message])
        if not success:
            return False
        
        # Push to remote
        success, output = self.run_git_command(['git', 'push', 'origin', 'master'])
        if not success:
            # Try 'main' branch if 'master' fails
            success, output = self.run_git_command(['git', 'push', 'origin', 'main'])
        
        if success:
            logger.info(f"Successfully pushed {len(files_to_push)} files to GitHub")
            logger.info(f"Files pushed: {', '.join(files_to_push)}")
        else:
            logger.error("Failed to push to GitHub")
        
        return success
    
    def get_file_types(self, files: list[str]) -> str:
        """Get a summary of file types being pushed"""
        extensions = {}
        for file in files:
            ext = Path(file).suffix.lower() or 'no-ext'
            extensions[ext] = extensions.get(ext, 0) + 1
        
        type_summary = []
        for ext, count in sorted(extensions.items()):
            if count == 1:
                type_summary.append(ext)
            else:
                type_summary.append(f"{count}x{ext}")
        
        return ", ".join(type_summary)
    
    def run_progressive_push(self):
        """Run the auto-push process with fixed or progressive intervals"""
        if self.fixed_interval:
            logger.info("Starting Fixed-Interval Auto-Push Service")
            logger.info(f"Push interval: Every {self.current_interval} minutes")
        else:
            logger.info("Starting Progressive Auto-Push Service")
            logger.info("Interval increases by 1 minute after each push")
            
        logger.info(f"Repository: {self.repo_path}")
        logger.info(f"Files per push: {self.files_per_push}")
        logger.info(f"Starting interval: {self.current_interval} minutes")
        logger.info("Press Ctrl+C to stop")
        
        while True:
            try:
                # Perform the push
                next_push_time = datetime.now() + timedelta(minutes=self.current_interval)
                
                logger.info(f"Next push scheduled for {next_push_time.strftime('%H:%M:%S')} ({self.current_interval} minutes)")
                
                # Wait for the current interval
                time.sleep(self.current_interval * 60)
                
                # Push files
                self.push_files()
                
                # Increase interval only if not using fixed interval
                if not self.fixed_interval:
                    self.current_interval += 1
                    logger.info(f"Next interval will be {self.current_interval} minutes")
                
            except KeyboardInterrupt:
                logger.info("Auto-Push service stopped by user")
                logger.info(f"Total pushes completed: {self.push_count}")
                break
            except Exception as e:
                logger.error(f"Unexpected error: {str(e)}")
                logger.info("Waiting 30 seconds before retry...")
                time.sleep(30)

def main():
    # Get the repository root
    script_dir = Path(__file__).parent
    repo_path = script_dir.parent
    
    # Initialize and run the auto-push service with 3-minute fixed intervals
    auto_pusher = ProgressiveAutoPush(
        repo_path=repo_path,
        start_interval=3,   # Push every 3 minutes
        files_per_push=5    # Push 5 files each time
    )
    auto_pusher.run_progressive_push()

if __name__ == "__main__":
    main()