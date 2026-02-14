/* global process */
/**
 * Mission Control Dashboard Server
 *
 * Monitors the autonomous sprint execution loop ("Stu Loop") for
 * the Spire Ascent game project. Provides real-time status, log streaming,
 * sprint board parsing, diary management, and git/PR integration.
 *
 * Usage:
 *   node dashboard/server.js
 *   PORT=4000 node dashboard/server.js
 *
 * Endpoints:
 *   GET  /api/health          - Health check
 *   GET  /api/status          - Combined dashboard status
 *   GET  /api/sprint          - Parsed sprint board (current sprint)
 *   GET  /api/log             - Tail log file (?lines=100&since=timestamp)
 *   GET  /api/log/stream      - SSE real-time log stream
 *   GET  /api/diaries          - List all diary files with previews
 *   GET  /api/diaries/:role    - Read a specific diary
 *   POST /api/diaries/PM/note  - Add feedback note to PM diary
 *   GET  /api/prs              - Open and recently merged PRs
 *   GET  /api/git/log          - Recent git commits
 *   GET  /api/git/branches     - All git branches
 *   GET  /api/validate         - Last validation result
 *   GET  /api/usage            - Claude usage info
 *   GET  /api/game             - Game deployment info
 */

import express from 'express';
import { readFile, readdir, stat, writeFile as fsWriteFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import qrcode from 'qrcode-terminal';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3847;
const PROJECT_ROOT = path.resolve(__dirname, '..');

const PATHS = {
  sprintBoard: path.join(PROJECT_ROOT, 'SPRINT_BOARD.md'),
  stuLog: path.join(PROJECT_ROOT, 'stu-loop.log'),
  lastCycle: path.join(PROJECT_ROOT, 'stu-loop.d', 'last-cycle.md'),
  diaries: path.join(PROJECT_ROOT, 'docs', 'diaries'),
  dist: path.join(PROJECT_ROOT, 'dist'),
  publicDir: path.join(__dirname, 'public'),
};

// Diary roles that exist in the project
const DIARY_ROLES = ['PM', 'BE', 'JR', 'AR', 'UX', 'GD', 'QA', 'SL', 'VARROW'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Safely read a file, returning fallback on error.
 */
async function safeReadFile(filePath, fallback = '') {
  try {
    return await readFile(filePath, 'utf-8');
  } catch {
    return fallback;
  }
}

/**
 * Safely run a shell command, returning fallback on error.
 * All commands run with cwd set to PROJECT_ROOT.
 */
function safeExec(cmd, fallback = '') {
  try {
    return execSync(cmd, {
      cwd: PROJECT_ROOT,
      encoding: 'utf-8',
      timeout: 15000,
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch {
    return fallback;
  }
}

/**
 * Parse a timestamp string like "2026-02-14 10:30:45" into a Date.
 */
function parseTimestamp(ts) {
  if (!ts) return null;
  const d = new Date(ts.replace(' ', 'T'));
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Extract lines from text that match the log timestamp format.
 * Returns array of { timestamp, content, raw } objects.
 */
function parseLogLines(text) {
  const lines = text.split('\n');
  const parsed = [];
  const logPattern = /^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]\s*(.*)$/;

  for (const raw of lines) {
    const match = raw.match(logPattern);
    if (match) {
      parsed.push({
        timestamp: match[1],
        content: match[2],
        raw,
      });
    } else if (raw.trim()) {
      // Non-timestamped lines (agent output, etc.) get appended as content-only
      parsed.push({
        timestamp: null,
        content: raw,
        raw,
      });
    }
  }
  return parsed;
}

/**
 * Detect cycle boundaries and agent types in log lines.
 */
function annotateLogLines(parsed) {
  let currentCycle = null;
  let currentAgent = null;

  return parsed.map((line) => {
    // Detect cycle boundary
    const cycleMatch = line.content.match(/=== CYCLE (\d+) ===/);
    if (cycleMatch) {
      currentCycle = parseInt(cycleMatch[1], 10);
    }

    // Detect agent markers
    if (line.raw.includes('CLAUDE') || line.raw.includes('Engineer')) {
      currentAgent = 'claude';
    } else if (line.raw.includes('GEMINI') || line.raw.includes('Overseer')) {
      currentAgent = 'gemini';
    }

    return {
      ...line,
      cycle: currentCycle,
      agent: currentAgent,
      isCycleBoundary: !!cycleMatch,
    };
  });
}

// ---------------------------------------------------------------------------
// Sprint Board Parser
// ---------------------------------------------------------------------------

/**
 * Parse SPRINT_BOARD.md to extract the current (latest IN PROGRESS or highest)
 * sprint section. Returns structured sprint data.
 */
function parseSprintBoard(content) {
  if (!content) {
    return {
      number: null,
      name: null,
      goal: null,
      branch: null,
      status: 'unknown',
      tasks: [],
      validationGate: [],
    };
  }

  // Find the last sprint section that is IN PROGRESS, or the highest numbered one
  const sprintSections = content.split(/^## Sprint \d+/m);
  const sprintHeaders = [...content.matchAll(/^## Sprint (\d+):\s*(.+)$/gm)];

  if (sprintHeaders.length === 0) {
    return {
      number: null,
      name: null,
      goal: null,
      branch: null,
      status: 'unknown',
      tasks: [],
      validationGate: [],
    };
  }

  // Find the IN PROGRESS sprint, or fall back to the last one
  let targetIdx = sprintHeaders.length - 1;
  for (let i = 0; i < sprintHeaders.length; i++) {
    const sectionStart = sprintHeaders[i].index;
    const sectionEnd = i + 1 < sprintHeaders.length ? sprintHeaders[i + 1].index : content.length;
    const section = content.slice(sectionStart, sectionEnd);
    if (section.includes('IN PROGRESS')) {
      targetIdx = i;
      break;
    }
  }

  const header = sprintHeaders[targetIdx];
  const sprintNumber = parseInt(header[1], 10);
  const sprintTitle = header[2].replace(/\s*-\s*(IN PROGRESS|COMPLETE).*$/, '').trim();

  const sectionStart = header.index;
  const sectionEnd =
    targetIdx + 1 < sprintHeaders.length ? sprintHeaders[targetIdx + 1].index : content.length;
  const section = content.slice(sectionStart, sectionEnd);

  // Determine status
  let sprintStatus = 'unknown';
  if (section.includes('IN PROGRESS')) sprintStatus = 'in_progress';
  else if (section.includes('COMPLETE')) sprintStatus = 'complete';

  // Extract goal
  const goalMatch = section.match(/\*\*Goal:\*\*\s*(.+)/);
  const goal = goalMatch ? goalMatch[1].trim() : null;

  // Extract branch
  const branchMatch = section.match(/\*\*Branch:\*\*\s*`([^`]+)`/);
  const branch = branchMatch ? branchMatch[1] : null;

  // Parse task tables
  const tasks = parseTaskTables(section);

  // Parse validation gate
  const validationGate = parseValidationGate(section);

  return {
    number: sprintNumber,
    name: sprintTitle,
    goal,
    branch,
    status: sprintStatus,
    tasks,
    validationGate,
    summary: {
      total: tasks.length,
      done: tasks.filter((t) => t.status === 'DONE' || t.status === 'MERGED').length,
      pending: tasks.filter((t) => t.status === 'PENDING').length,
      blocked: tasks.filter((t) => t.status === 'BLOCKED').length,
    },
  };
}

/**
 * Parse markdown tables within a sprint section into task objects.
 * Detects priority tier from section headers (P0/P1/P2).
 */
function parseTaskTables(section) {
  const tasks = [];
  const lines = section.split('\n');

  let currentPriority = null;
  let inTable = false;
  let columnHeaders = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Detect priority tier headers
    const priorityMatch = line.match(/###?\s*(?:P(\d)|Stream\s+\w)/i);
    if (priorityMatch) {
      if (priorityMatch[1]) {
        currentPriority = `P${priorityMatch[1]}`;
      } else {
        // Stream-based headers — extract from context
        if (line.toLowerCase().includes('must')) currentPriority = 'P0';
        else if (line.toLowerCase().includes('should')) currentPriority = 'P1';
        else if (line.toLowerCase().includes('stretch') || line.toLowerCase().includes('nice'))
          currentPriority = 'P2';
      }
    }

    // Detect table header row
    if (line.startsWith('|') && line.includes('Task') && line.includes('Status')) {
      columnHeaders = line
        .split('|')
        .map((c) => c.trim().toLowerCase())
        .filter(Boolean);
      inTable = true;
      continue;
    }

    // Skip separator row
    if (inTable && line.match(/^\|[\s-|]+\|$/)) {
      continue;
    }

    // Parse data rows
    if (inTable && line.startsWith('|')) {
      const cells = line
        .split('|')
        .map((c) => c.trim())
        .filter(Boolean);

      if (cells.length < 3) {
        inTable = false;
        continue;
      }

      const task = {};

      for (let ci = 0; ci < columnHeaders.length && ci < cells.length; ci++) {
        const header = columnHeaders[ci];
        const value = cells[ci];

        if (header === 'task') task.id = value;
        else if (header === 'owner') task.owner = value;
        else if (header === 'size') task.size = value;
        else if (header === 'priority') task.priority = value;
        else if (header === 'description') task.description = value;
        else if (header === 'branch') task.branch = value;
        else if (header === 'status') task.statusRaw = value;
      }

      // Normalize status
      const statusRaw = (task.statusRaw || '').toUpperCase();
      if (statusRaw.includes('MERGED')) {
        task.status = 'MERGED';
        // Extract PR number
        const prMatch = (task.statusRaw || '').match(/PR\s*#(\d+)/);
        if (prMatch) task.pr = parseInt(prMatch[1], 10);
      } else if (statusRaw.includes('DONE')) {
        task.status = 'DONE';
        const prMatch = (task.statusRaw || '').match(/PR\s*#(\d+)/);
        if (prMatch) task.pr = parseInt(prMatch[1], 10);
      } else if (statusRaw.includes('PENDING')) {
        task.status = 'PENDING';
      } else if (statusRaw.includes('BLOCKED')) {
        task.status = 'BLOCKED';
      } else if (statusRaw.includes('DEFERRED')) {
        task.status = 'DEFERRED';
      } else if (statusRaw.includes('CLOSED')) {
        task.status = 'CLOSED';
      } else {
        task.status = statusRaw || 'UNKNOWN';
      }

      // Assign priority from context if not in table
      if (!task.priority && currentPriority) {
        task.priority = currentPriority;
      }

      delete task.statusRaw;
      tasks.push(task);
    } else if (inTable && !line.startsWith('|')) {
      // End of table
      inTable = false;
    }
  }

  return tasks;
}

/**
 * Parse the validation gate checklist.
 */
function parseValidationGate(section) {
  const items = [];
  const checklistPattern = /^-\s*\[([ x~])\]\s*(.+)$/gm;
  let match;

  // Find the validation gate section
  const gateStart = section.indexOf('Validation Gate');
  if (gateStart === -1) return items;

  const gateSection = section.slice(gateStart);

  while ((match = checklistPattern.exec(gateSection)) !== null) {
    items.push({
      checked: match[1] === 'x',
      partial: match[1] === '~',
      text: match[2].trim(),
    });
  }

  return items;
}

// ---------------------------------------------------------------------------
// Log File / Loop State Parsers
// ---------------------------------------------------------------------------

/**
 * Extract cycle/phase info from log content.
 */
function extractLoopState(logContent) {
  const lines = logContent.split('\n');
  let currentCycle = null;
  let lastPhase = null;
  let lastTimestamp = null;
  let loopStarted = null;

  for (const line of lines) {
    // Cycle marker
    const cycleMatch = line.match(/=== CYCLE (\d+) ===/);
    if (cycleMatch) {
      currentCycle = parseInt(cycleMatch[1], 10);
    }

    // Phase marker
    const phaseMatch = line.match(/Phase \d+:\s*(.+?)(?:\.\.\.|$)/);
    if (phaseMatch) {
      lastPhase = phaseMatch[1].trim();
    }

    // Broader phase detection from agent markers
    if (line.includes('Executing Task') || line.includes('Work cycle')) lastPhase = 'WORK';
    if (line.includes('Reviewing PRs') || line.includes('Review cycle')) lastPhase = 'REVIEW';
    if (line.includes('Housekeeping')) lastPhase = 'HOUSEKEEPING';
    if (line.includes('Checking sprint status') || line.includes('Sprint Status'))
      lastPhase = 'CHECK';
    if (line.includes('retrospective') || line.includes('Retrospective'))
      lastPhase = 'RETROSPECTIVE';
    if (line.includes('Planning') || line.includes('plan')) lastPhase = 'PLANNING';

    // Timestamp
    const tsMatch = line.match(/\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]/);
    if (tsMatch) {
      lastTimestamp = tsMatch[1];
    }

    // Loop start
    if (line.includes('Loop started') || line.includes('Stu Loop started')) {
      const startTsMatch = line.match(/\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]/);
      if (startTsMatch) {
        loopStarted = startTsMatch[1];
      }
    }
  }

  // Calculate elapsed time since last activity
  let elapsedSeconds = null;
  if (lastTimestamp) {
    const last = parseTimestamp(lastTimestamp);
    if (last) {
      elapsedSeconds = Math.floor((Date.now() - last.getTime()) / 1000);
    }
  }

  return {
    currentCycle,
    lastPhase,
    lastTimestamp,
    loopStarted,
    elapsedSeconds,
  };
}

// ---------------------------------------------------------------------------
// Validation Result Parser
// ---------------------------------------------------------------------------

/**
 * Search log for the most recent `npm run validate` output and parse results.
 */
function parseLastValidation(logContent) {
  const result = {
    lastRun: null,
    passed: null,
    testCount: null,
    lintErrors: null,
    buildStatus: null,
  };

  // Look for validation-related lines (scan backward through the log)
  const lines = logContent.split('\n');

  let foundValidateBlock = false;

  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];

    // Independent validation markers from stu-loop.sh
    if (line.includes('Independent validation PASSED') || line.includes('validation PASSED')) {
      result.passed = true;
      const tsMatch = line.match(/\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]/);
      if (tsMatch) result.lastRun = tsMatch[1];
      foundValidateBlock = true;
    }

    if (line.includes('Independent validation FAILED') || line.includes('validation FAILED')) {
      result.passed = false;
      const tsMatch = line.match(/\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]/);
      if (tsMatch) result.lastRun = tsMatch[1];
      foundValidateBlock = true;
    }

    // Test count patterns
    const testMatch = line.match(/(\d+)\s+tests?\s+pass/i);
    if (testMatch && !result.testCount) {
      result.testCount = parseInt(testMatch[1], 10);
    }

    // Alternative test count: "Tests: XX passing"
    const altTestMatch = line.match(/Tests?:?\s+(\d+)\s+passing/i);
    if (altTestMatch && !result.testCount) {
      result.testCount = parseInt(altTestMatch[1], 10);
    }

    // Another pattern: "3759 tests"
    const numTestMatch = line.match(/(\d{3,})\s+tests/i);
    if (numTestMatch && !result.testCount) {
      result.testCount = parseInt(numTestMatch[1], 10);
    }

    // Lint errors
    const lintMatch = line.match(/(\d+)\s+(?:lint\s+)?errors?/i);
    if (lintMatch && !result.lintErrors) {
      result.lintErrors = parseInt(lintMatch[1], 10);
    }
    if (line.includes('lint clean') || line.includes('0 errors')) {
      if (result.lintErrors === null) result.lintErrors = 0;
    }

    // Build status
    if (line.includes('build clean') || line.includes('build pass') || line.includes('built in')) {
      if (!result.buildStatus) result.buildStatus = 'passed';
    }
    if (line.includes('build fail') || line.includes('Build failed')) {
      if (!result.buildStatus) result.buildStatus = 'failed';
    }

    // Stop scanning once we've found enough
    if (foundValidateBlock && result.testCount) break;
  }

  // Also check handoff file for VALIDATE_FAILED
  return result;
}

// ---------------------------------------------------------------------------
// Express App
// ---------------------------------------------------------------------------

const app = express();

// Middleware
app.use(express.json());

// CORS for local development
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (_req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Serve static files from ./public
app.use(express.static(PATHS.publicDir));

// ---------------------------------------------------------------------------
// GET /api/health
// ---------------------------------------------------------------------------
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    projectRoot: PROJECT_ROOT,
  });
});

// ---------------------------------------------------------------------------
// GET /api/status — Combined dashboard status
// ---------------------------------------------------------------------------
app.get('/api/status', async (_req, res) => {
  try {
    // Read all sources in parallel
    const [boardContent, logContent, handoffContent] = await Promise.all([
      safeReadFile(PATHS.sprintBoard),
      safeReadFile(PATHS.stuLog),
      safeReadFile(PATHS.lastCycle),
    ]);

    // Parse sprint board
    const sprint = parseSprintBoard(boardContent);

    // Parse loop state from log
    const loop = extractLoopState(logContent);

    // Check if stu-loop.sh is running
    const isRunning = safeExec('pgrep -f stu-loop.sh', '') !== '';

    // Parse last validation
    const validation = parseLastValidation(logContent);

    // Check handoff for VALIDATE_FAILED
    const validateFailed = handoffContent.includes('VALIDATE_FAILED');

    res.json({
      sprint: {
        number: sprint.number,
        name: sprint.name,
        status: sprint.status,
        goal: sprint.goal,
        branch: sprint.branch,
        tasks: sprint.summary,
      },
      loop: {
        running: isRunning,
        currentCycle: loop.currentCycle,
        lastPhase: loop.lastPhase,
        lastActivity: loop.lastTimestamp,
        elapsedSeconds: loop.elapsedSeconds,
        loopStarted: loop.loopStarted,
      },
      validation: {
        ...validation,
        validateFailed,
      },
      handoff: {
        exists: handoffContent.length > 0,
        preview: handoffContent.slice(0, 500),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to build status', details: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/sprint — Parsed sprint board (current sprint)
// ---------------------------------------------------------------------------
app.get('/api/sprint', async (_req, res) => {
  try {
    const content = await safeReadFile(PATHS.sprintBoard);
    if (!content) {
      return res.json({ error: 'Sprint board not found', sprint: null });
    }

    const sprint = parseSprintBoard(content);

    // Group tasks by priority
    const grouped = { P0: [], P1: [], P2: [], other: [] };
    for (const task of sprint.tasks) {
      const tier = task.priority || 'other';
      if (grouped[tier]) {
        grouped[tier].push(task);
      } else {
        grouped.other.push(task);
      }
    }

    res.json({
      ...sprint,
      tasksByPriority: grouped,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to parse sprint board', details: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/log — Tail the stu-loop.log
// ---------------------------------------------------------------------------
app.get('/api/log', async (req, res) => {
  try {
    const numLines = parseInt(req.query.lines, 10) || 100;
    const since = req.query.since || null;

    const content = await safeReadFile(PATHS.stuLog);
    if (!content) {
      return res.json({ lines: [], total: 0 });
    }

    let parsed = parseLogLines(content);

    // Filter by timestamp if 'since' is provided
    if (since) {
      const sinceDate = parseTimestamp(since);
      if (sinceDate) {
        parsed = parsed.filter((line) => {
          if (!line.timestamp) return false;
          const lineDate = parseTimestamp(line.timestamp);
          return lineDate && lineDate > sinceDate;
        });
      }
    } else {
      // Tail to the last N lines
      parsed = parsed.slice(-numLines);
    }

    // Annotate with cycle/agent info
    const annotated = annotateLogLines(parsed);

    res.json({
      lines: annotated,
      total: annotated.length,
      file: PATHS.stuLog,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read log', details: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/log/stream — SSE real-time log streaming
// ---------------------------------------------------------------------------
app.get('/api/log/stream', async (req, res) => {
  // SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  // Send initial keepalive
  res.write('event: connected\ndata: {"status":"connected"}\n\n');

  // Track file position to only send new content
  let lastSize = 0;
  try {
    const fileStat = await stat(PATHS.stuLog);
    lastSize = fileStat.size;
  } catch {
    // File doesn't exist yet, start from 0
    lastSize = 0;
  }

  // Watch for file changes
  let watcher = null;
  let closed = false;

  const sendNewLines = async () => {
    if (closed) return;
    try {
      const fileStat = await stat(PATHS.stuLog);
      const currentSize = fileStat.size;

      if (currentSize > lastSize) {
        // Read only the new portion
        const content = await readFile(PATHS.stuLog, 'utf-8');
        const newContent = content.slice(lastSize);
        lastSize = currentSize;

        const newLines = parseLogLines(newContent);
        const annotated = annotateLogLines(newLines);

        for (const line of annotated) {
          if (!closed) {
            res.write(`data: ${JSON.stringify(line)}\n\n`);
          }
        }
      } else if (currentSize < lastSize) {
        // File was truncated/rotated — reset
        lastSize = 0;
        if (!closed) {
          res.write('event: reset\ndata: {"reason":"file_rotated"}\n\n');
        }
      }
    } catch {
      // File might not exist momentarily
    }
  };

  // Set up fs.watch
  try {
    const { watch: fsWatch } = await import('node:fs');
    watcher = fsWatch(PATHS.stuLog, { persistent: false }, (eventType) => {
      if (eventType === 'change') {
        sendNewLines();
      }
    });

    watcher.on('error', () => {
      // Silently handle watch errors
    });
  } catch {
    // If watch fails, fall back to polling
    const pollInterval = setInterval(sendNewLines, 2000);

    req.on('close', () => {
      closed = true;
      clearInterval(pollInterval);
    });
  }

  // Heartbeat every 30 seconds to keep connection alive
  const heartbeat = setInterval(() => {
    if (!closed) {
      res.write(': heartbeat\n\n');
    }
  }, 30000);

  // Clean up on client disconnect
  req.on('close', () => {
    closed = true;
    clearInterval(heartbeat);
    if (watcher) {
      watcher.close();
    }
  });
});

// ---------------------------------------------------------------------------
// GET /api/diaries — List all diary files with previews
// ---------------------------------------------------------------------------
app.get('/api/diaries', async (_req, res) => {
  try {
    const entries = [];

    for (const role of DIARY_ROLES) {
      const filePath = path.join(PATHS.diaries, `${role}.md`);
      try {
        const fileStat = await stat(filePath);
        const content = await readFile(filePath, 'utf-8');
        const previewLines = content.split('\n').slice(0, 5).join('\n');

        entries.push({
          role,
          file: `${role}.md`,
          path: filePath,
          lastModified: fileStat.mtime.toISOString(),
          size: fileStat.size,
          preview: previewLines,
        });
      } catch {
        // Diary file doesn't exist for this role
      }
    }

    // Also check for any other .md files in the diaries directory
    try {
      const allFiles = await readdir(PATHS.diaries);
      for (const file of allFiles) {
        if (!file.endsWith('.md')) continue;
        const role = file.replace('.md', '');
        if (DIARY_ROLES.includes(role)) continue; // Already handled

        const filePath = path.join(PATHS.diaries, file);
        const fileStat = await stat(filePath);
        const content = await readFile(filePath, 'utf-8');
        const previewLines = content.split('\n').slice(0, 5).join('\n');

        entries.push({
          role,
          file,
          path: filePath,
          lastModified: fileStat.mtime.toISOString(),
          size: fileStat.size,
          preview: previewLines,
        });
      }
    } catch {
      // Diaries directory might not exist
    }

    // Sort by last modified (most recent first)
    entries.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

    res.json({ diaries: entries, count: entries.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list diaries', details: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/diaries/:role — Read a specific diary
// ---------------------------------------------------------------------------
app.get('/api/diaries/:role', async (req, res) => {
  try {
    const role = req.params.role.toUpperCase();
    const filePath = path.join(PATHS.diaries, `${role}.md`);

    const content = await safeReadFile(filePath);
    if (!content) {
      return res.status(404).json({ error: `Diary not found for role: ${role}` });
    }

    let fileStat;
    try {
      fileStat = await stat(filePath);
    } catch {
      fileStat = null;
    }

    res.json({
      role,
      file: `${role}.md`,
      path: filePath,
      lastModified: fileStat ? fileStat.mtime.toISOString() : null,
      content,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read diary', details: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/diaries/PM/note — Add feedback note to PM diary
// ---------------------------------------------------------------------------
app.post('/api/diaries/PM/note', async (req, res) => {
  try {
    const { note, priority = 'NORMAL' } = req.body;

    if (!note || typeof note !== 'string' || note.trim().length === 0) {
      return res.status(400).json({ error: 'Note is required and must be a non-empty string' });
    }

    const validPriorities = ['URGENT', 'HIGH', 'NORMAL'];
    const normalizedPriority = priority.toUpperCase();
    if (!validPriorities.includes(normalizedPriority)) {
      return res.status(400).json({
        error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}`,
      });
    }

    const filePath = path.join(PATHS.diaries, 'PM.md');
    const content = await safeReadFile(filePath);

    if (!content) {
      return res.status(404).json({ error: 'PM diary not found' });
    }

    const timestamp = new Date().toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, '');
    const noteBlock = [
      '',
      `### ${timestamp} - FEEDBACK FROM STU`,
      `**Priority:** ${normalizedPriority}`,
      '',
      note.trim(),
      '',
      '---',
      '',
    ].join('\n');

    // Insert after the first "## Entries" or "## " section header,
    // or after the first "---" if no entries section is found
    let insertPos = -1;

    // Look for an "Entries" section
    const entriesMatch = content.match(/^## .*Entries/im);
    if (entriesMatch) {
      // Insert right after the Entries header line
      insertPos = entriesMatch.index + entriesMatch[0].length;
      // Skip to end of that line
      const nextNewline = content.indexOf('\n', insertPos);
      if (nextNewline !== -1) insertPos = nextNewline + 1;
    }

    // If no Entries section, insert after the first horizontal rule
    if (insertPos === -1) {
      const firstRule = content.indexOf('\n---\n');
      if (firstRule !== -1) {
        insertPos = firstRule + 5;
      }
    }

    // If still no good position, insert after the first heading
    if (insertPos === -1) {
      const firstHeading = content.indexOf('\n#');
      if (firstHeading !== -1) {
        const endOfHeading = content.indexOf('\n', firstHeading + 1);
        insertPos = endOfHeading !== -1 ? endOfHeading + 1 : content.length;
      }
    }

    // Last resort: prepend
    if (insertPos === -1) {
      insertPos = 0;
    }

    const newContent = content.slice(0, insertPos) + noteBlock + content.slice(insertPos);

    await fsWriteFile(filePath, newContent, 'utf-8');

    res.json({
      success: true,
      timestamp,
      priority: normalizedPriority,
      note: note.trim(),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add note', details: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/prs — Open and recently merged PRs
// ---------------------------------------------------------------------------
app.get('/api/prs', async (_req, res) => {
  try {
    // Fetch open PRs
    const openPrsRaw = safeExec(
      'gh pr list --state open --json number,title,state,createdAt,headRefName,author,labels',
      '[]'
    );

    // Fetch recently merged PRs
    const mergedPrsRaw = safeExec(
      'gh pr list --state merged --limit 10 --json number,title,mergedAt,headRefName,author',
      '[]'
    );

    let openPrs = [];
    let mergedPrs = [];

    try {
      openPrs = JSON.parse(openPrsRaw);
    } catch {
      openPrs = [];
    }

    try {
      mergedPrs = JSON.parse(mergedPrsRaw);
    } catch {
      mergedPrs = [];
    }

    // Try to get CI check status for open PRs
    for (const pr of openPrs) {
      try {
        const checksRaw = safeExec(
          `gh pr checks ${pr.number} --json name,state,conclusion 2>/dev/null`,
          '[]'
        );
        pr.checks = JSON.parse(checksRaw);
      } catch {
        pr.checks = [];
      }
    }

    res.json({
      open: openPrs,
      recentlyMerged: mergedPrs,
      openCount: openPrs.length,
      mergedCount: mergedPrs.length,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch PRs', details: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/git/log — Recent git commits
// ---------------------------------------------------------------------------
app.get('/api/git/log', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 30;
    const raw = safeExec(
      `git log --oneline --format='%H|%h|%an|%ae|%s|%cd' --date=iso -${limit}`,
      ''
    );

    if (!raw) {
      return res.json({ commits: [], count: 0 });
    }

    const commits = raw
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const [hash, shortHash, author, email, subject, date] = line.split('|');
        return { hash, shortHash, author, email, subject, date };
      });

    res.json({ commits, count: commits.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get git log', details: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/git/branches — All git branches
// ---------------------------------------------------------------------------
app.get('/api/git/branches', async (_req, res) => {
  try {
    const raw = safeExec(
      "git branch -a --format='%(refname:short)|%(objectname:short)|%(committerdate:iso)'",
      ''
    );

    if (!raw) {
      return res.json({ branches: [], count: 0 });
    }

    const currentBranch = safeExec('git branch --show-current', '');

    const branches = raw
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const [name, commit, date] = line.split('|');
        return {
          name,
          commit,
          date,
          current: name === currentBranch,
          isRemote: name.startsWith('origin/'),
        };
      });

    res.json({
      branches,
      count: branches.length,
      current: currentBranch,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get branches', details: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/validate — Last validation result
// ---------------------------------------------------------------------------
app.get('/api/validate', async (_req, res) => {
  try {
    const [logContent, handoffContent] = await Promise.all([
      safeReadFile(PATHS.stuLog),
      safeReadFile(PATHS.lastCycle),
    ]);

    const result = parseLastValidation(logContent);

    // Check handoff for VALIDATE_FAILED
    if (handoffContent.includes('VALIDATE_FAILED')) {
      result.passed = false;
      result.validateFailedInHandoff = true;
      result.handoffMessage = handoffContent.trim();
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to check validation', details: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/usage — Claude usage info
// ---------------------------------------------------------------------------
app.get('/api/usage', async (_req, res) => {
  try {
    const usageOutput = safeExec('claude usage 2>/dev/null', '');

    if (!usageOutput) {
      // Estimate from log file size
      let logSizeBytes = 0;
      try {
        const logStat = await stat(PATHS.stuLog);
        logSizeBytes = logStat.size;
      } catch {
        // No log file
      }

      return res.json({
        available: false,
        estimate: {
          logFileSizeBytes: logSizeBytes,
          logFileSizeKB: Math.round(logSizeBytes / 1024),
          logFileSizeMB: (logSizeBytes / (1024 * 1024)).toFixed(2),
          note: 'Claude usage command not available. Log file size shown as rough proxy.',
        },
      });
    }

    // Parse the usage output — format varies but typically has lines like:
    // "Total cost: $X.XX"
    // "Total tokens: XXXXX"
    const parsed = {};
    for (const line of usageOutput.split('\n')) {
      const costMatch = line.match(/cost[:\s]+\$?([\d.]+)/i);
      if (costMatch) parsed.totalCost = parseFloat(costMatch[1]);

      const tokenMatch = line.match(/tokens?[:\s]+([\d,]+)/i);
      if (tokenMatch) parsed.totalTokens = parseInt(tokenMatch[1].replace(/,/g, ''), 10);

      // Capture the raw line as well
      if (line.trim()) {
        if (!parsed.rawLines) parsed.rawLines = [];
        parsed.rawLines.push(line.trim());
      }
    }

    res.json({
      available: true,
      ...parsed,
      raw: usageOutput,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get usage info', details: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/game — Game deployment info
// ---------------------------------------------------------------------------
app.get('/api/game', async (_req, res) => {
  try {
    // Get repo info via gh
    const repoInfoRaw = safeExec(
      'gh repo view --json url,homepageUrl,name,owner 2>/dev/null',
      ''
    );

    let repoInfo = {};
    if (repoInfoRaw) {
      try {
        repoInfo = JSON.parse(repoInfoRaw);
      } catch {
        // Fall back to parsing .git/config
      }
    }

    // If gh failed, try parsing .git/config
    if (!repoInfo.url) {
      const gitConfigContent = await safeReadFile(path.join(PROJECT_ROOT, '.git', 'config'));
      const urlMatch = gitConfigContent.match(/url\s*=\s*(.+)/);
      if (urlMatch) {
        repoInfo.url = urlMatch[1].trim();
      }
    }

    // Derive GitHub Pages URL from repo URL
    let pagesUrl = repoInfo.homepageUrl || null;
    if (!pagesUrl && repoInfo.url) {
      // Extract owner and repo name from URL
      const ghMatch = repoInfo.url.match(/github\.com[/:]([^/]+)\/([^/.]+)/);
      if (ghMatch) {
        pagesUrl = `https://${ghMatch[1]}.github.io/${ghMatch[2]}/`;
      }
    }

    // Check if dist/ exists (build output)
    let buildExists = false;
    let buildInfo = null;
    try {
      const distStat = await stat(PATHS.dist);
      buildExists = distStat.isDirectory();
      if (buildExists) {
        // Get basic info about the build
        const distFiles = await readdir(PATHS.dist);
        buildInfo = {
          fileCount: distFiles.length,
          lastModified: distStat.mtime.toISOString(),
        };
      }
    } catch {
      // No dist directory
    }

    res.json({
      repoUrl: repoInfo.url || null,
      deploymentUrl: pagesUrl,
      homepageUrl: repoInfo.homepageUrl || null,
      repoName: repoInfo.name || null,
      repoOwner: repoInfo.owner?.login || null,
      buildExists,
      buildInfo,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get game info', details: err.message });
  }
});

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Compatibility routes — bridge frontend API paths to backend handlers
// ---------------------------------------------------------------------------

// /api/tasks → transform /api/sprint response
app.get('/api/tasks', async (_req, res) => {
  try {
    const content = await safeReadFile(PATHS.sprintBoard);
    if (!content) return res.json({ tasks: [] });
    const sprint = parseSprintBoard(content);
    res.json({ tasks: sprint.tasks || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get tasks', details: err.message });
  }
});

// /api/commits → alias for /api/git/log
app.get('/api/commits', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 30;
    const raw = safeExec(
      `git log --oneline --format='%H|%h|%an|%ae|%s|%cd' --date=iso -${limit}`,
      ''
    );
    if (!raw) return res.json({ commits: [], count: 0 });
    const commits = raw.split('\n').filter(Boolean).map((line) => {
      const [hash, shortHash, author, email, subject, date] = line.split('|');
      return { hash, shortHash, author, email, subject, date };
    });
    res.json({ commits, count: commits.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get commits', details: err.message });
  }
});

// /api/status/links → alias for /api/game
app.get('/api/status/links', async (_req, res) => {
  try {
    const repoInfoRaw = safeExec('gh repo view --json url,homepageUrl,name,owner 2>/dev/null', '');
    let repoInfo = {};
    if (repoInfoRaw) { try { repoInfo = JSON.parse(repoInfoRaw); } catch { /* ignore */ } }
    if (!repoInfo.url) {
      const gitConfigContent = await safeReadFile(path.join(PROJECT_ROOT, '.git', 'config'));
      const urlMatch = gitConfigContent.match(/url\s*=\s*(.+)/);
      if (urlMatch) repoInfo.url = urlMatch[1].trim();
    }
    let pagesUrl = repoInfo.homepageUrl || null;
    if (!pagesUrl && repoInfo.url) {
      const ghMatch = repoInfo.url.match(/github\.com[/:]([^/]+)\/([^/.]+)/);
      if (ghMatch) pagesUrl = `https://${ghMatch[1]}.github.io/${ghMatch[2]}/`;
    }
    res.json({
      deploymentUrl: pagesUrl,
      repoUrl: repoInfo.url || null,
      repoName: repoInfo.name || null,
      repoOwner: repoInfo.owner?.login || null,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get links', details: err.message });
  }
});

// /api/handoff → read last-cycle.md directly
app.get('/api/handoff', async (_req, res) => {
  try {
    const content = await safeReadFile(PATHS.lastCycle);
    res.type('text/plain').send(content || '');
  } catch (err) {
    res.status(500).json({ error: 'Failed to read handoff', details: err.message });
  }
});

// /api/logs/stream → alias for /api/log/stream (handled by the existing SSE endpoint)
// /api/logs/recent → alias for /api/log
app.get('/api/logs/recent', async (req, res) => {
  try {
    const numLines = parseInt(req.query.lines, 10) || 100;
    const content = await safeReadFile(PATHS.stuLog);
    if (!content) return res.json({ lines: [], total: 0 });
    let parsed = parseLogLines(content);
    parsed = parsed.slice(-numLines);
    const annotated = annotateLogLines(parsed);
    // Return lines as simple strings for the frontend
    const lineStrings = annotated.map(l => l.raw || l.content || l.text || JSON.stringify(l));
    res.json({ lines: lineStrings, total: lineStrings.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read logs', details: err.message });
  }
});

// SSE alias: /api/logs/stream → same as /api/log/stream
app.get('/api/logs/stream', async (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });
  res.write('event: connected\ndata: {"status":"connected"}\n\n');
  let lastSize = 0;
  try { const s = await stat(PATHS.stuLog); lastSize = s.size; } catch { lastSize = 0; }
  let closed = false;
  const sendNewLines = async () => {
    if (closed) return;
    try {
      const s = await stat(PATHS.stuLog);
      if (s.size > lastSize) {
        const content = await readFile(PATHS.stuLog, 'utf-8');
        const newContent = content.slice(lastSize);
        lastSize = s.size;
        const newLines = newContent.split('\n').filter(Boolean);
        for (const line of newLines) {
          if (!closed) res.write(`data: ${line}\n\n`);
        }
      } else if (s.size < lastSize) {
        lastSize = 0;
      }
    } catch { /* ignore */ }
  };
  const poll = setInterval(sendNewLines, 2000);
  const heartbeat = setInterval(() => { if (!closed) res.write(': heartbeat\n\n'); }, 30000);
  req.on('close', () => { closed = true; clearInterval(poll); clearInterval(heartbeat); });
});

// /api/diaries/PM/entries → parse PM diary entries
app.get('/api/diaries/PM/entries', async (_req, res) => {
  try {
    const content = await safeReadFile(path.join(PATHS.diaries, 'PM.md'));
    if (!content) return res.json({ entries: [] });
    // Extract entries: split on ### headers
    const parts = content.split(/^###\s+/m).slice(1);
    const entries = parts.slice(0, 5).map(part => {
      const lines = part.split('\n');
      const title = lines[0] || '';
      const body = lines.slice(1).join('\n').trim();
      return { title: title.trim(), body };
    });
    res.json({ entries });
  } catch (err) {
    res.status(500).json({ error: 'Failed', details: err.message });
  }
});

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

// 404 for unknown API routes
app.use('/api/*path', (_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------

const HOST = '0.0.0.0';
const localIP = safeExec("ipconfig getifaddr en0 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}'", 'localhost').trim() || 'localhost';

app.listen(PORT, HOST, () => {
  const networkUrl = `http://${localIP}:${PORT}`;
  console.log('');
  console.log('=======================================================');
  console.log('  SPIRE ASCENT — MISSION CONTROL');
  console.log('  Stu Loop Monitor Dashboard');
  console.log('=======================================================');
  console.log(`  Local:      http://localhost:${PORT}`);
  console.log(`  Network:    ${networkUrl}`);
  console.log(`  API:        http://localhost:${PORT}/api/health`);
  console.log(`  Project:    ${PROJECT_ROOT}`);
  console.log('=======================================================');
  console.log('');
  console.log('  Scan to open on your phone:');
  console.log('');
  qrcode.generate(networkUrl, { small: true }, (code) => {
    console.log(code);
    console.log('=======================================================');
    console.log('');
  });
});

export default app;
