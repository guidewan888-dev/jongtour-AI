import { IntentExtractionResult } from './intentExtractor';
import { supplierMaster } from './supplierConfig';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { aiRealDataFilter } from '@/lib/filters/realDataFilter';

export async function searchTours(
  args: any,
  intentExtracted: IntentExtractionResult | null,
  semanticMatchedTourIds: string[] = []
): Promise<{ tours: any[], strictInstruction: string }> {
  console.log("=== searchTours args ===", args);
  console.log("=== intentExtracted ===", JSON.stringify(intentExtracted));
  
  try {
  // STRICT B2B LOCK: Force supplier_id from Intent Extractor if present
  if (intentExtracted?.supplier_filter_required && intentExtracted?.matched_supplier?.supplier_id) {
    args.supplier_id = intentExtracted.matched_supplier.supplier_id;
  } else {
    // If the user didn't explicitly ask for a supplier in the current message,
    // we MUST ignore any supplier_id that GPT carried over from chat history.
    delete args.supplier_id;
  }

  const whereClause: Prisma.TourWhereInput = { ...aiRealDataFilter };

  if (args.isLastMinute) {
    const today = new Date();
    const next30Days = new Date();
    next30Days.setDate(today.getDate() + 30);
    whereClause.departures = { some: { startDate: { gte: today, lte: next30Days } } };
  }

  const orConditions: Prisma.TourWhereInput[] = [];

  if (semanticMatchedTourIds.length > 0) {
     if (args.destination) {
        const destParts = args.destination.split(/[\s-]+/).filter((p: string) => p.trim().length > 0);
        for (const part of destParts) {
           orConditions.push({ tourName: { contains: part, mode: 'insensitive' } });
           orConditions.push({ destinations: { some: { country: { contains: part, mode: 'insensitive' } } } });
        }
        orConditions.push({ id: { in: semanticMatchedTourIds } });
     } else {
        whereClause.id = { in: semanticMatchedTourIds };
     }
  } else if (args.destination) {
    const destParts = args.destination.split(/[\s-]+/).filter((p: string) => p.trim().length > 0);
    const countryMap: Record<string, string> = {
      "ญี่ปุ่น": "JAPAN",
      "เกาหลี": "KOREA",
      "ยุโรป": "EUROPE",
      "จีน": "CHINA",
      "ไต้หวัน": "TAIWAN",
      "เวียดนาม": "VIETNAM",
      "สิงคโปร์": "SINGAPORE",
      "ฮ่องกง": "HONG KONG",
      "พม่า": "MYANMAR"
    };

    for (const part of destParts) {
       const mappedPart = countryMap[part] || part;
       orConditions.push({ tourName: { contains: part, mode: 'insensitive' } });
       orConditions.push({ destinations: { some: { country: { contains: mappedPart, mode: 'insensitive' } } } });
       if (mappedPart !== part) {
         orConditions.push({ destinations: { some: { country: { contains: part, mode: 'insensitive' } } } });
       }
    }
  }

  if (orConditions.length > 0) {
    whereClause.OR = orConditions;
  }

  if (args.date_from || args.date_to) {
    const startFilters: any = {};
    if (args.date_from) startFilters.gte = new Date(args.date_from);
    if (args.date_to) startFilters.lte = new Date(args.date_to);
    
    whereClause.departures = {
      ...((whereClause.departures as any) || {}),
      some: {
        ...((whereClause.departures as any)?.some || {}),
        startDate: startFilters
      }
    };
  }

  // supplier_id filtering
  if (args.supplier_id) {
    whereClause.supplier = { canonicalName: args.supplier_id.toLowerCase() };
  }

  let limit = args.limit || 10;
  if (args.userImage) {
    limit = 1; // Limit to 1 if image provided
  }
  
  // Fetch up to 50 to allow shuffling/mixing
  let toursData = await prisma.tour.findMany({
    where: whereClause,
    include: {
      departures: {
        where: { startDate: { gte: new Date() } },
        orderBy: { startDate: 'asc' },
        include: { prices: true }
      },
      destinations: true,
      supplier: true,
      images: { where: { isCover: true }, take: 1 }
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  let tours = toursData.map((t: any) => ({
    id: t.id,
    slug: t.slug,
    title: t.tourName,
    code: t.tourCode,
    imageUrl: t.images?.[0]?.imageUrl || null,
    durationDays: t.durationDays,
    durationNights: t.durationNights,
    price: t.departures.length > 0 ? Math.min(...t.departures.map((d: any) => d.prices?.[0]?.sellingPrice || 0)) : 0,
    source: t.supplier?.canonicalName || 'UNKNOWN',
    providerId: t.supplier?.canonicalName,
    supplierName: t.supplier?.displayName || t.supplier?.canonicalName || '',
    destination: t.destinations?.[0]?.country || 'ไม่ระบุ',
    departures: t.departures.map((d: any) => ({
      startDate: d.startDate,
      endDate: d.endDate,
      price: d.prices?.[0]?.sellingPrice || 0,
      availableSeats: d.remainingSeats
    }))
  }));
  
  if (args.budget_max) {
    tours = tours.filter((t: any) => t.price <= args.budget_max);
  }
  if (args.budget_min) {
    tours = tours.filter((t: any) => t.price >= args.budget_min);
  }
  if (args.maxPrice) {
    tours = tours.filter((t: any) => t.price <= args.maxPrice);
  }
  
  if (args.keyword && semanticMatchedTourIds.length === 0) {
    // Only apply basic keyword filter if RAG didn't find anything
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

  // Sort matched tours to the top!
  if (semanticMatchedTourIds.length > 0) {
    tours.sort((a, b) => {
      const aIndex = semanticMatchedTourIds.indexOf(a.id);
      const bIndex = semanticMatchedTourIds.indexOf(b.id);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return 0;
    });
  } else if (!args.supplier_id && tours.length > 0) {
    // Shuffle tours if no specific supplier was requested to "mix" results
    for (let i = tours.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tours[i], tours[j]] = [tours[j], tours[i]];
    }
  }

  // Enforce final limit for UI
  if (tours.length > limit) {
    tours = tours.slice(0, limit);
  }

  let strictInstruction = "";

  return { tours, strictInstruction };
  } catch (dbError: any) {
    console.error("[searchTours] Database query failed:", dbError?.message?.substring(0, 200));
    return { tours: [], strictInstruction: "[SYSTEM: ฐานข้อมูลทัวร์ไม่สามารถเข้าถึงได้ชั่วคราว ให้ตอบลูกค้าว่ากำลังปรับปรุงระบบ และแนะนำให้ติดต่อเจ้าหน้าที่โดยตรง]" };
  }
}

export function formatTourSummary(tours: any[]) {
  return tours.map((t: any) => ({ 
    id: t.id,
    slug: t.slug,
    title: t.title, 
    price: t.price, 
    code: t.code,
    imageUrl: t.imageUrl || null,
    durationDays: t.durationDays || 0,
    durationNights: t.durationNights || 0,
    destination: t.destination,
    airline: t.airlineCode || t.airlines || "-",
    supplier_id: t.source,
    supplier_name: supplierMaster.find(s => s.supplier_id === t.source)?.canonical_name || t.supplierName || t.providerId || t.source,
    available_departures: t.departures ? t.departures
      .filter((d: any) => new Date(d.startDate) >= new Date())
      .sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .map((d: any) => ({
        dateText: `${new Date(d.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} - ${new Date(d.endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}`,
        price: d.price,
        availableSeats: d.remainingSeats
      })).slice(0, 5) : []
  }));
}
