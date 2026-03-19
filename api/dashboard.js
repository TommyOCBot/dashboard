/**
 * Vercel API Route: /api/dashboard
 * Returns JSON dashboard data
 */

const fs = require('fs');
const path = require('path');

function getDashboardData() {
  try {
    // Read latest dashboard.json from data directory
    const dataPath = path.join(process.cwd(), 'data', 'dashboard.json');
    
    if (fs.existsSync(dataPath)) {
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      return data;
    }
  } catch (e) {
    console.error('Error reading dashboard data:', e.message);
  }

  // Fallback data
  return {
    generated_at: new Date().toISOString(),
    error: 'Dashboard data not available'
  };
}

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const data = getDashboardData();
  res.status(200).json(data);
};
