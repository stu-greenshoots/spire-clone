#!/bin/bash
set -euo pipefail

# Stu Loop v2 - Claude-Only Autonomous Sprint Execution
# Usage: ./stu-loop.sh [max-cycles]
# Default: runs forever (max-cycles=0)
#
# Architecture: ONE Claude orchestrator per cycle.
# Claude reads state, spawns parallel sub-agents for tasks,
# reviews PRs, merges, and updates docs — all in one call.
#
# No Gemini. No Copilot CLI. Just Claude (via happy) with sub-agents.

MAX_CYCLES=${1:-0}
CYCLE=0
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
INSTRUCTIONS_DIR="$PROJECT_DIR/stu-loop.d"
LOG_FILE="$PROJECT_DIR/stu-loop.log"

if [[ ! -d "$INSTRUCTIONS_DIR" ]]; then
  echo "ERROR: Instructions directory not found: $INSTRUCTIONS_DIR"
  exit 1
fi

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# =============================================================================
# SINGLE AGENT: Claude does everything
# =============================================================================

AGENT_PID=""

run_claude() {
  local prompt="$1"
  local phase_name="${2:-}"
  local max_retries=3
  local retry=0
  local delay=5

  if [[ -n "$phase_name" ]]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "[AGENT:claude-pm] CLAUDE (PM Orchestrator): $phase_name"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  fi

  while [[ $retry -lt $max_retries ]]; do
    if [[ "$INTERRUPTED" == "true" ]]; then return 130; fi

    happy --dangerously-skip-permissions -p "$prompt" > >(tee -a "$LOG_FILE") 2>&1 &
    AGENT_PID=$!

    if wait "$AGENT_PID"; then
      AGENT_PID=""
      if [[ -n "$phase_name" ]]; then
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      fi
      return 0
    fi

    AGENT_PID=""
    if [[ "$INTERRUPTED" == "true" ]]; then return 130; fi

    retry=$((retry + 1))
    if [[ $retry -lt $max_retries ]]; then
      log "Claude call failed, retry $retry/$max_retries in ${delay}s..."
      sleep $delay
      delay=$((delay * 2))
    fi
  done

  log "Claude call failed after $max_retries retries"
  return 1
}

# =============================================================================
# Startup
# =============================================================================

clear
echo ""
echo "    ╔══════════════════════════════════════════════════════════════╗"
echo "    ║                                                              ║"
echo "    ║          STU LOOP v2 — Claude-Only Orchestration             ║"
echo "    ║                                                              ║"
echo "    ║     One Claude. Parallel sub-agents. Actual results.         ║"
echo "    ║                                                              ║"
echo "    ╚══════════════════════════════════════════════════════════════╝"
echo ""

# Dashboard startup
DASHBOARD_PID=""
DASHBOARD_DIR="$PROJECT_DIR/dashboard"
if [[ -f "$DASHBOARD_DIR/server.js" && -f "$DASHBOARD_DIR/package.json" ]]; then
  if [[ ! -d "$DASHBOARD_DIR/node_modules" ]]; then
    (cd "$DASHBOARD_DIR" && npm install --silent) 2>/dev/null
  fi

  EXISTING_PID=$(lsof -ti :3847 2>/dev/null | head -1)
  if [[ -n "$EXISTING_PID" ]]; then
    echo "    Dashboard already running (PID $EXISTING_PID)"
  else
    node "$DASHBOARD_DIR/server.js" > /dev/null 2>&1 &
    DASHBOARD_PID=$!
    sleep 1
    if kill -0 "$DASHBOARD_PID" 2>/dev/null; then
      LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")
      LOCAL_IP=${LOCAL_IP:-localhost}
      echo "    Dashboard: http://${LOCAL_IP}:3847"
    fi
  fi
fi

# Cleanup
INTERRUPTED=false

cleanup() {
  if [[ -n "${DASHBOARD_PID:-}" ]] && kill -0 "$DASHBOARD_PID" 2>/dev/null; then
    kill "$DASHBOARD_PID" 2>/dev/null || true
    wait "$DASHBOARD_PID" 2>/dev/null || true
  fi
}

handle_interrupt() {
  INTERRUPTED=true
  echo ""
  echo "    Ctrl+C — stopping..."
  log "=== Stu Loop stopped by user (SIGINT) ==="
  if [[ -n "${AGENT_PID:-}" ]] && kill -0 "$AGENT_PID" 2>/dev/null; then
    kill -TERM "$AGENT_PID" 2>/dev/null || true
    kill -TERM -"$AGENT_PID" 2>/dev/null || true
    wait "$AGENT_PID" 2>/dev/null || true
    AGENT_PID=""
  fi
  cleanup
  exit 130
}

trap handle_interrupt INT TERM
trap cleanup EXIT

log "=== Stu Loop v2 started ==="
log "Project: $PROJECT_DIR"
log "Max cycles: ${MAX_CYCLES:-unlimited}"

# Source .env for child processes
if [[ -f "$PROJECT_DIR/.env" ]]; then
  set -a
  source "$PROJECT_DIR/.env"
  set +a
  log "Loaded .env"
fi

echo ""

# =============================================================================
# Main Loop
# =============================================================================

while true; do
  CYCLE=$((CYCLE + 1))

  # Ensure we're on the sprint branch
  SPRINT_BRANCH=$(grep -oE 'sprint-[0-9]+' SPRINT_BOARD.md 2>/dev/null | head -1 || true)
  if [[ -n "$SPRINT_BRANCH" ]]; then
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || true)
    if [[ "$CURRENT_BRANCH" != "$SPRINT_BRANCH" ]]; then
      log "Switching to $SPRINT_BRANCH (was on $CURRENT_BRANCH)"
      git checkout "$SPRINT_BRANCH" 2>/dev/null || true
    fi
  fi

  echo ""
  echo "══════════════════════════════════════════════════════════════════════════════"
  echo "    CYCLE $CYCLE"
  echo "══════════════════════════════════════════════════════════════════════════════"
  log "=== CYCLE $CYCLE ==="

  # Load handoff from last cycle
  HANDOFF=""
  HANDOFF_FILE="$INSTRUCTIONS_DIR/last-cycle.md"
  if [[ -f "$HANDOFF_FILE" ]]; then
    HANDOFF=$(cat "$HANDOFF_FILE")
  fi

  # Build the orchestration prompt
  ORCHESTRATE_PROMPT=$(cat "$INSTRUCTIONS_DIR/orchestrate-cycle.md")

  # Inject cycle number and handoff context
  FULL_PROMPT="## Cycle $CYCLE

$(if [[ -n "$HANDOFF" ]]; then echo "## Context from Last Cycle

$HANDOFF

---"; fi)

$ORCHESTRATE_PROMPT"

  # Run Claude as the PM orchestrator
  TEMP_FILE=$(mktemp)
  run_claude "$FULL_PROMPT" "Cycle $CYCLE" > "$TEMP_FILE" 2>&1 || true
  RESULT=$(cat "$TEMP_FILE" 2>/dev/null || echo "")
  rm -f "$TEMP_FILE"

  # Post-cycle validation (independent of Claude)
  if [[ "$RESULT" == *"MERGED"* ]]; then
    echo ""
    echo "    Running independent validation after merge..."
    log "Running independent validation..."
    if (cd "$PROJECT_DIR" && npm run validate 2>&1 | tee -a "$LOG_FILE"); then
      log "Validation PASSED"
    else
      log "Validation FAILED"
      echo "VALIDATE_FAILED: npm run validate failed after merge. Fix before more work." > "$HANDOFF_FILE"
    fi
  fi

  # Extract handoff
  if [[ -n "$RESULT" ]]; then
    EXTRACTED=$(echo "$RESULT" | sed -n '/---HANDOFF_START---/,/---HANDOFF_END---/p' 2>/dev/null || true)
    if [[ -n "$EXTRACTED" ]]; then
      echo "$EXTRACTED" > "$HANDOFF_FILE"
    else
      echo "$RESULT" | tail -30 > "$HANDOFF_FILE"
    fi
  fi

  # Check for NEEDS_HUMAN
  if [[ "$RESULT" == *"NEEDS_HUMAN"* ]]; then
    echo ""
    echo "    NEEDS HUMAN INTERVENTION — stopping loop."
    log "NEEDS HUMAN INTERVENTION. Stopping loop."
    exit 2
  fi

  # Cycle limit
  if [[ $MAX_CYCLES -gt 0 && $CYCLE -ge $MAX_CYCLES ]]; then
    echo ""
    echo "    Max cycles reached ($MAX_CYCLES). Stopping."
    log "Reached max cycles ($MAX_CYCLES). Stopping."
    exit 0
  fi

  echo ""
  echo "    Cycle $CYCLE complete. Next in 5s..."
  log "Cycle $CYCLE complete."
  sleep 5
  if [[ "$INTERRUPTED" == "true" ]]; then exit 130; fi
done
