#!/usr/bin/env node

/**
 * Diary Hygiene Check (QA-18)
 *
 * Checks that team diary files have been updated in the current sprint.
 * Compares diary modification dates against the sprint branch creation.
 *
 * Usage:
 *   node scripts/check-diary-freshness.js [--strict]
 *
 * Exit codes:
 *   0 - All diaries fresh, or warnings only (default mode)
 *   1 - Stale diaries found (--strict mode only)
 */

import { execSync } from 'child_process';
import { statSync } from 'fs';
import { join } from 'path';

const DIARY_DIR = 'docs/diaries';
const ACTIVE_ROLES = ['PM', 'BE', 'JR', 'AR', 'UX', 'GD', 'QA', 'VARROW'];
const ARCHIVED_ROLES = ['SL']; // SL archived in Sprint 12
const strict = process.argv.includes('--strict');

function getSprintBranch() {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
    const match = branch.match(/^sprint-(\d+)$/);
    if (match) return { branch, sprintNum: parseInt(match[1]) };

    // If on a task branch, find the base sprint branch
    const remote = execSync('git branch -r --list "origin/sprint-*" --sort=-committerdate', { encoding: 'utf-8' }).trim();
    const first = remote.split('\n')[0]?.trim()?.replace('origin/', '');
    if (first) {
      const m = first.match(/^sprint-(\d+)$/);
      if (m) return { branch: first, sprintNum: parseInt(m[1]) };
    }
  } catch {
    // ignore
  }
  return null;
}

function getDiaryModifiedInBranch(diaryFile, baseBranch) {
  try {
    // Check if the diary file has been modified in commits on this branch vs master
    const diff = execSync(
      `git diff --name-only master...HEAD -- "${diaryFile}"`,
      { encoding: 'utf-8' }
    ).trim();
    return diff.length > 0;
  } catch {
    // Fallback: check git log for recent modifications
    try {
      const log = execSync(
        `git log --oneline -1 --since="7 days ago" -- "${diaryFile}"`,
        { encoding: 'utf-8' }
      ).trim();
      return log.length > 0;
    } catch {
      return false;
    }
  }
}

function checkSprintMentionInDiary(diaryFile, sprintNum) {
  try {
    const content = execSync(`cat "${diaryFile}"`, { encoding: 'utf-8' });
    return content.includes(`Sprint ${sprintNum}`);
  } catch {
    return false;
  }
}

// Main
const sprint = getSprintBranch();
const sprintLabel = sprint ? `Sprint ${sprint.sprintNum}` : 'current sprint';

console.log(`\n📋 Diary Hygiene Check — ${sprintLabel}`);
console.log('='.repeat(50));

const stale = [];
const fresh = [];
const archived = [];

for (const role of ACTIVE_ROLES) {
  const diaryPath = join(DIARY_DIR, `${role}.md`);

  try {
    statSync(diaryPath);
  } catch {
    stale.push({ role, reason: 'file missing' });
    continue;
  }

  const modifiedInBranch = getDiaryModifiedInBranch(diaryPath, sprint?.branch);
  const mentionsSprint = sprint ? checkSprintMentionInDiary(diaryPath, sprint.sprintNum) : true;

  if (modifiedInBranch && mentionsSprint) {
    fresh.push(role);
  } else if (mentionsSprint) {
    fresh.push(role); // Has sprint content even if not modified in this exact branch
  } else {
    stale.push({ role, reason: `no ${sprintLabel} entries found` });
  }
}

for (const role of ARCHIVED_ROLES) {
  archived.push(role);
}

// Output
if (fresh.length > 0) {
  console.log(`\n✅ Fresh (${fresh.length}): ${fresh.join(', ')}`);
}

if (archived.length > 0) {
  console.log(`\n📦 Archived (${archived.length}): ${archived.join(', ')}`);
}

if (stale.length > 0) {
  console.log(`\n⚠️  Stale (${stale.length}):`);
  for (const { role, reason } of stale) {
    console.log(`   - ${role}: ${reason}`);
  }
}

console.log('');

if (stale.length === 0) {
  console.log('All active diaries are up to date.');
  process.exit(0);
} else {
  const msg = `${stale.length} diary/diaries need updating for ${sprintLabel}.`;
  if (strict) {
    console.log(`❌ ${msg}`);
    process.exit(1);
  } else {
    console.log(`⚠️  ${msg} (warning only — use --strict to fail)`);
    process.exit(0);
  }
}
