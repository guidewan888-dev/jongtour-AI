# Central Wholesale Adapter Contract

This document defines the required normalized payload for every new wholesaler adapter.

## Required output per departure

Each adapter must output one normalized record per departure and pass validation from:

- `validateAdapterNormalizedDeparture()` in
  `src/services/central-wholesale.adapter.ts`

Required fields:

- `canonicalTourKey`
- `wholesaleId`
- `sourceTourKey`
- `sourceDepartureKey`
- `departureDate`
- `adultPrice`
- `depositAmount` (can be warning if missing)
- `seatAvailable`
- `pdfUrl` (can be warning if missing)

## Integration flow for new wholesaler

1. Fetch raw source payload into `raw_wholesale_imports`.
2. Normalize into central model:
   - `canonical_tours`
   - `wholesale_tour_mappings`
   - `tour_departures`
   - `tour_prices`
   - `tour_seats`
   - `tour_pdfs`
3. Run quality validation:
   - Create report in `sync_quality_reports`
   - Create detail issues in `sync_quality_issues`
4. If critical errors exist:
   - keep `need_review = true`
   - do not enable publish/booking flow for broken rows

## Booking safety gate

Backend booking must reject when central required data is missing:

- missing adult price
- missing seat availability
- seat not enough

This gate is implemented in `src/app/api/bookings/create/route.ts`.
