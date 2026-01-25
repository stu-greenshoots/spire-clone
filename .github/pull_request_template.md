## {TASK-ID}: {Title}

### What
{1-2 sentence summary of the change}

### Why
{What problem does this solve or what feature does it add}

### How
{Brief description of approach taken}

### Files Changed
- `path/to/file.js` - {what changed}

### Testing
- [ ] `npm run validate` passes locally
- [ ] New tests added for new functionality
- [ ] E2E tests updated if UI/gameplay changed (`npm run test:e2e`)
- [ ] Manual smoke test performed (describe below)

### E2E Test Coverage
{If this PR changes gameplay or UI, describe which E2E tests cover it. If new tests were added, list them.}
- E2E screenshots: Check CI artifacts for `e2e-screenshots` after push

### Smoke Test Results
{What did you actually click/try in the running game? What did you verify works?}

### Checklist
- [ ] Branch follows naming convention (`task-id-description`)
- [ ] Commit messages prefixed with task ID
- [ ] No new files over 500 lines
- [ ] No TODO/FIXME without task reference
- [ ] No unused imports/variables (lint clean)
- [ ] PR is under 300 lines changed
- [ ] All Copilot HIGH/MEDIUM findings addressed
