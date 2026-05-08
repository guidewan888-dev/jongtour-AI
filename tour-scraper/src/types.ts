// ─── Shared Types for Tour Scraper ───────────────────

export interface TourData {
  tourCode: string;
  sourceUrl: string;
  title: string;
  country?: string;
  city?: string;
  duration?: string;
  priceFrom?: number;
  airline?: string;
  description?: string;
  itineraryHtml?: string;
  pdfUrl?: string;
  imageUrls: string[];
  periods: TourPeriod[];
  deposit?: number;         // มัดจำ
  hotelRating?: number;     // ระดับโรงแรม (1-5)
  highlights?: string[];    // ไฮไลท์ทัวร์
}

export interface TourPeriod {
  startDate?: string;      // ISO date string
  endDate?: string;
  price?: number;
  seatsLeft?: number;
  status?: string;         // 'open' | 'full' | 'closed'
  rawText: string;
}

export interface SiteConfig {
  name: string;
  enabled: boolean;
  type: 'wordpress' | 'nextjs_spa';
  baseUrl: string;
  sitemapUrls: string[];
  tourUrlPattern: RegExp;
  requestDelayMs: number;
  userAgent: string;
  usePlaywright?: boolean;
  waitSelector?: string;
}

export interface ImageMeta {
  originalUrl: string;
  storagePath: string;
  publicUrl: string;
  fileHash: string;
  width: number;
  height: number;
  fileSize: number;
}

export interface ScrapeStats {
  urlsFound: number;
  urlsScraped: number;
  urlsFailed: number;
  imagesSaved: number;
  error?: string;
}
