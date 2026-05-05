import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

function sha256(data: string) {
  return createHash('sha256').update(data.trim().toLowerCase()).digest('hex');
}

// POST /api/track/conversion — Server-side conversion tracking
// Bypasses ad blockers, required by Meta CAPI / Google Enhanced Conversions
export async function POST(req: NextRequest) {
  try {
    const { booking_id, customer_id, value, items, event_name, fbclid, gclid } = await req.json();

    if (!booking_id || !value) {
      return NextResponse.json({ error: 'booking_id and value required' }, { status: 400 });
    }

    const results: Record<string, any> = {};

    // ─── 1. Facebook Conversions API (CAPI) ─────────
    const fbPixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
    const fbAccessToken = process.env.FB_CAPI_ACCESS_TOKEN;

    if (fbPixelId && fbAccessToken) {
      try {
        const userData: Record<string, string> = {};
        // Hash PII if available
        if (customer_id) {
          // In production, lookup customer and hash their data
          // userData.em = sha256(customer.email);
          // userData.ph = sha256(customer.phone);
          userData.country = sha256('th');
        }
        if (fbclid) {
          userData.fbc = `fb.1.${Date.now()}.${fbclid}`;
        }

        const response = await fetch(
          `https://graph.facebook.com/v18.0/${fbPixelId}/events?access_token=${fbAccessToken}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              data: [{
                event_name: event_name || 'Purchase',
                event_time: Math.floor(Date.now() / 1000),
                event_id: booking_id, // for dedup with browser pixel
                action_source: 'website',
                event_source_url: 'https://jongtour.com/booking/confirm',
                user_data: userData,
                custom_data: {
                  currency: 'THB',
                  value,
                  content_ids: items?.map((i: any) => i.id) || [],
                  content_type: 'product',
                  num_items: items?.length || 1,
                },
              }],
            }),
          }
        );
        results.facebook = { status: response.status };
      } catch (err: any) {
        results.facebook = { error: err.message };
      }
    }

    // ─── 2. Google Measurement Protocol (GA4) ───────
    const gaMeasurementId = process.env.GA_MEASUREMENT_ID;
    const gaApiSecret = process.env.GA_API_SECRET;

    if (gaMeasurementId && gaApiSecret) {
      try {
        const response = await fetch(
          `https://www.google-analytics.com/mp/collect?measurement_id=${gaMeasurementId}&api_secret=${gaApiSecret}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              client_id: customer_id || `server.${Date.now()}`,
              events: [{
                name: 'purchase',
                params: {
                  transaction_id: booking_id,
                  value,
                  currency: 'THB',
                  items: items || [],
                },
              }],
            }),
          }
        );
        results.google = { status: response.status };
      } catch (err: any) {
        results.google = { error: err.message };
      }
    }

    // ─── 3. LINE Conversion API ─────────────────────
    const lineConversionToken = process.env.LINE_CONVERSION_API_TOKEN;
    if (lineConversionToken) {
      try {
        // LINE doesn't have a standard CAPI yet, but track via webhook
        results.line = { status: 'tracked_via_tag' };
      } catch {}
    }

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
