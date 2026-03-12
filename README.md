# Mission Control V2 Dashboard

Real-time operations overview for Chris's hospitality + property management operations.

## Features

- **Real-time updates** via Server-Sent Events (SSE) — dashboard refreshes every 2 seconds
- **Unified data view** — aggregates properties, tasks, team status, alerts in one place
- **Zero dependencies** — vanilla JavaScript, works instantly with Node.js
- **Responsive design** — works on desktop, tablet, mobile
- **Live alerting** — critical issues highlighted with color-coded severity

## What It Shows

### Properties Dashboard
- Total occupancy (22 of 30 properties)
- Top performers by revenue & occupancy
- Active alerts (maintenance, bookings, guest issues)

### Team Status
- Operational health
- Current blockers (waiting on handyman, owner response, etc.)
- Active team members

### Today's Tasks
- Tasks due today from TASKS.md (checked ✓ vs open ☐)
- Upcoming deadlines
- Operations brief schedule (8 AM EST)

### Financial
- Month-to-date revenue
- Target vs actual
- Maintenance budget remaining

### Active Alerts
High/Medium/Low severity with property name, issue, and current status.

## Quick Start

```bash
cd /data/.openclaw/workspace/projects/dashboard-deploy
node server.js
```

Then open: **http://localhost:3000**

The dashboard will start pulling data from:
- `TASKS.md` — your daily task list
- `memory/YYYY-MM-DD.md` — today's notes
- Property status (currently mock data, integrate your dashboards)

## API Endpoints

### `/api/dashboard` (JSON)
Single API call gets all dashboard data:
```bash
curl http://localhost:3000/api/dashboard | jq
```

Response includes: properties, team, tasks, alerts, financial, brief schedule.

### `/api/stream` (Server-Sent Events)
Real-time feed (auto-updates every 2 seconds):
```bash
curl -N http://localhost:3000/api/stream
```

Use this for live dashboards or integrations.

### `/` (HTML Dashboard)
Visit http://localhost:3000 for the interactive UI.

## Customization

### Adding New Data Sources

Edit `getDashboardData()` in `server.js` to add new metrics:

```javascript
function getDashboardData() {
  return {
    // ... existing
    myNewMetric: {
      value: 'pulled from somewhere',
      updated: new Date().toISOString()
    }
  };
}
```

### Changing Alert Thresholds

In `getDashboardData()`, update the `properties.alerting` array:

```javascript
alerting: [
  { 
    property: 'Unit Name', 
    issue: 'Description',
    severity: 'high|medium|low',
    status: 'open|investigating|resolved'
  }
]
```

### Integration with Property Dashboards

Replace the mock data with API calls to:
- Property management system (Airbnb, VRBO, etc.)
- Booking engine
- Guest review system
- Maintenance queue

Example:
```javascript
async function getPropertyStatus() {
  const response = await fetch('https://your-property-api.com/status');
  return response.json();
}
```

## Daily Operations Brief Integration

The dashboard shows when the ops brief is scheduled (8 AM EST). The brief pulls:
1. **Due today** from TASKS.md
2. **Blockers** from this dashboard
3. **Context** from memory/YYYY-MM-DD.md
4. **Financial** snapshot

Create a separate script to post the brief to #ops Slack channel at 8 AM.

## Future Enhancements

- [ ] Database storage (SQLite for history)
- [ ] Historical trending (revenue, occupancy over time)
- [ ] Automated alerts (Slack, email)
- [ ] Slack integration (two-way sync)
- [ ] Mobile app
- [ ] Multi-property drill-down
- [ ] Guest communication timeline
- [ ] Team capacity planning
- [ ] Predictive maintenance alerts
- [ ] Revenue optimization recommendations

## Architecture

```
Server (Node.js)
├── getTasksFromFile() — reads TASKS.md
├── getMemorySnippet() — reads daily memory
├── getDashboardData() — aggregates all sources
└── HTML + SSE stream

Browser
├── Real-time updates via EventSource
├── JSON parsing
└── DOM updates every 2s
```

**No build step, no webpack, no npm install needed** — just run it.

## Troubleshooting

**Dashboard not updating?**
- Check browser console (F12) for errors
- Verify TASKS.md exists at `/data/.openclaw/workspace/TASKS.md`
- Look for "Error reading TASKS.md" in server logs

**Port already in use?**
```bash
PORT=3001 node server.js
```

**Data is stale?**
- Check `last-update` timestamp in header
- SSE updates every 2s — if not happening, check server logs
- Restart the server

## Monitoring

The dashboard is designed for passive monitoring. Run it in a tmux window or background:

```bash
# In a tmux session
tmux new-session -d -s mission-control 'cd /data/.openclaw/workspace/projects/dashboard-deploy && node server.js'

# View logs
tmux capture-pane -t mission-control -p
```

Or as a systemd service (if deployed to a server).

## Files

- `server.js` — Node.js server + API + HTML dashboard
- `package.json` — Node.js metadata
- `README.md` — this file

That's it. No node_modules needed (uses built-in Node modules only).

---

**Next:** Daily Slack Operations Brief will use this API to generate summaries at 8 AM EST.
