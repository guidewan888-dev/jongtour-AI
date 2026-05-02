import { SupabaseClient } from '@supabase/supabase-js';
import { IntentExtractionResult } from './intentExtractor';
import { supplierMaster } from './supplierConfig';

export async function searchTours(
  supabase: SupabaseClient,
  args: any,
  intentExtracted: IntentExtractionResult | null
): Promise<{ tours: any[], strictInstruction: string }> {
  
  // STRICT B2B LOCK: Force supplier_id from Intent Extractor if present
  if (intentExtracted?.supplier_filter_required && intentExtracted?.matched_supplier?.supplier_id) {
    args.supplier_id = intentExtracted.matched_supplier.supplier_id;
  }

  let query = supabase.from('Tour').select('*, departures:TourDeparture(*)');
  
  if (args.isLastMinute) {
    const today = new Date();
    const next30Days = new Date();
    next30Days.setDate(today.getDate() + 30);
    query = supabase.from('Tour').select('*, departures:TourDeparture!inner(*)').gte('departures.startDate', today.toISOString()).lte('departures.startDate', next30Days.toISOString());
  }

  if (args.destination) {
    query = query.or(`title.ilike.%${args.destination}%,description.ilike.%${args.destination}%,destination.ilike.%${args.destination}%`);
  }
  if (args.date_from) {
    query = query.gte('departures.startDate', args.date_from);
  }
  if (args.date_to) {
    query = query.lte('departures.startDate', args.date_to);
  }
  if (args.supplier_id) {
    query = query.or(`source.eq.${args.supplier_id},providerId.ilike.%${args.supplier_id}%`);
  }
  if (args.budget_max) {
    query = query.lte('price', args.budget_max);
  }
  if (args.budget_min) {
    query = query.gte('price', args.budget_min);
  }
  if (args.maxPrice) {
    query = query.lte('price', args.maxPrice);
  }
  
  let limit = args.limit || 10;
  if (args.userImage) {
    limit = 1; // Limit to 1 if image provided
  }
  
  query = query.order('createdAt', { ascending: false }).limit(limit);

  let { data: rawTours } = await query;
  
  // Removed fallback query that drops destination filter. 
  // It caused irrelevant tours to show up in the UI when 0 rows matched the destination.
  
  let tours = rawTours || [];
  
  // Strict Validation Rule
  if (args.supplier_id) {
    tours = tours.filter((t: any) => 
      t.source === args.supplier_id || 
      t.providerId === args.supplier_id || 
      t.source?.toLowerCase() === args.supplier_id.toLowerCase() || 
      t.providerId?.toLowerCase() === args.supplier_id.toLowerCase()
    );
  }
  
  if (args.keyword) {
    const kws = args.keyword.toLowerCase().split(/\s+/).filter((k: string) => k.length > 2);
    if (kws.length > 0) {
      const filtered = tours.filter((t: any) => kws.some((kw: string) => t.title.toLowerCase().includes(kw) || (t.description && t.description.toLowerCase().includes(kw))));
      if (filtered.length > 0) tours = filtered;
    }
  }
  
  if (args.month) {
    const m = args.month.toLowerCase();
    const map: any = {
      "january": ["ม.ค.", "มกรา", "jan", "ปีใหม่"], "february": ["ก.พ.", "กุมภา", "feb"],
      "march": ["มี.ค.", "มีนา", "mar"], "april": ["เม.ย.", "เมษา", "สงกรานต์", "apr"],
      "may": ["พ.ค.", "พฤษภา", "may"], "june": ["มิ.ย.", "มิถุนา", "jun"],
      "july": ["ก.ค.", "กรกฎา", "jul"], "august": ["ส.ค.", "สิงหา", "aug"],
      "september": ["ก.ย.", "กันยา", "sep"], "october": ["ต.ค.", "ตุลา", "oct"],
      "november": ["พ.ย.", "พฤศจิกา", "nov"], "december": ["ธ.ค.", "ธันวา", "dec", "ปีใหม่"]
    };
    const aliases = map[m] || [m];
    tours = tours.filter((tour: any) => aliases.some((a:string) => ((tour.periodText||"")+" "+(tour.departures?.map((d:any)=>d.dateText).join(" ")||"")).toLowerCase().includes(a)));
  }

  let strictInstruction = "";
  if (intentExtracted?.supplier_filter_required && intentExtracted?.matched_supplier?.canonical_name) {
    const sName = intentExtracted.matched_supplier.canonical_name;
    strictInstruction = `
*** STRICT RESPONSE FORMAT REQUIRED ***
You MUST format your response EXACTLY like this (do not use generic formats or list emojis):

พบโปรแกรมของ ${sName} ตามเงื่อนไขที่ค้นหาครับ

1. {{tour_name}}
รหัสทัวร์: {{tour_code}}
Supplier: ${sName}
supplier_id: {{supplier_id}}
ประเทศ/เมือง: {{destination}}
วันเดินทาง: {{departure_date}}
สถานะ: {{availability_status}}
ราคาเริ่มต้น: {{price_from}} บาท
สายการบิน: {{airline}}
ลิงก์รายละเอียด: {{source_url}}
ลิงก์จอง: {{booking_url}}

หมายเหตุ:
แสดงเฉพาะโปรแกรมของ ${sName} เท่านั้น ไม่รวมโปรแกรมจาก Supplier อื่น
`;
  }

  return { tours, strictInstruction };
}

export function formatTourSummary(tours: any[]) {
  return tours.map((t: any) => ({ 
    id: t.id,
    title: t.title, 
    price: t.price, 
    code: t.code, 
    destination: t.destination,
    airline: t.airlineCode || t.airlines || "-",
    supplier_id: t.source,
    supplier_name: supplierMaster.find(s => s.supplier_id === t.source)?.canonical_name || t.providerId || t.source,
    available_departures: t.departures ? t.departures
      .filter((d: any) => new Date(d.startDate) >= new Date())
      .sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .map((d: any) => ({
        dateText: `${new Date(d.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} - ${new Date(d.endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}`,
        price: d.price,
        availableSeats: d.availableSeats
      })).slice(0, 5) : []
  }));
}
