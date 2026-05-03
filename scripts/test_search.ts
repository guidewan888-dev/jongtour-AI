import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qterfftaebnoawnzkfgu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0ZXJmZnRhZWJub2F3bnprZmd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ3MzAxNCwiZXhwIjoyMDkzMDQ5MDE0fQ.IDd7B8okNE1B0vf1OVQizDGeVQNdVwLK0gzogOyWIFE'
);

async function cleanup() {
  console.log("Starting cleanup...");
  const sources = ['TOUR_FACTORY', 'CHECKIN', 'API_ZEGO', 'API_GO365'];
  
  for (const source of sources) {
    console.log(`Processing source: ${source}`);
    const { data: tours, error } = await supabase.from('Tour')
      .select('id, providerId, createdAt')
      .eq('source', source)
      .order('createdAt', { ascending: false });
      
    if (error || !tours) {
      console.error("Failed to fetch tours:", error);
      continue;
    }
    
    const idMap = new Map();
    const toDeleteIds = [];
    
    for (const t of tours) {
      if (!t.providerId) continue;
      
      if (!idMap.has(t.providerId)) {
        idMap.set(t.providerId, t.id); // Keep the first (newest) one
      } else {
        toDeleteIds.push(t.id); // Mark others for deletion
      }
    }
    
    console.log(`Found ${toDeleteIds.length} duplicate tours for ${source} to delete.`);
    
    if (toDeleteIds.length > 0) {
      // Delete departures first
      for (let i = 0; i < toDeleteIds.length; i += 100) {
        const batch = toDeleteIds.slice(i, i + 100);
        console.log(`Deleting departures batch ${i}...`);
        await supabase.from('TourDeparture').delete().in('tourId', batch);
        
        console.log(`Deleting tours batch ${i}...`);
        await supabase.from('Tour').delete().in('id', batch);
      }
    }
  }
  
  console.log("Cleanup complete!");
}

cleanup();
