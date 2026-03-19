# Dashboard Deployment Guide

**Status:** Ready for Vercel Deployment
**Last Updated:** 2026-03-19 14:55 EDT

## What's Ready

✅ **Interactive Dashboard** — Real-time operations + Hostfully metrics
✅ **API Route** — `/api/dashboard` returns JSON data
✅ **Responsive Design** — Works on desktop, tablet, mobile
✅ **Auto-Refresh** — Updates every 5 seconds
✅ **Vercel Config** — `vercel.json` ready to go
✅ **Git Repository** — All files committed

## Quick Deploy to Vercel

### Option 1: Vercel CLI (Fastest)

```bash
# Install Vercel CLI globally (if not already)
npm install -g vercel

# Navigate to dashboard directory
cd /data/.openclaw/workspace/projects/dashboard-deploy

# Deploy (first time, interactive)
vercel

# Follow prompts:
# - Link to GitHub account (or create new Vercel project)
# - Confirm project settings
# - Deploy

# Subsequent deploys (just push to git, auto-deploys)
git push origin main
```

### Option 2: GitHub + Vercel Auto-Deploy

1. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/dashboard-deploy.git
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to https://vercel.com/new
   - Select "Import Git Repository"
   - Choose the dashboard-deploy repo
   - Vercel auto-detects settings from `vercel.json`
   - Click "Deploy"

3. **Auto-Deploy on Push:**
   - Every time you push to main, Vercel auto-deploys
   - No manual steps needed

### Option 3: Lovable (Figma-based Design)

If you want Lovable to handle the UI design:

1. Export current `public/dashboard.html` to Lovable
2. Lovable generates interactive React/Vue component
3. Deploy via Lovable's integration with Vercel
4. Syncs data from your `/api/dashboard` endpoint

## Environment Variables (Optional)

Create `.env.local` in the project root:

```env
# For future use (not currently needed)
API_SECRET=your_secret_key
VERCEL_ANALYTICS_ID=your_id
```

## Dashboard URL After Deploy

Once deployed, you'll get a URL like:
```
https://mission-control-v2.vercel.app
```

Or custom domain:
```
https://dashboard.yourdomain.com
```

## What the Dashboard Shows

### Hostfully Section (🏠)
- 20 properties tracked
- Currently occupied: 0
- Next 30 days: 7 bookings
- Pending inquiries: 7
- Conversion rate: 56.3%
- Channel breakdown (Airbnb, VRBO, Hostfully)

### Operations Section (📊)
- Properties occupied: 22/30
- Occupancy rate: 73%
- MTD revenue: $48,200
- Target progress: 88%
- Guest messages: 7 open

### Payroll Section (💰)
- Total payout: $5,150
- Period: Mar 10-24
- Team members: 5
- Status: Ready

### Alerts & Performance
- Active alerts (high/medium/low severity)
- Top performing properties
- Property breakdown with inquiries

## Real-Time Updates

The dashboard auto-fetches from `/api/dashboard` every 5 seconds.

To update the data source:
1. Edit `/data/dashboard.json` with fresh metrics
2. Run Hostfully sync: `bash /projects/hostfully/scripts/sync-to-operations-dashboard.sh`
3. Commit & push to GitHub
4. Vercel auto-deploys within seconds
5. Dashboard refreshes automatically in browser

## Maintenance

### Update Dashboard Data

```bash
# 1. Update Hostfully data
bash /projects/hostfully/scripts/morning-brief.sh
bash /projects/hostfully/scripts/sync-to-operations-dashboard.sh

# 2. Commit changes
cd /projects/dashboard-deploy
git add data/dashboard.json
git commit -m "📊 Update dashboard metrics"
git push origin main

# 3. Vercel auto-deploys
# (Check https://vercel.com/your-project for deployment status)
```

### Schedule Daily Updates

Add to crontab (7:30 AM):

```bash
30 7 * * * bash /data/.openclaw/workspace/projects/hostfully/scripts/morning-brief.sh && bash /data/.openclaw/workspace/projects/hostfully/scripts/sync-to-operations-dashboard.sh && cd /data/.openclaw/workspace/projects/dashboard-deploy && git add data/dashboard.json && git commit -m "📊 Daily dashboard update" && git push origin main
```

## Customization

### Change Refresh Interval

Edit `public/dashboard.html` line:
```javascript
const REFRESH_INTERVAL = 5000; // Change 5000 (ms) to desired interval
```

### Add New Metrics

1. Edit `/data/dashboard.json` to include new data
2. Update `buildDashboardHTML()` in `public/dashboard.html` to display it
3. Commit & push

### Change Logo/Title

Edit header in `public/dashboard.html`:
```html
<h1>
  <span class="icon">🎛️</span>  <!-- Change emoji -->
  Mission Control                <!-- Change text -->
</h1>
```

## Monitoring

### Check Deployment Status
```bash
vercel status
```

### View Logs
```bash
vercel logs
```

### Manual Redeploy
```bash
vercel --prod
```

## Troubleshooting

**Dashboard shows "Loading..." forever?**
- Check browser console (F12) for errors
- Verify `/api/dashboard` returns valid JSON
- Check Vercel deployment logs

**Data isn't updating?**
- Ensure `git push` completes successfully
- Check Vercel deployment finished (usually 30-60 seconds)
- Refresh browser (Cmd+Shift+R to hard refresh)

**API returns 404?**
- Verify `api/dashboard.js` file exists
- Check `vercel.json` routes are correct
- Redeploy: `vercel --prod`

## Files Reference

```
dashboard-deploy/
├── api/
│   └── dashboard.js          ← API endpoint
├── public/
│   ├── dashboard.html        ← Interactive UI
│   └── index.html            ← Fallback
├── data/
│   └── dashboard.json        ← Live data source
├── package.json              ← Vercel config
├── vercel.json               ← Vercel routes
└── DEPLOYMENT.md             ← This file
```

## Security Notes

✅ Dashboard is public (no authentication)
✅ Reads only from `dashboard.json` (no write access)
✅ No sensitive data exposed (payroll is sanitized, emails hidden)
✅ CORS enabled for cross-origin requests

## Support

For Vercel issues: https://vercel.com/docs
For dashboard issues: Check git history with `git log`

---

**Ready to deploy?** Run:
```bash
vercel
```

Dashboard goes live in 30-60 seconds. Share the URL with Chris.
