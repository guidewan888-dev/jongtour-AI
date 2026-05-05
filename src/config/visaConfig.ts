/**
 * Visa Requirement Config for Thai Passport Holders
 * Auto-detects if a destination requires visa
 */

export interface VisaCountryInfo {
  code: string;
  name: string;
  nameTh: string;
  visaRequired: boolean;
  visaType: string; // SCHENGEN, UK, US, AU, NZ, INDIA, CHINA, CANADA, etc.
  processingDays: number;
  estimatedCost: string;
  requiredDocs: string[];
  notes?: string;
}

export const VISA_REQUIRED_COUNTRIES: VisaCountryInfo[] = [
  // === SCHENGEN (ยุโรป) ===
  { code: 'FR', name: 'France', nameTh: 'ฝรั่งเศส', visaRequired: true, visaType: 'SCHENGEN', processingDays: 15, estimatedCost: '3,000-5,000 THB', requiredDocs: ['Passport', 'Photo 3.5x4.5', 'Bank Statement', 'Flight Booking', 'Hotel Reservation', 'Travel Insurance'], notes: 'ยื่นที่ VFS Global' },
  { code: 'IT', name: 'Italy', nameTh: 'อิตาลี', visaRequired: true, visaType: 'SCHENGEN', processingDays: 15, estimatedCost: '3,000-5,000 THB', requiredDocs: ['Passport', 'Photo 3.5x4.5', 'Bank Statement', 'Flight Booking', 'Hotel Reservation', 'Travel Insurance'] },
  { code: 'DE', name: 'Germany', nameTh: 'เยอรมนี', visaRequired: true, visaType: 'SCHENGEN', processingDays: 15, estimatedCost: '3,000-5,000 THB', requiredDocs: ['Passport', 'Photo 3.5x4.5', 'Bank Statement', 'Flight Booking', 'Hotel Reservation', 'Travel Insurance'] },
  { code: 'ES', name: 'Spain', nameTh: 'สเปน', visaRequired: true, visaType: 'SCHENGEN', processingDays: 15, estimatedCost: '3,000-5,000 THB', requiredDocs: ['Passport', 'Photo 3.5x4.5', 'Bank Statement', 'Flight Booking', 'Hotel Reservation', 'Travel Insurance'] },
  { code: 'CH', name: 'Switzerland', nameTh: 'สวิตเซอร์แลนด์', visaRequired: true, visaType: 'SCHENGEN', processingDays: 15, estimatedCost: '3,000-5,000 THB', requiredDocs: ['Passport', 'Photo 3.5x4.5', 'Bank Statement', 'Flight Booking', 'Hotel Reservation', 'Travel Insurance'] },
  { code: 'AT', name: 'Austria', nameTh: 'ออสเตรีย', visaRequired: true, visaType: 'SCHENGEN', processingDays: 15, estimatedCost: '3,000-5,000 THB', requiredDocs: ['Passport', 'Photo 3.5x4.5', 'Bank Statement', 'Flight Booking', 'Hotel Reservation', 'Travel Insurance'] },
  { code: 'NL', name: 'Netherlands', nameTh: 'เนเธอร์แลนด์', visaRequired: true, visaType: 'SCHENGEN', processingDays: 15, estimatedCost: '3,000-5,000 THB', requiredDocs: ['Passport', 'Photo 3.5x4.5', 'Bank Statement', 'Flight Booking', 'Hotel Reservation', 'Travel Insurance'] },
  { code: 'CZ', name: 'Czech Republic', nameTh: 'เช็ก', visaRequired: true, visaType: 'SCHENGEN', processingDays: 15, estimatedCost: '3,000-5,000 THB', requiredDocs: ['Passport', 'Photo 3.5x4.5', 'Bank Statement', 'Flight Booking', 'Hotel Reservation', 'Travel Insurance'] },
  { code: 'SE', name: 'Sweden', nameTh: 'สวีเดน', visaRequired: true, visaType: 'SCHENGEN', processingDays: 15, estimatedCost: '3,000-5,000 THB', requiredDocs: ['Passport', 'Photo 3.5x4.5', 'Bank Statement', 'Flight Booking', 'Hotel Reservation', 'Travel Insurance'] },
  { code: 'NO', name: 'Norway', nameTh: 'นอร์เวย์', visaRequired: true, visaType: 'SCHENGEN', processingDays: 15, estimatedCost: '3,000-5,000 THB', requiredDocs: ['Passport', 'Photo 3.5x4.5', 'Bank Statement', 'Flight Booking', 'Hotel Reservation', 'Travel Insurance'] },
  { code: 'FI', name: 'Finland', nameTh: 'ฟินแลนด์', visaRequired: true, visaType: 'SCHENGEN', processingDays: 15, estimatedCost: '3,000-5,000 THB', requiredDocs: ['Passport', 'Photo 3.5x4.5', 'Bank Statement', 'Flight Booking', 'Hotel Reservation', 'Travel Insurance'] },
  { code: 'PT', name: 'Portugal', nameTh: 'โปรตุเกส', visaRequired: true, visaType: 'SCHENGEN', processingDays: 15, estimatedCost: '3,000-5,000 THB', requiredDocs: ['Passport', 'Photo 3.5x4.5', 'Bank Statement', 'Flight Booking', 'Hotel Reservation', 'Travel Insurance'] },
  { code: 'GR', name: 'Greece', nameTh: 'กรีซ', visaRequired: true, visaType: 'SCHENGEN', processingDays: 15, estimatedCost: '3,000-5,000 THB', requiredDocs: ['Passport', 'Photo 3.5x4.5', 'Bank Statement', 'Flight Booking', 'Hotel Reservation', 'Travel Insurance'] },

  // === UK ===
  { code: 'GB', name: 'United Kingdom', nameTh: 'อังกฤษ', visaRequired: true, visaType: 'UK', processingDays: 21, estimatedCost: '5,000-8,000 THB', requiredDocs: ['Passport', 'Photo', 'Bank Statement 6 months', 'Flight Booking', 'Hotel Reservation', 'Employment Letter'], notes: 'ยื่นออนไลน์ + VFS Global' },

  // === US ===
  { code: 'US', name: 'United States', nameTh: 'อเมริกา', visaRequired: true, visaType: 'US', processingDays: 30, estimatedCost: '6,000-8,000 THB', requiredDocs: ['Passport', 'DS-160 Form', 'Photo 5x5cm', 'Bank Statement', 'Employment Letter', 'Interview Appointment'], notes: 'ต้องสัมภาษณ์ที่สถานทูต' },

  // === CANADA ===
  { code: 'CA', name: 'Canada', nameTh: 'แคนาดา', visaRequired: true, visaType: 'CANADA', processingDays: 30, estimatedCost: '4,000-6,000 THB', requiredDocs: ['Passport', 'Photo', 'Bank Statement', 'Flight Booking', 'Employment Letter', 'Travel Purpose'] },

  // === AUSTRALIA ===
  { code: 'AU', name: 'Australia', nameTh: 'ออสเตรเลีย', visaRequired: true, visaType: 'AUSTRALIA', processingDays: 20, estimatedCost: '5,000-7,000 THB', requiredDocs: ['Passport', 'Photo', 'Bank Statement', 'Flight Booking', 'Hotel Reservation', 'Employment Letter'], notes: 'ยื่นออนไลน์ eVisa' },

  // === NEW ZEALAND ===
  { code: 'NZ', name: 'New Zealand', nameTh: 'นิวซีแลนด์', visaRequired: true, visaType: 'NEW_ZEALAND', processingDays: 25, estimatedCost: '4,000-6,000 THB', requiredDocs: ['Passport', 'Photo', 'Bank Statement', 'Flight Booking', 'Employment Letter'], notes: 'ยื่นออนไลน์' },

  // === INDIA ===
  { code: 'IN', name: 'India', nameTh: 'อินเดีย', visaRequired: true, visaType: 'INDIA', processingDays: 7, estimatedCost: '2,000-3,000 THB', requiredDocs: ['Passport', 'Photo', 'Flight Booking'], notes: 'eVisa ออนไลน์ได้' },

  // === CHINA ===
  { code: 'CN', name: 'China', nameTh: 'จีน', visaRequired: true, visaType: 'CHINA', processingDays: 7, estimatedCost: '2,000-4,000 THB', requiredDocs: ['Passport', 'Photo', 'Flight Booking', 'Hotel Reservation', 'Invitation Letter'] },
];

// ประเทศไม่ต้องวีซ่า (visa-free / visa-on-arrival for Thai)
export const VISA_FREE_COUNTRIES = [
  'JP', 'KR', 'HK', 'MO', 'SG', 'MY', 'ID', 'PH', 'VN', 'LA', 'KH', 'MM',
  'TW', 'BN', 'MV', 'GE', 'AZ', 'TR', 'AE', 'QA', 'BH', 'OM',
  'RU', 'KZ', 'PE', 'BR', 'AR', 'CL', 'EC',
];

/**
 * Check if a country requires visa for Thai passport holders
 */
export function checkVisaRequired(countryCode: string): VisaCountryInfo | null {
  return VISA_REQUIRED_COUNTRIES.find(c => c.code === countryCode.toUpperCase()) || null;
}

/**
 * Check visa by country name (partial match)
 */
export function checkVisaByName(countryName: string): VisaCountryInfo | null {
  const lower = countryName.toLowerCase();
  return VISA_REQUIRED_COUNTRIES.find(c =>
    c.name.toLowerCase().includes(lower) ||
    c.nameTh.includes(countryName)
  ) || null;
}

/**
 * Get all visa-required countries grouped by type
 */
export function getVisaCountriesByType() {
  const grouped: Record<string, VisaCountryInfo[]> = {};
  for (const c of VISA_REQUIRED_COUNTRIES) {
    if (!grouped[c.visaType]) grouped[c.visaType] = [];
    grouped[c.visaType].push(c);
  }
  return grouped;
}
