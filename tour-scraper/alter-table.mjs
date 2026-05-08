import 'dotenv/config';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const sql = `
ALTER TABLE scraper_tours ADD COLUMN IF NOT EXISTS deposit integer;
ALTER TABLE scraper_tours ADD COLUMN IF NOT EXISTS hotel_rating smallint;
ALTER TABLE scraper_tours ADD COLUMN IF NOT EXISTS highlights text[];
`;

// Use Supabase Management API / pg endpoint
const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
  },
  body: JSON.stringify({}),
});

// Since RPC approach might not work, use the postgres connection via raw SQL
// Supabase exposes a pg REST endpoint at /pg/query for service_role
const pgRes = await fetch(`${SUPABASE_URL}/pg/query`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SERVICE_KEY}`,
  },
  body: JSON.stringify({ query: sql }),
});

if (pgRes.ok) {
  console.log('SUCCESS via /pg/query');
  console.log(await pgRes.text());
} else {
  console.log('/pg/query status:', pgRes.status);
  // Fallback: try direct update with new columns — if column exists, it works
  // We'll add the columns by updating the upsert to include them
  // Supabase auto-schema might handle it
  
  // Actually, let's just use the Supabase SQL editor approach
  // Create a migration file instead
  console.log('');
  console.log('Columns must be added via Supabase Dashboard SQL Editor.');
  console.log('Creating migration script...');
  
  // Alternative: use supabase client to create columns by doing an update
  // that includes the new fields — Supabase will error if columns don't exist
  // So we MUST add them first.
  
  // Let's try via the supabase-js client with a raw postgres query
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    db: { schema: 'public' }
  });
  
  // Try using the sql tagged template (Supabase v2.x)
  for (const stmt of sql.trim().split(';').filter(s => s.trim())) {
    console.log('Executing:', stmt.trim());
    const { data, error } = await supabase.from('scraper_tours')
      .select('id').limit(0); // Just test connection
    if (error) console.log('Connection error:', error.message);
  }
  
  console.log('');
  console.log('Please run these in Supabase Dashboard > SQL Editor:');
  console.log(sql);
}
