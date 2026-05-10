// ─── Parse scraper_tour_periods raw_text → start_date / end_date ──────────
// Converts Thai month names in raw_text like "ม.ค. 2569 - มิ.ย. 2569" to actual dates
// Run: npx tsx tour-scraper/src/fix-periods-dates.ts

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Thai month abbreviation → month number (1-indexed)
// Include variants WITH and WITHOUT trailing dot (e.g., "ส.ค." and "ส.ค")
const THAI_MONTHS: [string, number][] = [
  // Sort by length DESC so longer matches take priority over shorter ones
  ['มกราคม', 1], ['กุมภาพันธ์', 2], ['มีนาคม', 3], ['เมษายน', 4],
  ['พฤษภาคม', 5], ['มิถุนายน', 6], ['กรกฎาคม', 7], ['สิงหาคม', 8],
  ['กันยายน', 9], ['ตุลาคม', 10], ['พฤศจิกายน', 11], ['ธันวาคม', 12],
  ['พฤศจิกา', 11], ['พฤษภา', 5], ['มิถุนา', 6], ['กรกฎา', 7],
  ['สิงหา', 8], ['กันยา', 9], ['ตุลา', 10], ['ธันวา', 12],
  ['มกรา', 1], ['กุมภา', 2], ['มีนา', 3], ['เมษา', 4],
  ['ม.ค.', 1], ['ก.พ.', 2], ['มี.ค.', 3], ['เม.ย.', 4],
  ['พ.ค.', 5], ['มิ.ย.', 6], ['ก.ค.', 7], ['ส.ค.', 8],
  ['ก.ย.', 9], ['ต.ค.', 10], ['พ.ย.', 11], ['ธ.ค.', 12],
  // Without trailing dot
  ['ม.ค', 1], ['ก.พ', 2], ['มี.ค', 3], ['เม.ย', 4],
  ['พ.ค', 5], ['มิ.ย', 6], ['ก.ค', 7], ['ส.ค', 8],
  ['ก.ย', 9], ['ต.ค', 10], ['พ.ย', 11], ['ธ.ค', 12],
];

// English month names
const EN_MONTHS: [string, number][] = [
  ['january', 1], ['february', 2], ['march', 3], ['april', 4],
  ['may', 5], ['june', 6], ['july', 7], ['august', 8],
  ['september', 9], ['october', 10], ['november', 11], ['december', 12],
  ['jan', 1], ['feb', 2], ['mar', 3], ['apr', 4],
  ['jun', 6], ['jul', 7], ['aug', 8], ['sep', 9],
  ['oct', 10], ['nov', 11], ['dec', 12],
];

function thaiYearToGregorian(year: number): number {
  // Thai Buddhist year → Gregorian (e.g., 2569 → 2026, 69 → 2026)
  if (year > 2500) return year - 543;
  if (year > 100) return year; // Already Gregorian
  // Short Thai year: 60-99 → convert from B.E. (60 = 2517 → 1974... no)
  // Actually short years like 67, 68, 69 = พ.ศ. 2567, 2568, 2569
  // So 67 → 2567 → 2024, 68 → 2025, 69 → 2026
  if (year >= 25 && year <= 99) return year + 2500 - 543; // B.E. short → A.D.
  return year + 2000; // Short year like 26 (already A.D.)
}

interface ParsedDate {
  year: number;
  month: number;
  day?: number;
}

function findThaiMonth(text: string): { monthNum: number; monthStr: string; idx: number } | null {
  for (const [monthStr, monthNum] of THAI_MONTHS) {
    const idx = text.indexOf(monthStr);
    if (idx >= 0) return { monthNum, monthStr, idx };
  }
  return null;
}

function parseThaiDate(text: string): ParsedDate | null {
  // Try Thai months first
  const thaiMatch = findThaiMonth(text);
  if (thaiMatch) {
    const { monthNum, monthStr, idx } = thaiMatch;
    // Extract year after month
    const afterMonth = text.slice(idx + monthStr.length).trim();
    const yearMatch = afterMonth.match(/^\.?\s*(\d{2,4})/);
    let year = yearMatch ? thaiYearToGregorian(parseInt(yearMatch[1])) : new Date().getFullYear();
    
    // Check for day before month
    const beforeMonth = text.slice(0, idx).trim();
    const dayMatch = beforeMonth.match(/(\d{1,2})\s*$/);
    const day = dayMatch ? parseInt(dayMatch[1]) : undefined;
    
    return { year, month: monthNum, day };
  }
  
  // Try English months
  const lowerText = text.toLowerCase();
  for (const [monthStr, monthNum] of EN_MONTHS) {
    const idx = lowerText.indexOf(monthStr);
    if (idx >= 0) {
      const afterMonth = text.slice(idx + monthStr.length).trim();
      const yearMatch = afterMonth.match(/^\.?\s*(\d{2,4})/);
      let year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
      if (year < 100) year += 2000;
      
      const beforeMonth = text.slice(0, idx).trim();
      const dayMatch = beforeMonth.match(/(\d{1,2})\s*$/);
      const day = dayMatch ? parseInt(dayMatch[1]) : undefined;
      
      return { year, month: monthNum, day };
    }
  }

  // Try numeric: DD/MM/YYYY or DD-MM-YYYY
  const numMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (numMatch) {
    const day = parseInt(numMatch[1]);
    const month = parseInt(numMatch[2]);
    let year = thaiYearToGregorian(parseInt(numMatch[3]));
    return { year, month, day };
  }

  return null;
}

function parseDateRange(rawText: string): { startDate: string | null; endDate: string | null } {
  // ─── SPECIAL CASE: "08 - 10 พ.ค. 69" (day-day month year) ───
  // This is the most common format: startDay - endDay within same month
  const dayRangeMatch = rawText.match(/^(\d{1,2})\s*[-–]\s*(\d{1,2})\s+(.+)$/);
  if (dayRangeMatch) {
    const startDay = parseInt(dayRangeMatch[1]);
    const endDay = parseInt(dayRangeMatch[2]);
    const rest = dayRangeMatch[3]; // "พ.ค. 69" or "ส.ค 67"
    
    const dateFromRest = parseThaiDate(`${endDay} ${rest}`);
    if (dateFromRest) {
      const y = dateFromRest.year;
      const m = String(dateFromRest.month).padStart(2, '0');
      return {
        startDate: `${y}-${m}-${String(startDay).padStart(2, '0')}`,
        endDate: `${y}-${m}-${String(endDay).padStart(2, '0')}`,
      };
    }
  }

  // ─── GENERAL CASE: split on separators ───
  const separators = [' - ', ' – ', ' ถึง ', '~', ' to '];
  let parts: string[] = [rawText];
  
  for (const sep of separators) {
    if (rawText.includes(sep)) {
      parts = rawText.split(sep).map(s => s.trim());
      break;
    }
  }

  // Also try splitting on just "-" if no spaces around it (e.g., "17-20 ส.ค 67")
  if (parts.length === 1) {
    const dashMatch = rawText.match(/^(\d{1,2})-(\d{1,2})\s+(.+)$/);
    if (dashMatch) {
      const startDay = parseInt(dashMatch[1]);
      const endDay = parseInt(dashMatch[2]);
      const rest = dashMatch[3];
      const dateFromRest = parseThaiDate(`${endDay} ${rest}`);
      if (dateFromRest) {
        const y = dateFromRest.year;
        const m = String(dateFromRest.month).padStart(2, '0');
        return {
          startDate: `${y}-${m}-${String(startDay).padStart(2, '0')}`,
          endDate: `${y}-${m}-${String(endDay).padStart(2, '0')}`,
        };
      }
    }
  }

  const startParsed = parseThaiDate(parts[0]);
  const endParsed = parts.length > 1 ? parseThaiDate(parts[1]) : null;

  // If start has no month but end does, inherit month/year from end
  if (!startParsed && endParsed && parts.length > 1) {
    const dayMatch = parts[0].match(/(\d{1,2})/);
    if (dayMatch) {
      const startDay = parseInt(dayMatch[1]);
      const y = endParsed.year;
      const m = String(endParsed.month).padStart(2, '0');
      const ed = endParsed.day || new Date(y, endParsed.month, 0).getDate();
      return {
        startDate: `${y}-${m}-${String(startDay).padStart(2, '0')}`,
        endDate: `${y}-${m}-${String(ed).padStart(2, '0')}`,
      };
    }
  }

  let startDate: string | null = null;
  let endDate: string | null = null;

  if (startParsed) {
    const d = startParsed.day || 1;
    startDate = `${startParsed.year}-${String(startParsed.month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  if (endParsed) {
    const d = endParsed.day || new Date(endParsed.year, endParsed.month, 0).getDate();
    endDate = `${endParsed.year}-${String(endParsed.month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  } else if (startParsed && !endParsed && parts.length === 1) {
    // Single month — end = last day of that month
    const lastDay = new Date(startParsed.year, startParsed.month, 0).getDate();
    endDate = `${startParsed.year}-${String(startParsed.month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  }

  return { startDate, endDate };
}

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  Period Dates Parser (raw_text → dates)');
  console.log('═══════════════════════════════════════════\n');

  // Get all periods that have raw_text but no start_date
  const { data: periods, error } = await supabase
    .from('scraper_tour_periods')
    .select('id, tour_id, raw_text, start_date, end_date')
    .is('start_date', null)
    .not('raw_text', 'is', null)
    .order('id');

  if (error) { console.error('Error:', error); return; }

  console.log(`📊 Periods without dates: ${periods.length}\n`);

  if (periods.length === 0) {
    console.log('✅ All periods already have dates!');
    return;
  }

  let parsed = 0;
  let failed = 0;
  const failedExamples: string[] = [];

  // Process in batches
  const BATCH_SIZE = 50;
  for (let batchStart = 0; batchStart < periods.length; batchStart += BATCH_SIZE) {
    const batch = periods.slice(batchStart, batchStart + BATCH_SIZE);
    const updates: { id: number; start_date: string; end_date: string | null }[] = [];

    for (const period of batch) {
      if (!period.raw_text) { failed++; continue; }

      const { startDate, endDate } = parseDateRange(period.raw_text);
      
      if (startDate) {
        updates.push({
          id: period.id,
          start_date: startDate,
          end_date: endDate,
        });
        parsed++;
      } else {
        failed++;
        if (failedExamples.length < 10) {
          failedExamples.push(`  ID ${period.id}: "${period.raw_text}"`);
        }
      }
    }

    // Batch update
    if (updates.length > 0) {
      for (const upd of updates) {
        const updateData: Record<string, any> = { start_date: upd.start_date };
        if (upd.end_date) updateData.end_date = upd.end_date;
        
        const { error: updateErr } = await supabase
          .from('scraper_tour_periods')
          .update(updateData)
          .eq('id', upd.id);

        if (updateErr) {
          console.error(`  ❌ Update error for ID ${upd.id}:`, updateErr.message);
        }
      }
    }

    const progress = Math.min(batchStart + BATCH_SIZE, periods.length);
    console.log(`  Progress: ${progress}/${periods.length} (parsed: ${parsed}, failed: ${failed})`);
  }

  console.log(`\n═══════════════════════════════════════════`);
  console.log(`  Done! Parsed: ${parsed}, Failed: ${failed}`);
  if (failedExamples.length > 0) {
    console.log(`\n  Failed examples:`);
    failedExamples.forEach(ex => console.log(ex));
  }
  console.log(`═══════════════════════════════════════════`);
}

main();
