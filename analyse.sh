#!/bin/bash
# Analyse log files by level and service
# Usage: ./analyse.sh <LEVEL> <path-to-log-file>

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Call the Python script with all arguments
python3 "$SCRIPT_DIR/analyse.py" "$@"
