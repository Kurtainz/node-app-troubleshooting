#!/usr/bin/env python3
"""
Log analysis tool for Taskboard.
Analyzes log files and counts entries by service for a given log level.

Usage: python3 analyse.py <LEVEL> <path-to-log-file>
"""

import sys
from collections import defaultdict
from pathlib import Path


def parse_log_file(file_path, target_level):
    """
    Parse log file and count entries by service for the given level.
    
    Args:
        file_path: Path to the log file
        target_level: The log level to filter by (e.g., 'ERROR')
        
    Returns:
        Dictionary with service names as keys and counts as values
    """
    service_counts = defaultdict(int)
    
    try:
        with open(file_path, 'r') as f:
            for line in f:
                line = line.strip()
                
                # Ignore blank lines
                if not line:
                    continue
                
                # Parse log line: <timestamp> <service> <LEVEL> <message...>
                parts = line.split(maxsplit=3)
                
                # Must have at least timestamp, service, and level
                if len(parts) < 3:
                    continue
                
                timestamp, service, level = parts[0], parts[1], parts[2]
                
                # Match exact level (case-sensitive)
                if level == target_level:
                    service_counts[service] += 1
    
    except FileNotFoundError:
        print(f"Error: File not found: {file_path}", file=sys.stderr)
        sys.exit(1)
    except IOError as e:
        print(f"Error reading file: {e}", file=sys.stderr)
        sys.exit(1)
    
    return service_counts


def format_output(service_counts):
    """
    Format and sort output by count (descending), then by service name (ascending).
    
    Args:
        service_counts: Dictionary with service names and counts
        
    Returns:
        List of formatted output lines
    """
    if not service_counts:
        return []
    
    # Sort by count (descending), then by service name (ascending)
    sorted_services = sorted(
        service_counts.items(),
        key=lambda x: (-x[1], x[0])  # negative count for descending, service name for ascending
    )
    
    return [f"{service}: {count}" for service, count in sorted_services]


def main():
    if len(sys.argv) != 3:
        print("Usage: analyse.py <LEVEL> <path-to-log-file>", file=sys.stderr)
        sys.exit(1)
    
    level = sys.argv[1]
    log_file = sys.argv[2]
    
    # Check if file exists
    if not Path(log_file).exists():
        print(f"Error: File not found: {log_file}", file=sys.stderr)
        sys.exit(1)
    
    # Parse log file
    service_counts = parse_log_file(log_file, level)
    
    # Format and print output
    output_lines = format_output(service_counts)
    for line in output_lines:
        print(line)


if __name__ == '__main__':
    main()
