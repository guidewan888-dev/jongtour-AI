import { NextResponse } from 'next/server';

// Visa pricing data — will be DB-driven later
const pricingData = {
  tiers: ['PLUS', 'ADVANCE', 'EXCLUSIVE', 'VIP'],
  countries: [
    { slug: 'japan', name: 'ญี่ปุ่น', emoji: '🇯🇵', embassy: 0, prices: { PLUS: 1500, ADVANCE: 3000, EXCLUSIVE: 5500, VIP: 10000 } },
    { slug: 'china', name: 'จีน', emoji: '🇨🇳', embassy: 1500, prices: { PLUS: 2000, ADVANCE: 4000, EXCLUSIVE: 6500, VIP: 12000 } },
    { slug: 'america', name: 'อเมริกา', emoji: '🇺🇸', embassy: 6000, prices: { PLUS: 5500, ADVANCE: 8000, EXCLUSIVE: 12000, VIP: 20000 } },
    { slug: 'england', name: 'อังกฤษ', emoji: '🇬🇧', embassy: 3500, prices: { PLUS: 4000, ADVANCE: 6000, EXCLUSIVE: 9000, VIP: 16000 } },
    { slug: 'schengen', name: 'เชงเก้น', emoji: '🇪🇺', embassy: 2900, prices: { PLUS: 3500, ADVANCE: 5500, EXCLUSIVE: 8500, VIP: 15000 } },
    { slug: 'australia', name: 'ออสเตรเลีย', emoji: '🇦🇺', embassy: 5000, prices: { PLUS: 3500, ADVANCE: 5500, EXCLUSIVE: 8500, VIP: 15000 } },
    { slug: 'canada', name: 'แคนาดา', emoji: '🇨🇦', embassy: 3500, prices: { PLUS: 4500, ADVANCE: 7000, EXCLUSIVE: 10000, VIP: 18000 } },
    { slug: 'korea', name: 'เกาหลี', emoji: '🇰🇷', embassy: 1200, prices: { PLUS: 1200, ADVANCE: 2500, EXCLUSIVE: 4500, VIP: 8000 } },
  ],
};

export async function GET() {
  return NextResponse.json({ success: true, data: pricingData });
}
