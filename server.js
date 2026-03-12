#!/usr/bin/env node

/**
 * Mission Control V2 Dashboard Server
 * Real-time operations overview with SSE feeds
 * 
 * Usage: node server.js
 * Access: http://localhost:3000
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const PORT = process.env.PORT || 3000;

// ============================================================================
// DATA AGGREGATION
// ============================================================================

function getTasksFromFile() {
  try {
    const tasksPath = '/data/.openclaw/workspace/TASKS.md';
    if (!fs.existsSync(tasksPath)) return [];
    
    const content = fs.readFileSync(tasksPath, 'utf8');
    const tasks = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      // Parse markdown tasks: - [ ] Task name or - [x] Task name
      const match = line.match(/^-\s+\[([ x])\]\s+(.+)/i);
      if (match) {
        tasks.push({
          text: match[2].trim(),
          done: match[1].toLowerCase() === 'x',
          dueToday: true // simplified for MVP
        });
      }
    }
    return tasks;
  } catch (e) {
    console.error('Error reading TASKS.md:', e.message);
    return [];
  }
}

function getMemorySnippet() {
  try {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const memPath = `/data/.openclaw/workspace/memory/${dateStr}.md`;
    
    if (!fs.existsSync(memPath)) return '';
    return fs.readFileSync(memPath, 'utf8').slice(0, 500); // first 500 chars
  } catch (e) {
    return '';
  }
}

function getDashboardData() {
  return {
    timestamp: new Date().toISOString(),
    properties: {
      total: 30,
      occupied: 22,
      maintenance: 3,
      vacant: 5,
      topPerformers: [
        { name: 'Daytona Unit 1', occupancy: 95, revenue: '$4200' },
        { name: 'Pompano Duplex', occupancy: 92, revenue: '$3800' },
        { name: 'Daytona Unit 3', occupancy: 88, revenue: '$3400' }
      ],
      alerting: [
        { property: 'Daytona Unit 5', issue: 'AC failure', severity: 'high', status: 'open' },
        { property: 'Daytona Unit 7', issue: 'Guest complaint - noise', severity: 'medium', status: 'investigating' },
        { property: 'Pompano Unit 2', issue: 'Booking engine sync issue', severity: 'high', status: 'open' }
      ]
    },
    team: {
      status: 'All systems green',
      activeMembers: 4,
      blockers: [
        'Awaiting handyman availability for Unit 5 AC repair',
        'Guest communication delay on Unit 7 (owner not responding)'
      ]
    },
    tasks: {
      due_today: getTasksFromFile().filter(t => !t.done),
      completed_today: getTasksFromFile().filter(t => t.done),
      upcoming: [
        'Weekly property inspection schedule',
        'Subscription audit (3 renewals due)',
        'Partner meeting with Alex (Friday 2 PM)'
      ]
    },
    memory: {
      snippet: getMemorySnippet(),
      lastUpdated: new Date().toISOString()
    },
    financial: {
      mtd_revenue: '$42500',
      mtd_target: '$50000',
      maintenance_budget_remaining: '$3200',
      subscription_audit_pending: true
    },
    operations_brief_scheduled: '2026-03-13T08:00:00-04:00',
    next_tasks: [
      'Review guest feedback from past 24h',
      'Confirm handyman for Daytona Unit 5',
      'Check booking pipeline for next 7 days',
      'Audit new subscriptions (March 12)'
    ]
  };
}

// ============================================================================
// HTTP SERVER
// ============================================================================

const server = http.createServer((req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Unified API endpoint
  if (pathname === '/api/dashboard') {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify(getDashboardData(), null, 2));
    return;
  }
  
  // SSE real-time feed
  if (pathname === '/api/stream') {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.writeHead(200);
    
    // Send initial data
    res.write(`data: ${JSON.stringify(getDashboardData())}\n\n`);
    
    // Send updates every 2 seconds
    const interval = setInterval(() => {
      res.write(`data: ${JSON.stringify(getDashboardData())}\n\n`);
    }, 2000);
    
    req.on('close', () => {
      clearInterval(interval);
    });
    return;
  }
  
  // Serve HTML dashboard
  if (pathname === '/' || pathname === '/index.html') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.writeHead(200);
    res.end(getDashboardHTML());
    return;
  }
  
  // 404
  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`🎛️  Mission Control V2 Dashboard running at http://localhost:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api/dashboard`);
  console.log(`   SSE: http://localhost:${PORT}/api/stream`);
  console.log(`   Dashboard: http://localhost:${PORT}/`);
});

// ============================================================================
// HTML DASHBOARD
// ============================================================================

function getDashboardHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🎛️ Mission Control V2 - Chris's Operations</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      background: #0f1419;
      color: #e0e0e0;
      overflow: hidden;
    }
    
    header {
      background: linear-gradient(135deg, #1a1f2e 0%, #232d3d 100%);
      padding: 20px 30px;
      border-bottom: 2px solid #00d4ff;
      box-shadow: 0 4px 12px rgba(0, 212, 255, 0.15);
    }
    
    h1 {
      font-size: 28px;
      font-weight: 600;
      letter-spacing: 1px;
    }
    
    .status-line {
      font-size: 12px;
      color: #00d4ff;
      margin-top: 8px;
    }
    
    .status-ok {
      color: #00ff41;
    }
    
    .status-warning {
      color: #ffaa00;
    }
    
    .status-critical {
      color: #ff2e4e;
    }
    
    .container {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      padding: 20px 30px;
      height: calc(100vh - 100px);
      overflow-y: auto;
    }
    
    .card {
      background: #1a1f2e;
      border: 1px solid #2a3d52;
      border-radius: 8px;
      padding: 20px;
      backdrop-filter: blur(10px);
    }
    
    .card h2 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #00d4ff;
      border-bottom: 1px solid #2a3d52;
      padding-bottom: 12px;
    }
    
    .card h3 {
      font-size: 14px;
      font-weight: 500;
      margin: 12px 0 6px 0;
      color: #a0a0a0;
    }
    
    .metric {
      font-size: 24px;
      font-weight: bold;
      color: #00ff41;
      margin-bottom: 4px;
    }
    
    .metric-label {
      font-size: 12px;
      color: #606060;
    }
    
    .item {
      background: #0f1419;
      border-left: 3px solid #00d4ff;
      padding: 10px 12px;
      margin: 8px 0;
      border-radius: 4px;
      font-size: 13px;
    }
    
    .item.alert-high {
      border-left-color: #ff2e4e;
    }
    
    .item.alert-medium {
      border-left-color: #ffaa00;
    }
    
    .item.alert-low {
      border-left-color: #00d4ff;
    }
    
    .item-title {
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .item-detail {
      font-size: 12px;
      color: #808080;
    }
    
    .refresh-time {
      font-size: 11px;
      color: #606060;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #2a3d52;
    }
    
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    
    .stat-box {
      background: #0f1419;
      padding: 12px;
      border-radius: 4px;
      border: 1px solid #2a3d52;
    }
    
    .stat-label {
      font-size: 11px;
      color: #808080;
      margin-bottom: 4px;
    }
    
    .stat-value {
      font-size: 18px;
      font-weight: bold;
      color: #00ff41;
    }
    
    .progress-bar {
      height: 6px;
      background: #0a0d11;
      border-radius: 3px;
      overflow: hidden;
      margin: 8px 0;
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #00d4ff, #00ff41);
      border-radius: 3px;
    }
    
    @media (max-width: 1600px) {
      .container {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    
    @media (max-width: 1200px) {
      .container {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    
    @media (max-width: 800px) {
      .container {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <header>
    <h1>🎛️ Mission Control V2</h1>
    <div class="status-line">
      <span id="live-status" class="status-ok">● Live</span> | 
      Last update: <span id="last-update">--:--:--</span> | 
      <span id="alert-count" class="status-critical">0 Alerts</span>
    </div>
  </header>
  
  <div class="container">
    <!-- Properties Status -->
    <div class="card">
      <h2>🏠 Properties Overview</h2>
      <div class="grid-2">
        <div class="stat-box">
          <div class="stat-label">Total Properties</div>
          <div class="stat-value" id="prop-total">30</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Occupied</div>
          <div class="stat-value" id="prop-occupied">22</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Maintenance</div>
          <div class="stat-value" id="prop-maintenance" style="color: #ffaa00;">3</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Vacant</div>
          <div class="stat-value" id="prop-vacant">5</div>
        </div>
      </div>
      <h3>Top Performers</h3>
      <div id="top-performers"></div>
      <div class="refresh-time" id="prop-refresh"></div>
    </div>
    
    <!-- Alerts & Issues -->
    <div class="card">
      <h2>⚠️ Active Alerts</h2>
      <div id="alerts-list"></div>
      <div class="refresh-time" id="alerts-refresh"></div>
    </div>
    
    <!-- Team Status -->
    <div class="card">
      <h2>👥 Team Status</h2>
      <h3>Operational Status</h3>
      <div id="team-status" class="item alert-low"></div>
      <h3>Blockers</h3>
      <div id="team-blockers"></div>
      <div class="refresh-time" id="team-refresh"></div>
    </div>
    
    <!-- Today's Tasks -->
    <div class="card">
      <h2>📋 Today's Tasks</h2>
      <h3>Due Today</h3>
      <div id="due-today"></div>
      <h3>Completed</h3>
      <div id="completed"></div>
      <div class="refresh-time" id="tasks-refresh"></div>
    </div>
    
    <!-- Upcoming -->
    <div class="card">
      <h2>📅 Upcoming</h2>
      <div id="upcoming"></div>
      <div class="refresh-time" id="upcoming-refresh"></div>
    </div>
    
    <!-- Financial -->
    <div class="card">
      <h2>💰 Financial</h2>
      <div class="grid-2">
        <div class="stat-box">
          <div class="stat-label">MTD Revenue</div>
          <div class="stat-value" id="fin-revenue">--</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">MTD Target</div>
          <div class="stat-value" id="fin-target">--</div>
        </div>
      </div>
      <h3>Maintenance Budget</h3>
      <div id="maintenance-budget"></div>
      <div class="refresh-time" id="fin-refresh"></div>
    </div>
    
    <!-- Operations Brief Schedule -->
    <div class="card">
      <h2>📢 Operations Brief</h2>
      <h3>Scheduled</h3>
      <div id="brief-schedule" class="item"></div>
      <h3>Next Critical Tasks</h3>
      <div id="brief-tasks"></div>
      <div class="refresh-time" id="brief-refresh"></div>
    </div>
  </div>
  
  <script>
    function updateDashboard(data) {
      const now = new Date();
      document.getElementById('last-update').textContent = now.toLocaleTimeString();
      
      // Properties
      document.getElementById('prop-total').textContent = data.properties.total;
      document.getElementById('prop-occupied').textContent = data.properties.occupied;
      document.getElementById('prop-maintenance').textContent = data.properties.maintenance;
      document.getElementById('prop-vacant').textContent = data.properties.vacant;
      
      // Top Performers
      const topHTML = data.properties.topPerformers.map(p => 
        \`<div class="item">
          <div class="item-title">\${p.name}</div>
          <div class="item-detail">Occupancy: \${p.occupancy}% | \${p.revenue}</div>
        </div>\`
      ).join('');
      document.getElementById('top-performers').innerHTML = topHTML;
      
      // Alerts
      const alertCount = data.properties.alerting.length;
      document.getElementById('alert-count').textContent = \`\${alertCount} Alert\${alertCount !== 1 ? 's' : ''}\`;
      
      const alertsHTML = data.properties.alerting.map(a => {
        const severity = a.severity === 'high' ? 'alert-high' : 'alert-medium';
        return \`<div class="item \${severity}">
          <div class="item-title">\${a.property}</div>
          <div class="item-detail">\${a.issue} • Status: \${a.status}</div>
        </div>\`;
      }).join('');
      document.getElementById('alerts-list').innerHTML = alertsHTML;
      
      // Team Status
      document.getElementById('team-status').innerHTML = data.team.status;
      const blockersHTML = data.team.blockers.map(b => 
        \`<div class="item alert-medium">
          <div class="item-detail">\${b}</div>
        </div>\`
      ).join('');
      document.getElementById('team-blockers').innerHTML = blockersHTML;
      
      // Tasks
      const dueHTML = data.tasks.due_today.map(t => 
        \`<div class="item"><div class="item-detail">☐ \${t.text}</div></div>\`
      ).join('');
      document.getElementById('due-today').innerHTML = dueHTML || '<div class="item"><em>No tasks due</em></div>';
      
      const completedHTML = data.tasks.completed_today.map(t => 
        \`<div class="item"><div class="item-detail">✓ \${t.text}</div></div>\`
      ).join('');
      document.getElementById('completed').innerHTML = completedHTML || '<div class="item"><em>None yet</em></div>';
      
      // Upcoming
      const upcomingHTML = data.tasks.upcoming.map(u => 
        \`<div class="item"><div class="item-detail">→ \${u}</div></div>\`
      ).join('');
      document.getElementById('upcoming').innerHTML = upcomingHTML;
      
      // Financial
      document.getElementById('fin-revenue').textContent = data.financial.mtd_revenue;
      document.getElementById('fin-target').textContent = data.financial.mtd_target;
      document.getElementById('maintenance-budget').innerHTML = 
        \`<div class="stat-box"><div class="stat-label">Remaining</div>
        <div class="stat-value">\${data.financial.maintenance_budget_remaining}</div></div>\`;
      
      // Brief Schedule
      const briefDate = new Date(data.operations_brief_scheduled);
      document.getElementById('brief-schedule').innerHTML = 
        \`📅 \${briefDate.toLocaleString()}\`;
      
      const tasksHTML = data.next_tasks.map(t => 
        \`<div class="item alert-low"><div class="item-detail">▪ \${t}</div></div>\`
      ).join('');
      document.getElementById('brief-tasks').innerHTML = tasksHTML;
    }
    
    // Connect to SSE stream
    const eventSource = new EventSource('/api/stream');
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        updateDashboard(data);
      } catch (e) {
        console.error('Parse error:', e);
      }
    };
    
    eventSource.onerror = (event) => {
      document.getElementById('live-status').textContent = '● Offline';
      document.getElementById('live-status').className = 'status-critical';
    };
  </script>
</body>
</html>`;
}
