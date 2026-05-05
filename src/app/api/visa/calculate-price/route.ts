import { NextResponse } from 'next/server';

/**
 * POST /api/visa/calculate-price
 * Body: { country, tier, pax, addons: string[], promoCode? }
 * Returns: { subtotal, discount, total, breakdown }
 */

const tierPrices: Record<string, Record<string, number>> = {
  japan: { PLUS: 1500, ADVANCE: 3000, EXCLUSIVE: 5500, VIP: 10000 },
  china: { PLUS: 2000, ADVANCE: 4000, EXCLUSIVE: 6500, VIP: 12000 },
  america: { PLUS: 5500, ADVANCE: 8000, EXCLUSIVE: 12000, VIP: 20000 },
  england: { PLUS: 4000, ADVANCE: 6000, EXCLUSIVE: 9000, VIP: 16000 },
  france: { PLUS: 3500, ADVANCE: 5500, EXCLUSIVE: 8500, VIP: 15000 },
  australia: { PLUS: 3500, ADVANCE: 5500, EXCLUSIVE: 8500, VIP: 15000 },
  canada: { PLUS: 4500, ADVANCE: 7000, EXCLUSIVE: 10000, VIP: 18000 },
  korea: { PLUS: 1200, ADVANCE: 2500, EXCLUSIVE: 4500, VIP: 8000 },
};

const addonPrices: Record<string, number> = {
  translation: 800, dummy_ticket: 500, dummy_hotel: 300,
  insurance: 1200, cover_letter: 1500, itinerary: 1000,
  interview_prep: 3000, express: 2000,
};

const promoCodes: Record<string, { discount: number; type: 'percent' | 'fixed' }> = {
  'VISA10': { discount: 10, type: 'percent' },
  'WELCOME500': { discount: 500, type: 'fixed' },
  'VIP20': { discount: 20, type: 'percent' },
};

export async function POST(req: Request) {
  try {
    const { country, tier, pax = 1, addons = [], promoCode } = await req.json();

    // Base price
    const countryPrices = tierPrices[country] || tierPrices.japan;
    const basePrice = countryPrices[tier?.toUpperCase()] || countryPrices.PLUS;
    const serviceFee = basePrice * pax;

    // Addons
    const addonBreakdown = (addons as string[]).map(key => ({
      key, name: key, price: addonPrices[key] || 0,
    }));
    const addonTotal = addonBreakdown.reduce((sum, a) => sum + a.price, 0);

    // Subtotal
    const subtotal = serviceFee + addonTotal;

    // Group discount (2+ pax = 5%)
    const groupDiscount = pax >= 2 ? Math.round(serviceFee * 0.05) : 0;

    // Promo discount
    let promoDiscount = 0;
    const promo = promoCode ? promoCodes[promoCode.toUpperCase()] : null;
    if (promo) {
      promoDiscount = promo.type === 'percent'
        ? Math.round(subtotal * promo.discount / 100)
        : promo.discount;
    }

    const totalDiscount = groupDiscount + promoDiscount;
    const total = Math.max(0, subtotal - totalDiscount);

    return NextResponse.json({
      success: true,
      data: {
        country, tier: tier?.toUpperCase(), pax,
        breakdown: {
          basePrice, serviceFee,
          addons: addonBreakdown, addonTotal,
          groupDiscount, promoDiscount,
          promoCode: promo ? promoCode.toUpperCase() : null,
        },
        subtotal, discount: totalDiscount, total,
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
