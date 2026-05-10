// ─── Fix Best International missing country & hotel_rating data ──────
// Updates country field based on tour title + code using enhanced COUNTRY_MAP
// Run: npx tsx tour-scraper/src/fix-bestintl-data.ts

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const COUNTRY_MAP: Record<string, string> = {
  'ญี่ปุ่น': 'ญี่ปุ่น', 'japan': 'ญี่ปุ่น', 'osaka': 'ญี่ปุ่น', 'tokyo': 'ญี่ปุ่น', 'hokkaido': 'ญี่ปุ่น',
  'fukuoka': 'ญี่ปุ่น', 'nagoya': 'ญี่ปุ่น', 'narita': 'ญี่ปุ่น',
  'จีน': 'จีน', 'china': 'จีน', 'chongqing': 'จีน', 'xian': 'จีน', 'kunming': 'จีน',
  'เฉิงตู': 'จีน', 'เฉิงตู้': 'จีน', 'เฉินตู': 'จีน', 'ฉงชิ่ง': 'จีน', 'เซี่ยงไฮ้': 'จีน',
  'ปักกิ่ง': 'จีน', 'คุนหมิง': 'จีน', 'กุ้ยหลิน': 'จีน', 'จางเจียเจี้ย': 'จีน', 'ต๋ากู': 'จีน',
  'อู่หลง': 'จีน', 'เกาหลี': 'เกาหลี', 'korea': 'เกาหลี',
  'ไต้หวัน': 'ไต้หวัน', 'taiwan': 'ไต้หวัน',
  'ฮ่องกง': 'ฮ่องกง', 'hong kong': 'ฮ่องกง', 'hongkong': 'ฮ่องกง',
  'เวียดนาม': 'เวียดนาม', 'vietnam': 'เวียดนาม', 'ดานัง': 'เวียดนาม', 'ฮานอย': 'เวียดนาม',
  'พม่า': 'พม่า', 'myanmar': 'พม่า', 'ย่างกุ้ง': 'พม่า', 'มัณฑะเลย์': 'พม่า',
  'ลาว': 'ลาว', 'laos': 'ลาว', 'หลวงพระบาง': 'ลาว',
  'สิงคโปร์': 'สิงคโปร์', 'singapore': 'สิงคโปร์',
  'มาเก๊า': 'ฮ่องกง', 'macau': 'ฮ่องกง',
  'ยุโรป': 'ยุโรป', 'europe': 'ยุโรป', 'อิตาลี': 'ยุโรป', 'ฝรั่งเศส': 'ยุโรป', 'สวิส': 'ยุโรป',
  'สแกนดิเนเวีย': 'ยุโรป', 'นอร์เวย์': 'ยุโรป', 'สวีเดน': 'ยุโรป', 'เดนมาร์ค': 'ยุโรป',
  'อเมริกา': 'อเมริกา', 'america': 'อเมริกา', 'usa': 'อเมริกา',
  'อียิปต์': 'อียิปต์', 'egypt': 'อียิปต์',
  'ตุรกี': 'ตุรกี', 'turkey': 'ตุรกี', 'turkiye': 'ตุรกี',
  'จอร์แดน': 'จอร์แดน', 'jordan': 'จอร์แดน',
  'จอร์เจีย': 'จอร์เจีย', 'georgia': 'จอร์เจีย',
  'อิหร่าน': 'อิหร่าน', 'iran': 'อิหร่าน',
  'คาซัคสถาน': 'คาซัคสถาน', 'kazakhstan': 'คาซัคสถาน',
  'อินเดีย': 'อินเดีย', 'india': 'อินเดีย', 'แคชเมียร์': 'อินเดีย', 'kashmir': 'อินเดีย',
  'บาหลี': 'อินโดนีเซีย', 'bali': 'อินโดนีเซีย',
  'นิวซีแลนด์': 'นิวซีแลนด์', 'new zealand': 'นิวซีแลนด์',
};

// IATA code → country
const IATA_MAP: Record<string, string> = {
  'nrt': 'ญี่ปุ่น', 'kix': 'ญี่ปุ่น', 'cts': 'ญี่ปุ่น', 'fuk': 'ญี่ปุ่น', 'ngo': 'ญี่ปุ่น',
  'tfu': 'จีน', 'pvg': 'จีน', 'ckg': 'จีน', 'can': 'จีน', 'xnn': 'จีน', 'dyg': 'จีน', 'xiy': 'จีน', 'cnx': 'จีน',
  'icn': 'เกาหลี', 'tpe': 'ไต้หวัน', 'hkg': 'ฮ่องกง',
  'han': 'เวียดนาม', 'dad': 'เวียดนาม', 'sgn': 'เวียดนาม',
  'rgn': 'พม่า', 'ist': 'ตุรกี', 'amm': 'จอร์แดน',
  'fra': 'ยุโรป', 'eur': 'ยุโรป', 'geo': 'จอร์เจีย', 'ala': 'คาซัคสถาน',
  'bal': 'อินโดนีเซีย', 'nzl': 'นิวซีแลนด์',
  'th': 'จีน', // CNXTH = เชียงใหม่ → จีน tours from Chiang Mai
};

function detectCountry(title: string, code: string): string {
  const combined = (title + ' ' + code).toLowerCase();
  for (const [key, val] of Object.entries(COUNTRY_MAP)) {
    if (combined.includes(key.toLowerCase())) return val;
  }
  // Check IATA code in tour code (BT-TFU49_VZ → TFU)
  const iataMatch = code.match(/^[A-Z]*-?([A-Z]{3})/i);
  if (iataMatch) {
    const iata = iataMatch[1].toLowerCase();
    if (IATA_MAP[iata]) return IATA_MAP[iata];
  }
  return '';
}

async function fixBestIntlData() {
  // Get all Best International tours
  const { data: tours, error } = await supabase
    .from('scraper_tours')
    .select('id, tour_code, title, country, price_from, hotel_rating')
    .eq('site', 'bestintl');

  if (error) { console.error('Error:', error); return; }
  console.log(`Found ${tours.length} Best International tours\n`);

  let countryFixed = 0;

  for (const tour of tours) {
    const updates: Record<string, any> = {};

    // Fix country
    if (!tour.country || tour.country.trim() === '') {
      const detected = detectCountry(tour.title || '', tour.tour_code || '');
      if (detected) {
        updates.country = detected;
        countryFixed++;
      }
    }

    if (Object.keys(updates).length > 0) {
      const { error: updateErr } = await supabase
        .from('scraper_tours')
        .update(updates)
        .eq('id', tour.id);

      if (updateErr) {
        console.error(`  ❌ ${tour.tour_code}: ${updateErr.message}`);
      } else {
        console.log(`  ✅ ${tour.tour_code}: ${JSON.stringify(updates)}`);
      }
    }
  }

  console.log(`\nDone! Country fixed: ${countryFixed}`);
}

fixBestIntlData();
