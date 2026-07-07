# CITY EMERGENCY ALERTS V5 Community Edition

A GitHub Pages + GitHub Actions based emergency intelligence dashboard for Pune and nearby regions.

## What is new in V5
- GitHub Actions data pipeline.
- Browser loads optimized JSON instead of many RSS feeds.
- Better freshness and less CORS/proxy dependency.
- Incident clustering and deduplication.
- Confidence tags based on source count and official sources.
- Alerts and incidents separated.
- Weather JSON generated for all regions.
- Locality database and area detection.
- Search and filters.
- Offline PWA support.

## Deploy
1. Create a new GitHub repository, for example `CITY-EMERGENCY-ALERTS-V5`.
2. Upload all extracted files and folders to the repository root.
3. Go to Settings → Pages.
4. Select Deploy from branch → main → /(root).
5. Go to Actions and enable workflows if GitHub asks.
6. Run `Update Emergency Data` once manually, or wait for the scheduled run.
7. Open your GitHub Pages URL.

## Important
This is an emergency awareness and navigation platform, not an official emergency notification system.
For life-threatening emergencies call 112.
