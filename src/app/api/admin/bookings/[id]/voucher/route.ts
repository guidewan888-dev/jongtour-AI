export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: booking } = await supabase
    .from("bookings")
    .select(`
      *,
      customer:customers(*),
      tour:tours(tourName),
      departure:departures(startDate, endDate)
    `)
    .eq("id", params.id)
    .single();

  if (!booking) {
    return new NextResponse("Booking Not Found", { status: 404 });
  }

  const html = `
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="UTF-8">
      <title>Voucher - ${booking.bookingRef}</title>
      <style>
        body { font-family: 'Sarabun', sans-serif; padding: 40px; color: #333; }
        .voucher-container { border: 2px dashed #ff6b00; padding: 40px; border-radius: 16px; max-width: 800px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
        .brand { font-size: 28px; font-weight: bold; color: #ff6b00; }
        .title { font-size: 24px; font-weight: bold; letter-spacing: 2px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .info-box { background: #f9f9f9; padding: 15px; border-radius: 8px; }
        .label { font-size: 12px; color: #888; text-transform: uppercase; margin-bottom: 5px; }
        .value { font-size: 16px; font-weight: bold; }
        .footer { text-align: center; margin-top: 40px; color: #888; font-size: 12px; }
        @media print { body { padding: 0; } .voucher-container { border: none; } }
      </style>
    </head>
    <body>
      <div class="voucher-container">
        <div class="header">
          <div class="brand">Jongtour AI</div>
          <div class="title">OFFICIAL VOUCHER</div>
        </div>
        
        <div class="info-grid">
          <div class="info-box">
            <div class="label">Booking Reference</div>
            <div class="value">${booking.bookingRef}</div>
          </div>
          <div class="info-box">
            <div class="label">Status</div>
            <div class="value" style="color: #10b981;">${booking.status}</div>
          </div>
          <div class="info-box">
            <div class="label">Lead Traveler</div>
            <div class="value">${booking.customer?.firstName} ${booking.customer?.lastName}</div>
          </div>
          <div class="info-box">
            <div class="label">Travel Date</div>
            <div class="value">${new Date(booking.departure?.startDate).toLocaleDateString('en-GB')} - ${new Date(booking.departure?.endDate).toLocaleDateString('en-GB')}</div>
          </div>
        </div>

        <div class="info-box" style="margin-bottom: 30px;">
          <div class="label">Tour Package</div>
          <div class="value" style="font-size: 20px;">${booking.tour?.tourName}</div>
          <div style="margin-top: 10px; font-size: 14px;">Total Passengers: ${booking.paxAdult + booking.paxChild} Pax</div>
        </div>

        <button onclick="window.print()" style="background: #ff6b00; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; display: block; margin: 0 auto;">
          Print Voucher
        </button>

        <div class="footer">
          This is an electronically generated voucher. No physical signature is required.<br>
          Jongtour AI Co., Ltd.
        </div>
      </div>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}

