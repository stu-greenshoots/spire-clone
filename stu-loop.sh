#!/bin/bash
set -euo pipefail

# Stu Loop - Autonomous Sprint Execution
# Usage: ./stu-loop.sh [max-cycles]
# Default: runs forever (max-cycles=0)
#
# Instructions are loaded from stu-loop.d/*.md files.
# Edit those files to change agent behavior without modifying this script.
#
# Files:
#   stu-loop.d/check-status.md  - Sprint status check prompt
#   stu-loop.d/retrospective.md - Sprint retrospective prompt
#   stu-loop.d/plan-sprint.md   - Next sprint planning prompt
#   stu-loop.d/execute-task.md  - Task execution prompt
#   stu-loop.d/unblock.md       - Blocker resolution prompt

MAX_CYCLES=${1:-0}
CYCLE=0
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
INSTRUCTIONS_DIR="$PROJECT_DIR/stu-loop.d"
LOG_FILE="$PROJECT_DIR/stu-loop.log"

# Verify instructions directory exists
if [[ ! -d "$INSTRUCTIONS_DIR" ]]; then
  echo "ERROR: Instructions directory not found: $INSTRUCTIONS_DIR"
  echo "Create it with the required .md files. See stu-loop.d/README.md"
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

# =============================================================================
# AGENT RUNNERS
# Claude (Opus) = Engineer — writes code
# Copilot/Gemini = Overseer — reviews, plans, manages, unblocks
# =============================================================================

COPILOT_MODEL="gemini-3-pro-preview"
AGENT_PID=""

# Run an agent with retry logic for transient errors
# Usage: run_agent_raw <cli> <prompt> [output_file]
#   cli: "claude" or "copilot"
run_agent_raw() {
  local cli="$1"
  local prompt="$2"
  local output_file="${3:-}"
  local max_retries=3
  local retry=0
  local delay=3

  while [[ $retry -lt $max_retries ]]; do
    if [[ "$INTERRUPTED" == "true" ]]; then return 130; fi
    local success=false

    # Run agent in background so we can track its PID for Ctrl+C
    if [[ -n "$output_file" ]]; then
      if [[ "$cli" == "claude" ]]; then
        claude --dangerously-skip-permissions -p "$prompt" > >(tee -a "$LOG_FILE" "$output_file") 2>&1 &
      elif [[ "$cli" == "copilot" ]]; then
        copilot --model "$COPILOT_MODEL" --allow-all -p "$prompt" > >(tee -a "$LOG_FILE" "$output_file") 2>&1 &
      else
        log "ERROR: Unknown CLI: $cli"; return 1
      fi
    else
      if [[ "$cli" == "claude" ]]; then
        claude --dangerously-skip-permissions -p "$prompt" > >(tee -a "$LOG_FILE") 2>&1 &
      elif [[ "$cli" == "copilot" ]]; then
        copilot --model "$COPILOT_MODEL" --allow-all -p "$prompt" > >(tee -a "$LOG_FILE") 2>&1 &
      else
        log "ERROR: Unknown CLI: $cli"; return 1
      fi
    fi

    AGENT_PID=$!
    wait "$AGENT_PID" && success=true
    AGENT_PID=""

    if [[ "$INTERRUPTED" == "true" ]]; then return 130; fi

    if [[ "$success" == "true" ]]; then
      return 0
    fi

    retry=$((retry + 1))
    if [[ $retry -lt $max_retries ]]; then
      log "⚠️  $cli call failed, retry $retry/$max_retries in ${delay}s..."
      echo "⚠️  $cli call failed, retry $retry/$max_retries in ${delay}s..."
      sleep $delay
      delay=$((delay * 2))  # Exponential backoff
    fi
  done

  log "❌ $cli call failed after $max_retries retries"
  echo "❌ $cli call failed after $max_retries retries"
  return 1
}

# Convenience wrappers
run_engineer_raw() { run_agent_raw "claude" "$1" "${2:-}"; }
run_overseer_raw() { run_agent_raw "copilot" "$1" "${2:-}"; }

run_engineer() {
  local prompt="$1"
  local phase_name="${2:-}"
  local agent_tag="${3:-claude-engineer}"

  if [[ -n "$phase_name" ]]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "[AGENT:$agent_tag] 🤖 CLAUDE (Engineer): $phase_name"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  fi

  run_engineer_raw "$prompt"

  if [[ -n "$phase_name" ]]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
  fi
}

run_overseer() {
  local prompt="$1"
  local phase_name="${2:-}"
  local agent_tag="${3:-gemini-overseer}"

  if [[ -n "$phase_name" ]]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "[AGENT:$agent_tag] 💎 GEMINI (Overseer): $phase_name"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  fi

  run_overseer_raw "$prompt"

  if [[ -n "$phase_name" ]]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
  fi
}

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Animated startup sequence
clear
sleep 0.3

echo -e "${CYAN}"
echo "                                    ○"
echo "                                   ╱│╲"
echo "                                    │"
echo "                                   ╱ ╲"
echo -e "${NC}"
sleep 0.2

clear
echo -e "${CYAN}"
echo "                              ∙  ·  ○  ·  ∙"
echo "                                   ╱│╲"
echo "                                    │"
echo "                                   ╱ ╲"
echo -e "${NC}"
sleep 0.2

clear
echo -e "${MAGENTA}"
echo "                         ✦    ∙  ·  ○  ·  ∙    ✦"
echo "                                   ╱│╲"
echo "                                    │"
echo "                                   ╱ ╲"
echo -e "${NC}"
sleep 0.2

clear
echo -e "${YELLOW}"
cat << 'STARTUP'

                    ·  ✦  ·                    ·  ✦  ·
               ✦         ✦                ✦         ✦
                    ╭─────────────────────────╮
          ✦        │                         │        ✦
                   │    ███████╗████████╗    │
                   │    ██╔════╝╚══██╔══╝    │
       ·    ·      │    ███████╗   ██║       │      ·    ·
                   │    ╚════██║   ██║       │
          ✦        │    ███████║   ██║       │        ✦
                   │    ╚══════╝   ╚═╝       │
                   │         ██╗   ██╗       │
                   │         ██║   ██║       │
       ·    ·      │         ██║   ██║       │      ·    ·
                   │         ██║   ██║       │
          ✦        │         ╚██████╔╝       │        ✦
                   │          ╚═════╝        │
                   │                         │
                   ╰─────────────────────────╯
               ✦         ✦                ✦         ✦
                    ·  ✦  ·                    ·  ✦  ·

STARTUP
echo -e "${NC}"
sleep 0.4

clear
echo -e "${CYAN}"
cat << 'LOOP'

        ╭──────────────────────────────────────────────────────────────╮
        │                                                              │
        │     ██████╗████████╗██╗   ██╗    ██╗      ██████╗  ██████╗ ██████╗  │
        │    ██╔════╝╚══██╔══╝██║   ██║    ██║     ██╔═══██╗██╔═══██╗██╔══██╗ │
        │    ╚█████╗    ██║   ██║   ██║    ██║     ██║   ██║██║   ██║██████╔╝ │
        │     ╚═══██╗   ██║   ██║   ██║    ██║     ██║   ██║██║   ██║██╔═══╝  │
        │    ██████╔╝   ██║   ╚██████╔╝    ███████╗╚██████╔╝╚██████╔╝██║      │
        │    ╚═════╝    ╚═╝    ╚═════╝     ╚══════╝ ╚═════╝  ╚═════╝ ╚═╝      │
        │                                                              │
        ╰──────────────────────────────────────────────────────────────╯

LOOP
echo -e "${NC}"
sleep 0.3

echo -e "${GREEN}"
cat << 'TAGLINE'
                    ╔══════════════════════════════════════════╗
                    ║                                          ║
                    ║    🚀 Autonomous Sprint Execution 🚀     ║
                    ║                                          ║
                    ║     "Let Stu cook while you sleep"       ║
                    ║                                          ║
                    ╚══════════════════════════════════════════╝
TAGLINE
echo -e "${NC}"
sleep 0.3

# Loading animation
echo ""
echo -ne "${YELLOW}    Initializing"
for i in {1..5}; do
  sleep 0.2
  echo -ne "."
done
echo -e " ${GREEN}✓${NC}"

echo -ne "${YELLOW}    Loading instruction files"
for i in {1..3}; do
  sleep 0.2
  echo -ne "."
done
echo -e " ${GREEN}✓${NC}"

echo -ne "${YELLOW}    Connecting to Claude (Engineer)"
for i in {1..4}; do
  sleep 0.2
  echo -ne "."
done
echo -e " ${GREEN}✓${NC}"

echo -ne "${YELLOW}    Connecting to Gemini (Overseer)"
for i in {1..4}; do
  sleep 0.2
  echo -ne "."
done
echo -e " ${GREEN}✓${NC}"

# Start Mission Control dashboard
DASHBOARD_PID=""
DASHBOARD_DIR="$PROJECT_DIR/dashboard"
if [[ -f "$DASHBOARD_DIR/server.js" && -f "$DASHBOARD_DIR/package.json" ]]; then
  echo -ne "${YELLOW}    Starting Mission Control dashboard"
  for i in {1..3}; do
    sleep 0.2
    echo -ne "."
  done

  # Install deps if needed
  if [[ ! -d "$DASHBOARD_DIR/node_modules" ]]; then
    (cd "$DASHBOARD_DIR" && npm install --silent) 2>/dev/null
  fi

  # Check if already running on port 3847
  EXISTING_PID=$(lsof -ti :3847 2>/dev/null | head -1)
  if [[ -n "$EXISTING_PID" ]]; then
    echo -e " ${GREEN}✓ (already running, PID $EXISTING_PID)${NC}"
    DASHBOARD_PID=""
  else
    # Start dashboard in background, suppress output
    node "$DASHBOARD_DIR/server.js" > /dev/null 2>&1 &
    DASHBOARD_PID=$!
    sleep 1
  fi

  # Check it actually started (or was already running)
  if [[ -n "$EXISTING_PID" ]] || { [[ -n "$DASHBOARD_PID" ]] && kill -0 "$DASHBOARD_PID" 2>/dev/null; }; then
    if [[ -z "$EXISTING_PID" ]]; then
      echo -e " ${GREEN}✓${NC}"
    fi

    # Get local IP for QR code
    LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")
    LOCAL_IP=${LOCAL_IP:-localhost}
    DASHBOARD_URL="http://${LOCAL_IP}:3847"

    echo ""
    echo -e "${CYAN}    ╔══════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}    ║       📱 Mission Control Dashboard 📱        ║${NC}"
    echo -e "${CYAN}    ║                                              ║${NC}"
    printf "${CYAN}    ║  ${WHITE}%-42s${CYAN}║${NC}\n" "$DASHBOARD_URL"
    echo -e "${CYAN}    ║                                              ║${NC}"
    echo -e "${CYAN}    ║  Scan QR code to monitor from your phone:    ║${NC}"
    echo -e "${CYAN}    ╚══════════════════════════════════════════════╝${NC}"
    echo ""

    # Display QR code using the dashboard's qrcode-terminal dependency
    node -e "var qr = require('$DASHBOARD_DIR/node_modules/qrcode-terminal'); qr.generate('$DASHBOARD_URL', {small: true}, function(c) { console.log(c); });" 2>/dev/null || true

    echo ""
  else
    echo -e " ${RED}✗ (failed to start)${NC}"
    DASHBOARD_PID=""
  fi
else
  echo -e "${YELLOW}    Mission Control dashboard not found (skipping)${NC}"
fi

# Cleanup function to stop dashboard on exit
INTERRUPTED=false

cleanup() {
  if [[ -n "${DASHBOARD_PID:-}" ]] && kill -0 "$DASHBOARD_PID" 2>/dev/null; then
    echo ""
    echo -e "${YELLOW}    Stopping Mission Control dashboard (PID $DASHBOARD_PID)...${NC}"
    kill "$DASHBOARD_PID" 2>/dev/null || true
    wait "$DASHBOARD_PID" 2>/dev/null || true
    echo -e "${GREEN}    Dashboard stopped.${NC}"
  fi
}

handle_interrupt() {
  INTERRUPTED=true
  echo ""
  echo -e "\n${RED}    ✋ Ctrl+C detected. Stopping Stu Loop...${NC}"
  log "=== Stu Loop stopped by user (SIGINT) ==="
  # Kill the running agent process if any
  if [[ -n "${AGENT_PID:-}" ]] && kill -0 "$AGENT_PID" 2>/dev/null; then
    echo -e "${YELLOW}    Killing agent process (PID $AGENT_PID)...${NC}"
    kill -TERM "$AGENT_PID" 2>/dev/null || true
    # Also kill the entire process group to catch tee and subshells
    kill -TERM -"$AGENT_PID" 2>/dev/null || true
    wait "$AGENT_PID" 2>/dev/null || true
    AGENT_PID=""
  fi
  cleanup
  exit 130
}

trap handle_interrupt INT TERM
trap cleanup EXIT

echo ""

log "=== Stu Loop started ==="
log "Project: $PROJECT_DIR"
log "Instructions: $INSTRUCTIONS_DIR"
log "Max cycles: ${MAX_CYCLES:-unlimited}"

# Source .env for child processes (e.g. OpenAI key for art generation)
if [[ -f "$PROJECT_DIR/.env" ]]; then
  set -a
  source "$PROJECT_DIR/.env"
  set +a
  log "Loaded .env"
fi

echo ""
echo "📁 Instruction files loaded:"
for f in "$INSTRUCTIONS_DIR"/*.md; do
  if [[ -f "$f" ]]; then
    log "  - $(basename "$f")"
    echo "   • $(basename "$f")"
  fi
done
echo ""

while true; do
  CYCLE=$((CYCLE + 1))
  RESULT=""  # Reset to prevent stale handoff writes

  # Ensure we're on the sprint branch before each cycle
  SPRINT_BRANCH=$(grep -oE 'sprint-[0-9]+' SPRINT_BOARD.md 2>/dev/null | head -1 || true)
  if [[ -n "$SPRINT_BRANCH" ]]; then
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || true)
    if [[ "$CURRENT_BRANCH" != "$SPRINT_BRANCH" ]]; then
      log "Resetting to $SPRINT_BRANCH (was on $CURRENT_BRANCH)"
      git checkout "$SPRINT_BRANCH" 2>/dev/null || true
    fi
  fi

  echo ""
  echo "╔══════════════════════════════════════════════════════════════════════════════╗"
  echo "║                           🔄 STU LOOP CYCLE $CYCLE                            ║"
  echo "╚══════════════════════════════════════════════════════════════════════════════╝"
  log "=== CYCLE $CYCLE ==="

  # Load handoff from last cycle
  HANDOFF=""
  HANDOFF_FILE="$INSTRUCTIONS_DIR/last-cycle.md"
  if [[ -f "$HANDOFF_FILE" ]]; then
    HANDOFF=$(cat "$HANDOFF_FILE")
    log "Loaded handoff from previous cycle"
  fi

  # Phase 1: Check sprint status
  log "Phase 1: Checking sprint status..."
  PROMPT=$(load_prompt "check-status.md")

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "[AGENT:gemini-status] 💎 GEMINI: Checking Sprint Status"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  TEMP_FILE=$(mktemp)
  run_overseer_raw "$PROMPT" "$TEMP_FILE"
  STATUS=$(cat "$TEMP_FILE")
  rm -f "$TEMP_FILE"

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  sleep 2

  if [[ "$STATUS" == *"SPRINT_COMPLETE"* ]]; then
    echo ""
    echo "🎉 Sprint complete! Running retrospective and planning next sprint..."
    log "Sprint complete. Running retrospective and planning next sprint..."

    # Retrospective (Gemini — PM role)
    log "Running retrospective..."
    PROMPT=$(load_prompt "retrospective.md")
    run_overseer "$PROMPT" "Running Sprint Retrospective" "gemini-retro"

    # Plan next sprint (Gemini — PM role)
    log "Planning next sprint..."
    PROMPT=$(load_prompt "plan-sprint.md")
    run_overseer "$PROMPT" "Planning Next Sprint" "gemini-planner"

    log "New sprint planned. Continuing..."

  elif [[ "$STATUS" == *"SPRINT_ACTIVE"* ]]; then

    # Every 5th cycle: housekeeping
    if (( CYCLE % 5 == 0 )); then
      echo ""
      echo "🧹 Housekeeping cycle — syncing board and docs..."
      log "Housekeeping cycle (every 3rd)"

      PROMPT=$(load_prompt "housekeeping.md")
      if [[ -n "$HANDOFF" ]]; then
        PROMPT="$(printf '## Context from Last Cycle\n\n%s\n\n---\n\n%s' "$HANDOFF" "$PROMPT")"
      fi

      echo ""
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo "[AGENT:gemini-housekeeping] 💎 GEMINI: Housekeeping"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

      TEMP_FILE=$(mktemp)
      run_overseer_raw "$PROMPT" "$TEMP_FILE"
      RESULT=$(cat "$TEMP_FILE")
      rm -f "$TEMP_FILE"

      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Open PRs? Review them first (separate eyes)
    elif [[ "$STATUS" == *"HAS_OPEN_PRS"* ]]; then
      echo ""
      echo "👁️  Review cycle — open PRs found, reviewing with fresh eyes..."
      log "Review cycle: open PRs detected"

      PROMPT=$(load_prompt "review-prs.md")
      if [[ -n "$HANDOFF" ]]; then
        PROMPT="$(printf '## Context from Last Cycle\n\n%s\n\n---\n\n%s' "$HANDOFF" "$PROMPT")"
      fi

      echo ""
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo "[AGENT:gemini-reviewer] 💎 GEMINI: Reviewing PRs"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

      TEMP_FILE=$(mktemp)
      run_overseer_raw "$PROMPT" "$TEMP_FILE"
      RESULT=$(cat "$TEMP_FILE")
      rm -f "$TEMP_FILE"

      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

      # If a PR was merged, run independent validation
      if [[ "$RESULT" == *"MERGED"* ]]; then
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "[AGENT:loop-validate] 🔍 INDEPENDENT VALIDATION: npm run validate"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        log "Running independent validation after merge..."

        if (cd "$PROJECT_DIR" && npm run validate 2>&1 | tee -a "$LOG_FILE"); then
          log "✅ Independent validation PASSED"
          echo "✅ Validation passed"
        else
          log "❌ Independent validation FAILED"
          echo "❌ Validation FAILED after merge — next cycle will see this"
          # Write failure to handoff so next cycle knows
          echo "⚠️ VALIDATE_FAILED: npm run validate failed after merging a PR. The build, tests, or lint may be broken. Investigate before doing more work." > "$HANDOFF_FILE"
        fi

        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      fi

      if [[ "$RESULT" == *"BLOCKED"* ]]; then
        log "PR blocked by CI. Attempting unblock..."
        PROMPT=$(load_prompt "unblock.md")

        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "[AGENT:gemini-unblock] 💎 GEMINI: Attempting to Unblock"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

        TEMP_FILE=$(mktemp)
        run_overseer_raw "$PROMPT" "$TEMP_FILE"
        UNBLOCK_RESULT=$(cat "$TEMP_FILE")
        rm -f "$TEMP_FILE"

        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

        if [[ "$UNBLOCK_RESULT" == *"NEEDS_HUMAN"* ]]; then
          echo ""
          echo "╔══════════════════════════════════════════════════════════════════════════════╗"
          echo "║                    🚨 NEEDS HUMAN INTERVENTION 🚨                            ║"
          echo "╚══════════════════════════════════════════════════════════════════════════════╝"
          log "NEEDS HUMAN INTERVENTION. Stopping loop."
          exit 2
        fi
      fi

    else
      # No open PRs — do work (create PR, don't merge)
      echo ""
      echo "⚡ Work cycle — implementing next task..."
      log "Work cycle: no open PRs, picking next task"

      PROMPT=$(load_prompt "execute-task.md")
      if [[ -n "$HANDOFF" ]]; then
        PROMPT="$(printf '## Context from Last Cycle\n\n%s\n\n---\n\n%s' "$HANDOFF" "$PROMPT")"
      fi

      echo ""
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo "[AGENT:claude-engineer] 🤖 CLAUDE: Executing Task"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

      TEMP_FILE=$(mktemp)
      run_engineer_raw "$PROMPT" "$TEMP_FILE"
      RESULT=$(cat "$TEMP_FILE")
      rm -f "$TEMP_FILE"

      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

      if [[ "$RESULT" == *"BLOCKED"* ]]; then
        log "Task blocked. Attempting unblock..."
        PROMPT=$(load_prompt "unblock.md")

        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "[AGENT:gemini-unblock] 💎 GEMINI: Attempting to Unblock"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

        TEMP_FILE=$(mktemp)
        run_overseer_raw "$PROMPT" "$TEMP_FILE"
        UNBLOCK_RESULT=$(cat "$TEMP_FILE")
        rm -f "$TEMP_FILE"

        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

        if [[ "$UNBLOCK_RESULT" == *"NEEDS_HUMAN"* ]]; then
          echo ""
          echo "╔══════════════════════════════════════════════════════════════════════════════╗"
          echo "║                    🚨 NEEDS HUMAN INTERVENTION 🚨                            ║"
          echo "╚══════════════════════════════════════════════════════════════════════════════╝"
          log "NEEDS HUMAN INTERVENTION. Stopping loop."
          exit 2
        fi
      fi

      if [[ "$RESULT" == *"TASK_DONE"* ]]; then
        log "✅ Task completed, PR created. Next cycle will review."
      fi
    fi

  else
    echo ""
    echo "⚠️  Could not determine sprint status. Retrying next cycle..."
    log "Could not determine sprint status. Retrying next cycle..."
  fi

  # Extract handoff summary from the last result (if not already written by validate failure)
  if [[ -n "${RESULT:-}" ]]; then
    # Try to extract structured handoff between markers
    EXTRACTED=$(echo "$RESULT" | sed -n '/---HANDOFF_START---/,/---HANDOFF_END---/p' 2>/dev/null || true)
    if [[ -n "$EXTRACTED" ]]; then
      echo "$EXTRACTED" > "$HANDOFF_FILE"
      log "Wrote structured handoff to last-cycle.md"
    else
      # Fallback: save last 30 lines as context
      echo "$RESULT" | tail -30 > "$HANDOFF_FILE"
      log "Wrote fallback handoff (last 30 lines) to last-cycle.md"
    fi
  fi

  # Check cycle limit
  if [[ $MAX_CYCLES -gt 0 && $CYCLE -ge $MAX_CYCLES ]]; then
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════════════════╗"
    echo "║                      🛑 MAX CYCLES REACHED ($MAX_CYCLES)                       ║"
    echo "╚══════════════════════════════════════════════════════════════════════════════╝"
    log "Reached max cycles ($MAX_CYCLES). Stopping."
    exit 0
  fi

  echo ""
  echo "────────────────────────────────────────────────────────────────────────────────"
  log "Cycle $CYCLE complete. Starting next cycle in 5s..."
  echo "⏳ Cycle $CYCLE complete. Next cycle in 5 seconds..."
  echo "────────────────────────────────────────────────────────────────────────────────"
  sleep 5
  if [[ "$INTERRUPTED" == "true" ]]; then exit 130; fi
done
