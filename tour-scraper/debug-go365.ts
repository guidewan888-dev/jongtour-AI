// Inspect Go365 API response for PDF fields
import 'dotenv/config';

const API_KEY = process.env.GO365_API_KEY!;
const API_BASE = 'https://api.kaikongservice.com/api/v1';

async function check() {
  // Get first few tours
  const searchRes = await fetch(`${API_BASE}/tours/search`, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ start_page: 1, limit_page: 3 }),
  });
  const searchData = await searchRes.json();
  const tours = searchData.data || [];
  
  console.log(`Found ${tours.length} tours in search`);
  
  // Check detail for first 3 tours
  for (const t of tours.slice(0, 3)) {
    const tourId = t.tour_id;
    console.log(`\n══ Tour ${tourId}: ${t.tour_code} ══`);
    
    // Search response fields
    console.log('Search fields:', Object.keys(t).join(', '));
    if (t.tour_file) console.log('  tour_file:', JSON.stringify(t.tour_file));
    
    // Detail API
    const detailRes = await fetch(`${API_BASE}/tours/detail/${tourId}`, {
      headers: { 'x-api-key': API_KEY },
    });
    const detailData = await detailRes.json();
    const detail = detailData.data?.[0] || detailData.data || {};
    
    // Check all file-related fields
    console.log('Detail tour_file:', JSON.stringify(detail.tour_file, null, 2));
    
    // Check for any field containing 'pdf', 'file', 'download', 'document'
    for (const [key, val] of Object.entries(detail)) {
      if (typeof val === 'string' && (val.includes('pdf') || val.includes('file4load') || val.includes('loadfileall') || val.includes('.pdf'))) {
        console.log(`  Found PDF-like field: ${key} = ${val}`);
      }
    }
    
    // Also check nested objects
    if (detail.tour_file) {
      for (const [key, val] of Object.entries(detail.tour_file)) {
        if (val && typeof val === 'string' && val.length > 5) {
          console.log(`  tour_file.${key} = ${val}`);
        }
      }
    }
  }
}

check();
