/**
 * PricingService — Price calculations, markups, B2B net rates, and snapshots
 */
import { prisma } from '@/lib/prisma';

// ─── Markup Configuration ──────────────────────────────
const DEFAULT_MARKUP = 15; // 15% default B2C markup
const B2B_TIERS: Record<string, number> = {
  PLATINUM: 0,   // Net price
  GOLD: 3,       // 3% markup
  SILVER: 5,     // 5% markup
  BRONZE: 8,     // 8% markup
  STANDARD: 10,  // 10% markup
};

const VAT_RATE = 0; // Thai tours typically VAT-inclusive

export class PricingService {

  /** Calculate final B2C price (Base + Markup) */
  static calculateB2CPrice(basePrice: number, markupPercentage?: number): number {
    const markup = markupPercentage ?? DEFAULT_MARKUP;
    return Math.ceil(basePrice * (1 + markup / 100));
  }

  /** Calculate B2B Net Price based on agent tier */
  static calculateB2BPrice(basePrice: number, agentTier: string): { netPrice: number; markup: number; commission: number } {
    const markupPct = B2B_TIERS[agentTier] ?? B2B_TIERS.STANDARD;
    const netPrice = Math.ceil(basePrice * (1 + markupPct / 100));
    const b2cPrice = this.calculateB2CPrice(basePrice);
    const commission = b2cPrice - netPrice;

    return { netPrice, markup: markupPct, commission };
  }

  /** Get departure pricing with all pax types */
  static async getDeparturePrice(departureId: string) {
    const prices = await prisma.price.findMany({
      where: { departureId },
    });

    return prices.reduce((acc, p) => {
      acc[p.paxType] = {
        sellingPrice: p.sellingPrice,
        netPrice: p.netPrice,
        currency: p.currency,
      };
      return acc;
    }, {} as Record<string, { sellingPrice: number; netPrice: number | null; currency: string }>);
  }

  /** Calculate total price for booking */
  static calculateBookingTotal(prices: Record<string, number>, pax: { adults: number; children?: number; infants?: number }) {
    const adultTotal = (prices.ADULT || 0) * pax.adults;
    const childTotal = (prices.CHILD || prices.ADULT * 0.75 || 0) * (pax.children || 0);
    const infantTotal = (prices.INFANT || 0) * (pax.infants || 0);

    const subtotal = adultTotal + childTotal + infantTotal;
    const vat = Math.ceil(subtotal * VAT_RATE);
    const grandTotal = subtotal + vat;

    return {
      breakdown: {
        adults: { count: pax.adults, unitPrice: prices.ADULT || 0, total: adultTotal },
        children: { count: pax.children || 0, unitPrice: prices.CHILD || 0, total: childTotal },
        infants: { count: pax.infants || 0, unitPrice: prices.INFANT || 0, total: infantTotal },
      },
      subtotal,
      vat,
      grandTotal,
      currency: 'THB',
    };
  }

  /** Generate frozen price snapshot for checkout */
  static createPriceSnapshot(departureData: any, paxData: any, agentTier?: string) {
    const isB2B = !!agentTier;
    const basePrice = departureData.priceAdult || departureData.sellingPrice || 0;
    const paxCount = paxData.adults || 1;

    let unitPrice = basePrice;
    if (isB2B) {
      const b2b = this.calculateB2BPrice(basePrice, agentTier!);
      unitPrice = b2b.netPrice;
    }

    return {
      snapshotId: `SNAP-${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      isB2B,
      agentTier: agentTier || null,
      basePrice,
      unitPrice,
      paxCount,
      childCount: paxData.children || 0,
      infantCount: paxData.infants || 0,
      subtotal: unitPrice * paxCount,
      vat: 0,
      grandTotal: unitPrice * paxCount,
      currency: 'THB',
      locked: true,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min lock
    };
  }

  /** Apply coupon/promo code */
  static async applyCoupon(code: string, amount: number): Promise<{ valid: boolean; discount: number; type: string; message: string }> {
    // Check affiliate coupon
    const affiliate = await prisma.affiliate.findFirst({
      where: { couponCode: code, status: 'ACTIVE' },
    });

    if (affiliate) {
      // Affiliate coupons typically give customer 5% off
      const discount = Math.ceil(amount * 0.05);
      return { valid: true, discount, type: 'AFFILIATE', message: `ส่วนลด 5% จาก ${affiliate.displayName}` };
    }

    // Check general promo codes (could be DB-driven)
    const promoCodes: Record<string, { rate: number; message: string }> = {
      WELCOME10: { rate: 0.10, message: 'ส่วนลดต้อนรับ 10%' },
      SUMMER25: { rate: 0.05, message: 'Summer Sale 5%' },
    };

    const promo = promoCodes[code.toUpperCase()];
    if (promo) {
      return { valid: true, discount: Math.ceil(amount * promo.rate), type: 'PROMO', message: promo.message };
    }

    return { valid: false, discount: 0, type: '', message: 'รหัสส่วนลดไม่ถูกต้อง' };
  }
}
