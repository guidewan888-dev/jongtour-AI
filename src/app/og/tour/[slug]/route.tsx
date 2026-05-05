import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/prisma';

export const runtime = 'edge';

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    // Try to fetch tour data
    let title = 'Jongtour — จองทัวร์ออนไลน์';
    let subtitle = 'ค้นหาทัวร์ทั่วโลกง่ายๆ ด้วย AI';
    let price = '';
    let duration = '';

    try {
      const tour = await prisma.tour.findFirst({
        where: { slug: params.slug },
        include: { departures: { include: { prices: true }, take: 1 } },
      });
      if (tour) {
        title = tour.tourName;
        duration = `${tour.durationDays} วัน ${tour.durationNights} คืน`;
        const p = tour.departures[0]?.prices[0]?.sellingPrice;
        if (p) price = `฿${p.toLocaleString()}`;
      }
    } catch {}

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
            padding: '60px',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Top — Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #F97316, #EA580C)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 900,
                color: 'white',
              }}
            >
              J
            </div>
            <span style={{ fontSize: '28px', fontWeight: 900, color: 'white' }}>
              Jong<span style={{ color: '#F97316' }}>tour</span>
            </span>
          </div>

          {/* Middle — Title */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                fontSize: title.length > 30 ? '42px' : '52px',
                fontWeight: 900,
                color: 'white',
                lineHeight: 1.2,
                maxWidth: '900px',
              }}
            >
              {title}
            </div>
            {duration && (
              <div style={{ fontSize: '24px', color: '#94A3B8' }}>
                📅 {duration}
              </div>
            )}
          </div>

          {/* Bottom — Price + CTA */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            {price ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '18px', color: '#94A3B8' }}>เริ่มต้น</div>
                <div style={{ fontSize: '56px', fontWeight: 900, color: '#F97316' }}>{price}</div>
              </div>
            ) : (
              <div style={{ fontSize: '24px', color: '#94A3B8' }}>{subtitle}</div>
            )}
            <div
              style={{
                background: '#F97316',
                borderRadius: '16px',
                padding: '16px 32px',
                fontSize: '20px',
                fontWeight: 700,
                color: 'white',
              }}
            >
              จองเลย →
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'public, immutable, max-age=31536000',
        },
      },
    );
  } catch {
    return new Response('Failed to generate OG image', { status: 500 });
  }
}
