#!/bin/bash

# GitHub Contribution Tracker Debug Logging Script
# This script runs the dev server and logs all console output to files

LOG_DIR="./logs"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="${LOG_DIR}/dev_server_${TIMESTAMP}.log"
ERROR_LOG="${LOG_DIR}/dev_server_errors_${TIMESTAMP}.log"

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

echo "==========================================" | tee -a "$LOG_FILE"
echo "GitHub Contribution Tracker Debug Session" | tee -a "$LOG_FILE"
echo "Started: $(date)" | tee -a "$LOG_FILE"
echo "Log file: $LOG_FILE" | tee -a "$LOG_FILE"
echo "Error log: $ERROR_LOG" | tee -a "$LOG_FILE"
echo "==========================================" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

echo "Starting dev server with logging..." | tee -a "$LOG_FILE"
echo "All console.log statements from server (+page.server.ts) and client (+page.svelte) will be captured" | tee -a "$LOG_FILE"
echo "Look for [GitHub API] and [Component] log messages in the output" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Run the dev server and capture both stdout and stderr
# Using tee to both display output and save to file
bun run dev 2>&1 | tee -a "$LOG_FILE"

echo "" | tee -a "$LOG_FILE"
echo "==========================================" | tee -a "$LOG_FILE"
echo "Debug session ended: $(date)" | tee -a "$LOG_FILE"
echo "==========================================" | tee -a "$LOG_FILE"