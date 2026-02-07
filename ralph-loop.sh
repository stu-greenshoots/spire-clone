#!/bin/bash
set -euo pipefail

# Ralph Loop - Autonomous Sprint Execution
# Usage: ./ralph-loop.sh [max-cycles]
# Default: runs forever (max-cycles=0)
#
# Instructions are loaded from ralph-loop.d/*.md files.
# Edit those files to change agent behavior without modifying this script.
#
# Files:
#   ralph-loop.d/check-status.md  - Sprint status check prompt
#   ralph-loop.d/retrospective.md - Sprint retrospective prompt
#   ralph-loop.d/plan-sprint.md   - Next sprint planning prompt
#   ralph-loop.d/execute-task.md  - Task execution prompt
#   ralph-loop.d/unblock.md       - Blocker resolution prompt

MAX_CYCLES=${1:-0}
CYCLE=0
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
INSTRUCTIONS_DIR="$PROJECT_DIR/ralph-loop.d"
LOG_FILE="$PROJECT_DIR/ralph-loop.log"

# Verify instructions directory exists
if [[ ! -d "$INSTRUCTIONS_DIR" ]]; then
  echo "ERROR: Instructions directory not found: $INSTRUCTIONS_DIR"
  echo "Create it with the required .md files. See ralph-loop.d/README.md"
  exit 1
fi

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

load_prompt() {
  local file="$INSTRUCTIONS_DIR/$1"
  if [[ ! -f "$file" ]]; then
    log "ERROR: Instruction file not found: $file"
    exit 1
  fi
  cat "$file"
}

run_claude() {
  local prompt="$1"
  claude --dangerously-skip-permissions -p "$prompt" 2>&1
}

log "=== Ralph Loop started ==="
log "Project: $PROJECT_DIR"
log "Instructions: $INSTRUCTIONS_DIR"
log "Max cycles: ${MAX_CYCLES:-unlimited}"
log "Instruction files:"
for f in "$INSTRUCTIONS_DIR"/*.md; do
  [[ -f "$f" ]] && log "  - $(basename "$f")"
done

while true; do
  CYCLE=$((CYCLE + 1))
  log "=== CYCLE $CYCLE ==="

  # Phase 1: Check sprint status
  log "Phase 1: Checking sprint status..."
  PROMPT=$(load_prompt "check-status.md")
  STATUS=$(run_claude "$PROMPT")

  echo "$STATUS" >> "$LOG_FILE"

  if [[ "$STATUS" == *"SPRINT_COMPLETE"* ]]; then
    log "Sprint complete. Running retrospective and planning next sprint..."

    # Phase 2a: Retrospective
    log "Phase 2a: Running retrospective..."
    PROMPT=$(load_prompt "retrospective.md")
    run_claude "$PROMPT" >> "$LOG_FILE"

    # Phase 2b: Plan next sprint
    log "Phase 2b: Planning next sprint..."
    PROMPT=$(load_prompt "plan-sprint.md")
    run_claude "$PROMPT" >> "$LOG_FILE"

    log "New sprint planned. Continuing..."

  elif [[ "$STATUS" == *"SPRINT_ACTIVE"* ]]; then
    log "Sprint active. Executing next task..."

    # Phase 3: Execute one task
    PROMPT=$(load_prompt "execute-task.md")
    RESULT=$(run_claude "$PROMPT")

    echo "$RESULT" >> "$LOG_FILE"

    if [[ "$RESULT" == *"BLOCKED"* ]]; then
      log "Task blocked. Attempting unblock via mentor..."
      PROMPT=$(load_prompt "unblock.md")
      UNBLOCK_RESULT=$(run_claude "$PROMPT")
      echo "$UNBLOCK_RESULT" >> "$LOG_FILE"

      if [[ "$UNBLOCK_RESULT" == *"NEEDS_HUMAN"* ]]; then
        log "NEEDS HUMAN INTERVENTION. Stopping loop."
        log "Check ralph-loop.log for details."
        exit 2
      fi
    fi

    if [[ "$RESULT" == *"TASK_DONE"* ]]; then
      log "Task completed successfully."
    fi

  else
    log "Could not determine sprint status. Retrying next cycle..."
  fi

  # Check cycle limit
  if [[ $MAX_CYCLES -gt 0 && $CYCLE -ge $MAX_CYCLES ]]; then
    log "Reached max cycles ($MAX_CYCLES). Stopping."
    exit 0
  fi

  log "Cycle $CYCLE complete. Starting next cycle..."
  sleep 5
done
