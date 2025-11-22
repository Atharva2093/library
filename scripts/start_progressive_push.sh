#!/bin/bash
# Auto Push Shell Script for Unix/Linux/macOS - Every 3 Minutes
# Pushes 5 files every 3 minutes

echo "⚡ Auto-Push Service (Every 3 Minutes)"
echo "====================================="
echo ""
echo "📋 Configuration:"
echo "  - Files per push: 5"
echo "  - Push interval: Every 3 minutes"  
echo "  - Repository: $(pwd)"
echo ""
echo "🎯 Schedule: 3min → 3min → 3min → ..."
echo ""
echo "Press Ctrl+C to stop the service"
echo ""

# Navigate to the project root
cd "$(dirname "$0")/.."

# Run the Python progressive auto-push script
echo "Starting Python script..."
python3 scripts/progressive_auto_push.py