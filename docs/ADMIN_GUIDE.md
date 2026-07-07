# Administrator Guide

## Main data workflow
Run: **Actions → V5 Update All Emergency Data → Run workflow**

This updates:
- `data/live-alerts.json`
- `data/weather.json`
- `data/river-status.json`
- `data/traffic-status.json`
- `data/status.json`

## Edit sources
Update:
- `scripts/config/sources.js`

## Edit localities
Update:
- `scripts/config/localities.js`
- `data/localities.json`

## Manual alerts
Add manual pinned alerts in:
- `data/manual-alerts.json`

Only active and non-expired manual alerts are shown.
