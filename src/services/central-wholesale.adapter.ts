export type DepositType = 'per_person' | 'per_booking' | 'unknown';

export type AdapterNormalizedDeparture = {
  canonicalTourKey: string;
  wholesaleId: string;
  sourceTourKey: string;
  sourceDepartureKey: string;
  departureDate: string | null;
  returnDate: string | null;
  adultPrice: number | null;
  childWithBedPrice?: number | null;
  childWithoutBedPrice?: number | null;
  infantPrice?: number | null;
  singleSupplementPrice?: number | null;
  depositAmount: number | null;
  depositType: DepositType;
  seatTotal?: number | null;
  seatAvailable: number | null;
  pdfUrl?: string | null;
  rawPayload?: Record<string, any>;
};

export type AdapterValidationIssue = {
  code: string;
  field: string;
  severity: 'error' | 'warning';
  message: string;
};

export function validateAdapterNormalizedDeparture(row: AdapterNormalizedDeparture): AdapterValidationIssue[] {
  const issues: AdapterValidationIssue[] = [];

  if (!String(row.canonicalTourKey || '').trim()) {
    issues.push({ code: 'MISSING_CANONICAL_TOUR_KEY', field: 'canonicalTourKey', severity: 'error', message: 'canonicalTourKey is required' });
  }
  if (!String(row.wholesaleId || '').trim()) {
    issues.push({ code: 'MISSING_WHOLESALE_ID', field: 'wholesaleId', severity: 'error', message: 'wholesaleId is required' });
  }
  if (!String(row.sourceTourKey || '').trim()) {
    issues.push({ code: 'MISSING_SOURCE_TOUR_KEY', field: 'sourceTourKey', severity: 'error', message: 'sourceTourKey is required' });
  }
  if (!String(row.sourceDepartureKey || '').trim()) {
    issues.push({ code: 'MISSING_SOURCE_DEPARTURE_KEY', field: 'sourceDepartureKey', severity: 'error', message: 'sourceDepartureKey is required' });
  }
  if (!row.departureDate) {
    issues.push({ code: 'MISSING_DEPARTURE_DATE', field: 'departureDate', severity: 'error', message: 'departureDate is required' });
  }
  if (!(Number(row.adultPrice) > 0)) {
    issues.push({ code: 'MISSING_ADULT_PRICE', field: 'adultPrice', severity: 'error', message: 'adultPrice must be greater than 0' });
  }
  if (!(Number(row.depositAmount) > 0)) {
    issues.push({ code: 'MISSING_DEPOSIT', field: 'depositAmount', severity: 'warning', message: 'depositAmount is missing or invalid' });
  }
  if (row.seatAvailable === null || row.seatAvailable === undefined || !Number.isFinite(Number(row.seatAvailable))) {
    issues.push({ code: 'MISSING_SEAT_AVAILABLE', field: 'seatAvailable', severity: 'warning', message: 'seatAvailable is required' });
  }
  if (row.seatTotal !== null && row.seatTotal !== undefined && Number.isFinite(Number(row.seatTotal)) && Number.isFinite(Number(row.seatAvailable))) {
    if (Number(row.seatAvailable) > Number(row.seatTotal)) {
      issues.push({ code: 'INVALID_SEAT_RELATION', field: 'seatAvailable', severity: 'error', message: 'seatAvailable cannot exceed seatTotal' });
    }
  }
  if (!String(row.pdfUrl || '').trim()) {
    issues.push({ code: 'MISSING_PDF_URL', field: 'pdfUrl', severity: 'warning', message: 'pdfUrl is missing' });
  }

  return issues;
}
