# Spire Ascent Project Dashboard

A comprehensive web-based dashboard for viewing project status, team diaries, sprint progress, and git commits.

## Features

- 📊 **Sprint Board** - Jira-style kanban view of all tasks (P0, P1, P2)
- 📝 **Team Diaries** - View all 9 team member diaries (PM, BE, JR, AR, UX, GD, QA, SL, Varrow)
- 📄 **Project Files** - Quick access to all important documentation
- 🔄 **Recent Commits** - Real-time git commit history
- 📈 **Sprint Progress** - Visual progress tracking with stats
- 🔍 **Search** - Search across tasks, diaries, and files
- 📱 **Responsive** - Works on desktop, tablet, and mobile

## Quick Start

### Option 1: Static Dashboard (No Server)

Simply open the HTML file directly:

```bash
cd /root/spire-clone
open dashboard.html  # macOS
xdg-open dashboard.html  # Linux
# Or just double-click dashboard.html in your file explorer
```

**Limitations:** Shows static data only, cannot load actual diary/file contents.

### Option 2: Enhanced Dashboard (With Server) ✨ Recommended

Run the Python server for full functionality including live data loading:

```bash
cd /root/spire-clone
python3 serve-dashboard.py
```

Then open your browser to:
```
http://localhost:8080/dashboard-enhanced.html
```

**Benefits:**
- ✅ Load actual diary contents with markdown rendering
- ✅ View full project files with syntax highlighting
- ✅ Live git commit history with author and time info
- ✅ Real-time sprint status

## Files

| File | Description |
|------|-------------|
| `dashboard.html` | Static dashboard with embedded data |
| `dashboard-enhanced.html` | Enhanced dashboard with API integration |
| `serve-dashboard.py` | Python HTTP server with API endpoints |
| `DASHBOARD_README.md` | This file |

## API Endpoints

When running with `serve-dashboard.py`, the following endpoints are available:

| Endpoint | Description | Parameters |
|----------|-------------|------------|
| `/api/diary` | Load diary content | `?file=PM.md` |
| `/api/file` | Load project file | `?name=ROADMAP.md` |
| `/api/commits` | Git commit history | None |
| `/api/sprint-status` | Current sprint info | None |

## Customization

### Adding New Tasks

Edit the `tasks` array in the JavaScript section:

```javascript
const tasks = [
    {
        id: 'TASK-ID',
        title: 'Task title',
        owner: 'PM',
        size: 'M',
        priority: 'P0',
        status: 'TODO',
        pr: '#123' // optional
    },
    // ... more tasks
];
```

### Adding New Diaries

Edit the `diaries` array:

```javascript
const diaries = [
    {
        role: 'ROLE',
        file: 'ROLE.md',
        title: 'Role Title',
        description: 'Role description'
    },
    // ... more diaries
];
```

### Adding New Files

Edit the `projectFiles` array:

```javascript
const projectFiles = [
    {
        name: 'FILE.md',
        icon: '📋',
        desc: 'File description',
        category: 'Category'
    },
    // ... more files
];
```

## Technologies Used

- **HTML5** - Structure
- **CSS3** - Styling with CSS Variables
- **JavaScript** - Interactive functionality
- **Python 3** - HTTP server and API
- **Marked.js** - Markdown rendering (CDN)

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Troubleshooting

### Port 8080 already in use

Change the port in `serve-dashboard.py`:

```python
PORT = 8081  # or any available port
```

### Dashboard shows "Failed to load"

1. Make sure the server is running: `python3 serve-dashboard.py`
2. Check you're accessing the enhanced version: `http://localhost:8080/dashboard-enhanced.html`
3. Check browser console for errors (F12)

### Markdown not rendering

The enhanced dashboard requires `marked.js` from CDN. Check your internet connection.

## Sprint 12 Status

Current sprint progress as of last update:

- **Tasks Complete:** 12/15 (80%)
- **P0 Tasks:** 6/6 ✅ (100%)
- **P1 Tasks:** 6/6 ✅ (100%)
- **P2 Tasks:** 0/3 (0%)

### Completed Tasks
- PM-12: Sprint setup & diary enforcement
- BE-25: Heart boss infrastructure (#138)
- JR-10: Heart boss implementation (#139)
- VARROW-07: Heart narrative (#140)
- UX-24: Boss dialogue rendering (#141)
- GD-19: Animated boss sprites (#142)
- BE-26: Heart unlock gate (#143)
- QA-17: Heart regression tests (#144)
- AR-12: Heart audio (#145)
- GD-20: Heart art (pre-existing)
- JR-11: Heart card interactions (#146)
- UX-25: Updated self-assessment (#147)

### Remaining Tasks
- VARROW-08: Character-specific Heart dialogue (P2)
- QA-18: Diary hygiene automation (P2)
- GD-21: Act differentiation backgrounds (P2)

## License

Internal project dashboard for Spire Ascent development team.

## Support

For issues or questions about the dashboard, contact PM or create an issue.

---

**Last Updated:** 2026-02-01
**Dashboard Version:** 1.0
**Sprint:** 12 (The Heart + Endgame + Score 90+)
