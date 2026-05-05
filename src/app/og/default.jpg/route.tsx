import { ImageResponse } from 'next/og';

export const runtime = 'edge';

/**
 * Default OG image for pages without specific tour slug
 * URL: /og/default.jpg
 */
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #F97316, #EA580C)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '42px',
            fontWeight: 900,
            color: 'white',
            marginBottom: '24px',
          }}
        >
          J
        </div>

        {/* Brand */}
        <div style={{ fontSize: '64px', fontWeight: 900, color: 'white', marginBottom: '8px' }}>
          Jong<span style={{ color: '#F97316' }}>tour</span>
        </div>

        {/* Tagline */}
        <div style={{ fontSize: '28px', color: '#94A3B8', marginBottom: '40px' }}>
          จองทัวร์ออนไลน์ ครบทุกเส้นทาง
        </div>

        {/* Features */}
        <div style={{ display: 'flex', gap: '32px' }}>
          {['🌏 ทัวร์ทั่วโลก', '🤖 AI ช่วยค้นหา', '💳 จองง่าย ปลอดภัย'].map((f) => (
            <div key={f} style={{ fontSize: '20px', color: '#64748B', background: 'rgba(255,255,255,0.05)', padding: '12px 24px', borderRadius: '12px' }}>
              {f}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: { 'Cache-Control': 'public, immutable, max-age=31536000' },
    },
  );
}
