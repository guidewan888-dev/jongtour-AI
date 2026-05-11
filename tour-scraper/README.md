# Tour Scraper Runbook

## GS25 one-off backfill: missing cover images

Use this when GS25 tours already exist in `scraper_tours` but `cover_image_url` is still `null`.

### Prerequisites

- `GS25_EMAIL` and `GS25_PASSWORD`
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

### Command

```bash
npx tsx src/fix-gs25-images.ts
```

### What it does

- Logs in to `gs25travel.com`
- Re-visits GS25 tour detail pages with missing cover images
- Extracts candidate images and uploads to storage
- Updates `scraper_tours.cover_image_url`

### When to run again

- After scraper/network incidents affecting GS25 image download
- After major GS25 site HTML/layout changes
