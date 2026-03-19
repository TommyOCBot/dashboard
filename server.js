const fs = require('fs');
const path = require('path');
const http = require('http');

const PORT = 3000;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.url === '/api/dashboard') {
    try {
      const dashboardFile = path.join(__dirname, 'data', 'dashboard.json');
      const data = fs.readFileSync(dashboardFile, 'utf8');
      res.writeHead(200);
      res.end(data);
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: e.message }));
    }
  } else if (req.url === '/') {
    res.setHeader('Content-Type', 'text/html');
    try {
      const html = fs.readFileSync(path.join(__dirname, 'public', 'dashboard.html'), 'utf8');
      res.writeHead(200);
      res.end(html);
    } catch (e) {
      res.writeHead(500);
      res.end(`<h1>Error</h1><p>${e.message}</p>`);
    }
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`✅ Dashboard running at http://localhost:${PORT}`);
});
