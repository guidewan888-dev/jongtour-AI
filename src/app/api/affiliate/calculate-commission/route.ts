import { NextResponse } from 'next/server';

/**
 * POST /api/affiliate/calculate-commission
 * Body: { affiliateId, productType, productId, bookingValue, campaignId? }
 * Returns: stackable rule resolution + final commission
 */

const typeDefaults: Record<string, Record<string, number>> = {
  influencer: { tour: 15, visa: 8, private: 18 },
  affiliate_link: { tour: 8, visa: 5, private: 10 },
  agent_b2b: { tour: 10, visa: 5, private: 12 },
  pro_staff: { tour: 3, visa: 2, private: 5 },
  sub_agent: { tour: 8, visa: 5, private: 10 },
};

const tierBonuses: Record<string, number> = {
  bronze: 0, silver: 1, gold: 2, platinum: 3,
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      affiliateType = 'affiliate_link',
      affiliateTier = 'bronze',
      productType = 'tour',
      bookingValue = 0,
      campaignBonus = 0,
      productBonus = 0,
      overrideRate = null,
    } = body;

    const rules: Array<{ priority: string; name: string; rate: string }> = [];

    // P6: Global default (8%)
    const globalDefault = 8;

    // P5: Type default
    const typeRate = typeDefaults[affiliateType]?.[productType] ?? globalDefault;
    rules.push({ priority: 'P5', name: `${affiliateType} default`, rate: `${typeRate}%` });

    // P4: Tier bonus
    const tierBonus = tierBonuses[affiliateTier] ?? 0;
    if (tierBonus > 0) rules.push({ priority: 'P4', name: `${affiliateTier} tier`, rate: `+${tierBonus}%` });

    // P3: Product bonus
    if (productBonus > 0) rules.push({ priority: 'P3', name: 'Product bonus', rate: `+${productBonus}%` });

    // P2: Campaign bonus
    if (campaignBonus > 0) rules.push({ priority: 'P2', name: 'Campaign bonus', rate: `+${campaignBonus}%` });

    // P1: Override (replaces all)
    let finalRate: number;
    if (overrideRate !== null) {
      finalRate = overrideRate;
      rules.unshift({ priority: 'P1', name: 'Per-affiliate override', rate: `${overrideRate}% (replace)` });
    } else {
      finalRate = typeRate + tierBonus + productBonus + campaignBonus;
    }

    const commission = Math.round(bookingValue * finalRate / 100);

    return NextResponse.json({
      success: true,
      data: {
        rules,
        baseRate: `${typeRate}%`,
        bonuses: `+${tierBonus + productBonus + campaignBonus}%`,
        finalRate: `${finalRate}%`,
        bookingValue,
        commission,
        wht3pct: Math.round(commission * 0.03),
        netPayout: commission - Math.round(commission * 0.03),
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
