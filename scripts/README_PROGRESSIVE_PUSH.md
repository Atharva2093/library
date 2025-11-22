# Progressive Auto-Push System

## Overview
Automatically pushes 5 files to GitHub at progressively increasing intervals: 10, 11, 12, 13, 14... minutes.

## Features
- **Progressive Timing**: Starts at 10 minutes, increases by 1 minute after each push
- **Smart File Selection**: Prioritizes important files (documentation, config, backend, frontend)
- **Comprehensive Logging**: All activities logged to `progressive_auto_push.log`
- **Cross-Platform**: Works on Windows, Linux, macOS
- **File Type Intelligence**: Selects diverse file types for each push

## Files
- `progressive_auto_push.py` - Main Python automation script
- `start_progressive_push.bat` - Windows batch launcher
- `start_progressive_push.ps1` - Windows PowerShell launcher
- `start_progressive_push.sh` - Unix/Linux/macOS launcher
- `ProgressiveAutoPushTask.xml` - Windows Task Scheduler configuration

## Quick Start

### Windows (Command Prompt)
```cmd
cd f:\projects\library
scripts\start_progressive_push.bat
```

### Windows (PowerShell)
```powershell
cd f:\projects\library
.\scripts\start_progressive_push.ps1
```

### Unix/Linux/macOS
```bash
cd /path/to/library
chmod +x scripts/start_progressive_push.sh
./scripts/start_progressive_push.sh
```

### Direct Python
```bash
cd f:\projects\library
python scripts\progressive_auto_push.py
```

## Schedule Example
```
Push #1: After 10 minutes → 5 files pushed
Push #2: After 11 minutes → 5 files pushed  
Push #3: After 12 minutes → 5 files pushed
Push #4: After 13 minutes → 5 files pushed
...and so on
```

## File Priority System
The script intelligently selects files in this order:
1. **Documentation** (*.md reports, README files)
2. **Configuration** (*.json, *.yml, *.yaml, *.conf)
3. **Backend** (Python files in backend/)
4. **Frontend** (TypeScript/React files in frontend/)
5. **Scripts** (*.sh, *.bat, *.ps1)
6. **Environment** (.env files, Dockerfile, docker-compose)
7. **Styling** (*.css, *.html)
8. **Other** (any remaining files)

## Configuration
Edit `progressive_auto_push.py` to customize:
```python
auto_pusher = ProgressiveAutoPush(
    repo_path=repo_path,
    start_interval=10,    # Starting minutes
    files_per_push=5      # Files per push
)
```

## Windows Task Scheduler Setup
```cmd
# Run as Administrator
schtasks /create /xml "scripts\ProgressiveAutoPushTask.xml" /tn "ProgressiveAutoPush"

# View task
schtasks /query /tn "ProgressiveAutoPush"

# Delete task
schtasks /delete /tn "ProgressiveAutoPush" /f
```

## Monitoring
- **Log File**: `progressive_auto_push.log` (in repository root)
- **Console Output**: Real-time status updates
- **Git History**: Each push creates descriptive commit messages

## Stopping the Service
- **Interactive**: Press `Ctrl+C` in the terminal
- **Task Scheduler**: Use Windows Task Scheduler GUI or schtasks command
- **Process**: Kill the Python process

## Example Log Output
```
2025-11-22 10:00:00 - INFO - 🚀 Starting Progressive Auto-Push Service
2025-11-22 10:00:00 - INFO - ⏰ Next push scheduled for 10:10:00 (10 minutes)
2025-11-22 10:10:00 - INFO - Push #1 - Selected 5 files: .md, .py, .tsx, .json, .yml
2025-11-22 10:10:00 - INFO - ✅ Successfully pushed 5 files to GitHub
2025-11-22 10:10:00 - INFO - 📈 Next interval will be 11 minutes
```

## Requirements
- Python 3.6+
- Git configured with push access
- Valid git remote origin configured
- Network connectivity for GitHub pushes