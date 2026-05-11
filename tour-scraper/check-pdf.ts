// Full status check: PDF + Highlights for ALL wholesalers
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function check() {
  const sites = ['gs25', 'itravels', 'bestintl', 'go365', 'worldconnection'];
  
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║          WHOLESALE SCRAPER STATUS — FULL AUDIT              ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  
  for (const site of sites) {
    const { data: all } = await sb
      .from('scraper_tours')
      .select('id, tour_code, pdf_url, highlights, title')
      .eq('site', site)
      .eq('is_active', true);

    const total = (all || []).length;
    if (total === 0) {
      console.log(`║ ${site.toUpperCase().padEnd(18)} │ No active tours                    ║`);
      continue;
    }

    const withPdf = (all || []).filter(t => t.pdf_url && t.pdf_url.length > 0).length;
    const withHL = (all || []).filter(t => Array.isArray(t.highlights) && t.highlights.length > 0).length;
    // Check for garbage highlights
    const withCleanHL = (all || []).filter(t => {
      if (!Array.isArray(t.highlights) || t.highlights.length === 0) return false;
      const garbage = /^(Previous|Next|หน้าแรก|ทั้งหมด|เอเชีย|ยุโรป|อเมริกา|อังกฤษ|เมนู|Home|All)$/i;
      return t.highlights.some((h: string) => !garbage.test(h));
    }).length;
    
    const pdfPct = (withPdf/total*100).toFixed(0);
    const hlPct = (withHL/total*100).toFixed(0);
    const cleanHlPct = (withCleanHL/total*100).toFixed(0);
    
    console.log(`║ ${site.toUpperCase().padEnd(18)} │ Total: ${String(total).padEnd(4)} │ PDF: ${String(withPdf).padEnd(4)}(${pdfPct.padStart(3)}%) │ HL: ${String(withCleanHL).padEnd(4)}(${cleanHlPct.padStart(3)}%) ║`);
    
    // Show sample of tours WITHOUT pdf
    if (withPdf < total) {
      const noPdf = (all || []).filter(t => !t.pdf_url || t.pdf_url.length === 0).slice(0, 3);
      for (const t of noPdf) {
        console.log(`║   ❌ PDF: ${t.tour_code.padEnd(20)} ${(t.title || '').substring(0, 30).padEnd(30)} ║`);
      }
    }
    // Show sample of tours WITHOUT clean highlights
    if (withCleanHL < total) {
      const noHL = (all || []).filter(t => {
        if (!Array.isArray(t.highlights) || t.highlights.length === 0) return true;
        const garbage = /^(Previous|Next|หน้าแรก|ทั้งหมด|เอเชีย|ยุโรป|อเมริกา|อังกฤษ|เมนู|Home|All)$/i;
        return !t.highlights.some((h: string) => !garbage.test(h));
      }).slice(0, 2);
      for (const t of noHL) {
        const hl = Array.isArray(t.highlights) ? t.highlights.slice(0,2).join(',') : 'null';
        console.log(`║   ❌ HL:  ${t.tour_code.padEnd(20)} [${hl.substring(0, 28)}] ║`);
      }
    }
  }
  
  console.log('╚══════════════════════════════════════════════════════════════╝');
}

check();
