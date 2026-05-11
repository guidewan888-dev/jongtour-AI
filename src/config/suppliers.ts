/**
 * Supplier/Wholesaler Configuration
 * 
 * Central source of truth for all supplier logos, names, and display settings.
 * Used across wholesaler pages, tours pages, region pages, and country pages.
 */

export interface SupplierInfo {
  key: string;       // match key used against supplier field from API
  name: string;      // display name
  color: string;     // fallback bg color for initials
  logo: string;      // path to logo in /public/images/logos/
  priority: number;  // sort order (lower = first)
}

/**
 * All wholesaler suppliers with correct logo paths.
 * Logo files live in /public/images/logos/
 */
export const SUPPLIERS: SupplierInfo[] = [
  { key: "let'sgo",        name: "Let's Go",           color: 'bg-green-600',   logo: '/images/logos/download.png',         priority: 1 },
  { key: "checkingroup",   name: "Checkin Group",      color: 'bg-teal-600',    logo: '/images/logos/checkingroup.jpg',     priority: 2 },
  { key: "tourfactory",    name: "Tour Factory",       color: 'bg-purple-600',  logo: '/images/logos/Tour-Factory.jpg',     priority: 3 },
  { key: "go365",          name: "Go365",              color: 'bg-green-500',   logo: '/images/logos/download.jfif',        priority: 4 },
  { key: "worldconnection",name: "World Connection",   color: 'bg-orange-600',  logo: '/images/logos/worldconnection.png',  priority: 5 },
  { key: "itravels",       name: "iTravels Center",    color: 'bg-sky-600',     logo: '/images/logos/itravels_small.jpg',   priority: 6 },
  { key: "bestint",       name: "Best International", color: 'bg-red-600',     logo: '/images/logos/bestintl.png',         priority: 7 },
  { key: "gs25",           name: "GS25 Travel",        color: 'bg-emerald-600', logo: '/images/logos/gs25.png',             priority: 8 },
];

/**
 * Normalize a string for fuzzy matching: lowercase, remove spaces/hyphens/apostrophes/dots.
 * Covers: space, hyphen, straight apostrophe ('), curly quotes (' '), backtick, dot
 */
function normalize(s: string): string {
  return s.toLowerCase().replace(/[\s\-''\u2018\u2019`.,]/g, '');
}

/**
 * Find supplier info by matching a supplier string from the API.
 * Normalizes both sides (removes spaces, hyphens, apostrophes) for robust matching.
 * Example: API sends "Let's Go" → normalized "letsgo" matches key "let'sgo" → "letsgo"
 * Example: API sends "Check-in Group" → normalized "checkingroup" matches key "checkingroup"
 * Falls back to a generic entry with initials.
 */
export function getSupplierInfo(supplierKey: string): SupplierInfo {
  const normalized = normalize(supplierKey);
  return SUPPLIERS.find(s => normalized.includes(normalize(s.key)))
    || { key: normalized, name: supplierKey, color: 'bg-slate-500', logo: '', priority: 99 };
}

