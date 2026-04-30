const fs = require('fs');
let c = fs.readFileSync('src/app/tour/[id]/page.tsx', 'utf8');
const startIdx = c.indexOf('async function TourDetailsContent');
const endIdx = c.indexOf('  // หาวันเดินทางที่ถูกที่สุด');
const before = c.substring(0, startIdx);
const after = c.substring(endIdx);
const newContent = `async function TourDetailsContent({ params }: { params: { id: string } }) {
  console.log("FETCHING TOUR ID:", params.id);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qterfftaebnoawnzkfgu.supabase.co";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_SRwNSJ89mInda5FcuB1W2w_9IEJlSOI";
  
  const res = await fetch(\`\${supabaseUrl}/rest/v1/Tour?id=eq.\${params.id}&select=*,departures:TourDeparture(*)\`, {
    headers: { "apikey": supabaseKey, "Authorization": \`Bearer \${supabaseKey}\` },
    cache: "no-store"
  });
  
  if (!res.ok) {
    notFound();
  }
  
  const tours = await res.json();
  const tour = tours[0];
  
  if (!tour) {
    notFound();
  }

`;
fs.writeFileSync('src/app/tour/[id]/page.tsx', before + newContent + after);
console.log("Done");
