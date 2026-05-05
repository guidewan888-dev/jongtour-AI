import { prisma } from '@/lib/prisma';

// ─── Email via Resend ──────────────────────────────────
const RESEND_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@jongtour.com';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jongtour.com';

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_KEY) { console.log(`[EMAIL-MOCK] To:${to} Subject:${subject}`); return { id: 'mock' }; }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: `Jongtour <${FROM_EMAIL}>`, to, subject, html }),
  });
  return res.json();
}

// ─── LINE Push Message ─────────────────────────────────
const LINE_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';

async function sendLinePush(lineUserId: string, messages: any[]) {
  if (!LINE_TOKEN || !lineUserId) { console.log(`[LINE-MOCK] To:${lineUserId}`); return; }
  await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${LINE_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: lineUserId, messages }),
  });
}

// ─── In-App Notification ───────────────────────────────
async function createInApp(customerId: string, type: string, title: string, message: string, linkUrl?: string) {
  return prisma.notification.create({
    data: { customerId, type, title, message, linkUrl },
  });
}

// ─── Email Templates ───────────────────────────────────
function wrapEmail(content: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><style>
body{font-family:'Helvetica Neue',Arial,sans-serif;margin:0;padding:0;background:#f8f9fa;color:#1f2937}
.wrap{max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.header{background:linear-gradient(135deg,#F97316,#EA580C);padding:24px 32px;text-align:center}
.header h1{color:#fff;font-size:22px;margin:0}
.header p{color:rgba(255,255,255,.85);font-size:13px;margin:4px 0 0}
.body{padding:32px}
.body h2{font-size:18px;color:#1f2937;margin:0 0 16px}
.body p{font-size:14px;line-height:1.7;color:#4b5563;margin:0 0 12px}
.info-box{background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:16px;margin:16px 0}
.info-row{display:flex;justify-content:space-between;padding:6px 0;font-size:13px;border-bottom:1px solid #f3f4f6}
.info-row:last-child{border:none}
.info-label{color:#9ca3af}
.info-value{color:#1f2937;font-weight:600}
.btn{display:inline-block;background:#F97316;color:#fff!important;padding:12px 28px;border-radius:24px;text-decoration:none;font-weight:600;font-size:14px;margin:16px 0}
.btn:hover{background:#EA580C}
.footer{background:#f9fafb;padding:20px 32px;text-align:center;font-size:11px;color:#9ca3af;border-top:1px solid #f3f4f6}
.disclaimer{background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:12px;font-size:12px;color:#92400e;margin:16px 0}
</style></head><body><div class="wrap">
<div class="header"><h1>🧳 Jongtour</h1><p>Your Travel Partner</p></div>
<div class="body">${content}</div>
<div class="footer">© 2569 Jongtour Co., Ltd. · <a href="${SITE_URL}">jongtour.com</a></div>
</div></body></html>`;
}

// ─── LINE Flex Templates ───────────────────────────────
function lineFlexNotification(title: string, body: string, btnLabel?: string, btnUrl?: string) {
  const contents: any[] = [
    { type: 'text', text: '🧳 Jongtour', color: '#F97316', weight: 'bold', size: 'sm' },
    { type: 'text', text: title, weight: 'bold', size: 'lg', margin: 'md', wrap: true },
    { type: 'separator', margin: 'lg' },
    { type: 'text', text: body, size: 'sm', color: '#666666', wrap: true, margin: 'lg' },
  ];
  const footer = btnLabel && btnUrl ? {
    type: 'box', layout: 'vertical', contents: [{
      type: 'button', style: 'primary', color: '#F97316', height: 'sm',
      action: { type: 'uri', label: btnLabel, uri: btnUrl },
    }],
  } : undefined;

  return {
    type: 'flex', altText: title,
    contents: { type: 'bubble', body: { type: 'box', layout: 'vertical', contents }, ...(footer && { footer }) },
  };
}

// =====================================================
// PUBLIC API — Notification Templates
// =====================================================

export const NotificationService = {

  // ─── Booking ────────────────────────────────────────
  async bookingConfirmed(customer: { email: string; lineId?: string; id: string }, booking: { bookingRef: string; tourName: string; date: string; pax: number; total: string }) {
    const html = wrapEmail(`
      <h2>✅ การจองยืนยันแล้ว!</h2>
      <p>สวัสดีครับ การจองของคุณได้รับการยืนยันเรียบร้อยแล้ว</p>
      <div class="info-box">
        <div class="info-row"><span class="info-label">Booking Ref</span><span class="info-value">${booking.bookingRef}</span></div>
        <div class="info-row"><span class="info-label">ทัวร์</span><span class="info-value">${booking.tourName}</span></div>
        <div class="info-row"><span class="info-label">วันเดินทาง</span><span class="info-value">${booking.date}</span></div>
        <div class="info-row"><span class="info-label">จำนวน</span><span class="info-value">${booking.pax} ท่าน</span></div>
        <div class="info-row"><span class="info-label">ยอดรวม</span><span class="info-value">${booking.total}</span></div>
      </div>
      <a href="${SITE_URL}/account/bookings/${booking.bookingRef}" class="btn">ดูรายละเอียดการจอง</a>
    `);
    await Promise.all([
      sendEmail(customer.email, `✅ Booking Confirmed — ${booking.bookingRef}`, html),
      customer.lineId && sendLinePush(customer.lineId, [lineFlexNotification(
        '✅ การจองยืนยันแล้ว!',
        `${booking.tourName}\n${booking.date} · ${booking.pax} ท่าน\nRef: ${booking.bookingRef}`,
        'ดูรายละเอียด', `${SITE_URL}/account/bookings/${booking.bookingRef}`
      )]),
      createInApp(customer.id, 'BOOKING', 'การจองยืนยันแล้ว', `${booking.tourName} — ${booking.bookingRef}`, `/account/bookings/${booking.bookingRef}`),
    ]);
  },

  async paymentReceived(customer: { email: string; lineId?: string; id: string }, data: { bookingRef: string; amount: string; method: string }) {
    const html = wrapEmail(`
      <h2>💳 ได้รับการชำระเงินแล้ว</h2>
      <p>ขอบคุณครับ เราได้รับการชำระเงินของคุณเรียบร้อย</p>
      <div class="info-box">
        <div class="info-row"><span class="info-label">Ref</span><span class="info-value">${data.bookingRef}</span></div>
        <div class="info-row"><span class="info-label">จำนวน</span><span class="info-value">${data.amount}</span></div>
        <div class="info-row"><span class="info-label">ช่องทาง</span><span class="info-value">${data.method}</span></div>
      </div>
    `);
    await Promise.all([
      sendEmail(customer.email, `💳 Payment Received — ${data.bookingRef}`, html),
      customer.lineId && sendLinePush(customer.lineId, [lineFlexNotification('💳 ชำระเงินสำเร็จ', `Ref: ${data.bookingRef}\nจำนวน: ${data.amount}`)]),
      createInApp(customer.id, 'PAYMENT', 'ชำระเงินสำเร็จ', `${data.amount} — ${data.bookingRef}`),
    ]);
  },

  // ─── Talent Request ─────────────────────────────────
  async talentRequestSubmitted(customer: { email: string; lineId?: string; id: string }, req: { requestRef: string; talentName: string; tourName: string; date: string }) {
    const html = wrapEmail(`
      <h2>📩 Request ไกด์ส่งแล้ว!</h2>
      <p>คำขอของคุณกำลังรอ admin ตรวจสอบ จะแจ้งผลภายใน 24 ชม.</p>
      <div class="info-box">
        <div class="info-row"><span class="info-label">Ref</span><span class="info-value">${req.requestRef}</span></div>
        <div class="info-row"><span class="info-label">ไกด์</span><span class="info-value">${req.talentName}</span></div>
        <div class="info-row"><span class="info-label">ทัวร์</span><span class="info-value">${req.tourName}</span></div>
        <div class="info-row"><span class="info-label">วันเดินทาง</span><span class="info-value">${req.date}</span></div>
      </div>
      <div class="disclaimer">⚠️ การ request ไกด์เป็นแบบ best-effort — ไม่รับประกันว่าจะได้ไกด์ท่านที่เลือก</div>
      <a href="${SITE_URL}/account/talent-requests/${req.requestRef}" class="btn">ติดตามสถานะ</a>
    `);
    await Promise.all([
      sendEmail(customer.email, `📩 Guide Request Submitted — ${req.requestRef}`, html),
      customer.lineId && sendLinePush(customer.lineId, [lineFlexNotification(
        '📩 ส่ง Request ไกด์แล้ว',
        `ไกด์: ${req.talentName}\nทัวร์: ${req.tourName}\nวันที่: ${req.date}\n\n⚠️ best-effort — รอ admin ตรวจสอบ`,
        'ติดตามสถานะ', `${SITE_URL}/account/talent-requests/${req.requestRef}`
      )]),
      createInApp(customer.id, 'TALENT', 'Request ไกด์ส่งแล้ว', `${req.talentName} — ${req.requestRef}`),
    ]);
  },

  async talentConfirmed(customer: { email: string; lineId?: string; id: string }, req: { requestRef: string; talentName: string; tourName: string; date: string; premium?: string }) {
    const html = wrapEmail(`
      <h2>✅ ยืนยันไกด์แล้ว!</h2>
      <p>เรายินดีแจ้งว่าไกด์ <b>${req.talentName}</b> พร้อมดูแลคุณในทริปนี้</p>
      <div class="info-box">
        <div class="info-row"><span class="info-label">ไกด์</span><span class="info-value">${req.talentName}</span></div>
        <div class="info-row"><span class="info-label">ทัวร์</span><span class="info-value">${req.tourName}</span></div>
        <div class="info-row"><span class="info-label">วันเดินทาง</span><span class="info-value">${req.date}</span></div>
        ${req.premium ? `<div class="info-row"><span class="info-label">Premium</span><span class="info-value">${req.premium}</span></div>` : ''}
      </div>
      <a href="${SITE_URL}/account/talent-requests/${req.requestRef}" class="btn">ดูรายละเอียด</a>
    `);
    await Promise.all([
      sendEmail(customer.email, `✅ Guide Confirmed — ${req.talentName}`, html),
      customer.lineId && sendLinePush(customer.lineId, [lineFlexNotification('✅ ยืนยันไกด์แล้ว!', `ไกด์ ${req.talentName} พร้อมดูแลคุณ\n${req.tourName} · ${req.date}`, 'ดูรายละเอียด', `${SITE_URL}/account/talent-requests/${req.requestRef}`)]),
      createInApp(customer.id, 'TALENT', 'ยืนยันไกด์แล้ว', `${req.talentName} พร้อมดูแลคุณ`),
    ]);
  },

  async talentAlternativeOffered(customer: { email: string; lineId?: string; id: string }, req: { requestRef: string; originalTalent: string; alternatives: string[] }) {
    const altList = req.alternatives.map((a, i) => `${i + 1}. ${a}`).join('\n');
    const html = wrapEmail(`
      <h2>🔄 เสนอทางเลือกไกด์</h2>
      <p>ไกด์ <b>${req.originalTalent}</b> ไม่ว่างในช่วงนี้ เราเสนอทางเลือกดังนี้:</p>
      <div class="info-box">${req.alternatives.map((a, i) => `<div class="info-row"><span class="info-label">#${i + 1}</span><span class="info-value">${a}</span></div>`).join('')}</div>
      <a href="${SITE_URL}/talents/request/alternatives?ref=${req.requestRef}" class="btn">เลือกไกด์</a>
      <div class="disclaimer">⚠️ กรุณาตอบกลับภายใน 48 ชม. มิฉะนั้นระบบจะจัดไกด์ให้อัตโนมัติ</div>
    `);
    await Promise.all([
      sendEmail(customer.email, `🔄 Alternative Guides — ${req.requestRef}`, html),
      customer.lineId && sendLinePush(customer.lineId, [lineFlexNotification('🔄 เสนอทางเลือกไกด์', `${req.originalTalent} ไม่ว่าง\n\nทางเลือก:\n${altList}\n\n⏰ กรุณาตอบภายใน 48 ชม.`, 'เลือกไกด์', `${SITE_URL}/talents/request/alternatives?ref=${req.requestRef}`)]),
      createInApp(customer.id, 'TALENT', 'เสนอทางเลือกไกด์', `${req.originalTalent} ไม่ว่าง — เลือกไกด์ใหม่`),
    ]);
  },

  // ─── Talent-facing (push to guide) ──────────────────
  async notifyTalentNewRequest(talent: { email: string; lineId?: string }, req: { requestRef: string; tourName: string; date: string; pax: number }) {
    const html = wrapEmail(`
      <h2>📩 มี Request ใหม่!</h2>
      <div class="info-box">
        <div class="info-row"><span class="info-label">ทัวร์</span><span class="info-value">${req.tourName}</span></div>
        <div class="info-row"><span class="info-label">วันเดินทาง</span><span class="info-value">${req.date}</span></div>
        <div class="info-row"><span class="info-label">ผู้เดินทาง</span><span class="info-value">${req.pax} ท่าน</span></div>
      </div>
      <a href="${SITE_URL}/talent-portal/requests/${req.requestRef}" class="btn">ดู Request</a>
    `);
    await Promise.all([
      sendEmail(talent.email, `📩 New Guide Request — ${req.requestRef}`, html),
      talent.lineId && sendLinePush(talent.lineId, [lineFlexNotification('📩 มี Request ใหม่!', `${req.tourName}\n${req.date} · ${req.pax} pax`, 'ดู Request', `${SITE_URL}/talent-portal/requests/${req.requestRef}`)]),
    ]);
  },

  async notifyTalentReminder(talent: { email: string; lineId?: string }, req: { requestRef: string; tourName: string; hoursLeft: number }) {
    const msg = `⏰ กรุณาตอบ Request ${req.requestRef} ภายใน ${req.hoursLeft} ชม.\n${req.tourName}`;
    await Promise.all([
      sendEmail(talent.email, `⏰ Reminder — ${req.requestRef}`, wrapEmail(`<h2>⏰ Reminder</h2><p>${msg}</p>`)),
      talent.lineId && sendLinePush(talent.lineId, [{ type: 'text', text: msg }]),
    ]);
  },

  // ─── Visa ───────────────────────────────────────────
  async visaStatusUpdate(customer: { email: string; lineId?: string; id: string }, visa: { country: string; status: string; note?: string }) {
    const statusMap: Record<string, string> = { APPROVED: '✅ อนุมัติแล้ว', REJECTED: '❌ ไม่ผ่าน', UNDER_REVIEW: '🔍 กำลังตรวจสอบ', DOCUMENTS_REQUIRED: '📄 ต้องส่งเอกสารเพิ่ม' };
    const statusText = statusMap[visa.status] || visa.status;
    const html = wrapEmail(`
      <h2>${statusText}</h2>
      <p>วีซ่า ${visa.country} ของคุณ: <b>${statusText}</b></p>
      ${visa.note ? `<div class="info-box"><p>${visa.note}</p></div>` : ''}
      <a href="${SITE_URL}/account/visa" class="btn">ดูรายละเอียด</a>
    `);
    await Promise.all([
      sendEmail(customer.email, `${statusText} — วีซ่า ${visa.country}`, html),
      customer.lineId && sendLinePush(customer.lineId, [lineFlexNotification(statusText, `วีซ่า ${visa.country}\n${visa.note || ''}`, 'ดูรายละเอียด', `${SITE_URL}/account/visa`)]),
      createInApp(customer.id, 'SYSTEM', statusText, `วีซ่า ${visa.country}`),
    ]);
  },

  // ─── Affiliate ──────────────────────────────────────
  async affiliateCommissionEarned(affiliate: { email: string }, data: { bookingRef: string; amount: string; productType: string }) {
    await sendEmail(affiliate.email, `💰 Commission Earned — ${data.amount}`, wrapEmail(`
      <h2>💰 Commission!</h2>
      <p>คุณได้รับ commission จากการแนะนำ</p>
      <div class="info-box">
        <div class="info-row"><span class="info-label">Booking</span><span class="info-value">${data.bookingRef}</span></div>
        <div class="info-row"><span class="info-label">ประเภท</span><span class="info-value">${data.productType}</span></div>
        <div class="info-row"><span class="info-label">Commission</span><span class="info-value">${data.amount}</span></div>
      </div>
      <a href="${SITE_URL}/affiliate/commissions" class="btn">ดูรายละเอียด</a>
    `));
  },

  async affiliatePayoutProcessed(affiliate: { email: string }, data: { payoutRef: string; netAmount: string; period: string }) {
    await sendEmail(affiliate.email, `💸 Payout Processed — ${data.payoutRef}`, wrapEmail(`
      <h2>💸 จ่ายเงินแล้ว!</h2>
      <div class="info-box">
        <div class="info-row"><span class="info-label">Ref</span><span class="info-value">${data.payoutRef}</span></div>
        <div class="info-row"><span class="info-label">งวด</span><span class="info-value">${data.period}</span></div>
        <div class="info-row"><span class="info-label">ยอดสุทธิ</span><span class="info-value">${data.netAmount}</span></div>
      </div>
    `));
  },

  // ─── Admin Alerts ───────────────────────────────────
  async adminAlert(message: string, urgency: 'INFO' | 'WARNING' | 'CRITICAL' = 'INFO') {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@jongtour.com';
    const emoji = { INFO: 'ℹ️', WARNING: '⚠️', CRITICAL: '🚨' }[urgency];
    await sendEmail(adminEmail, `${emoji} [${urgency}] ${message}`, wrapEmail(`<h2>${emoji} Admin Alert</h2><p>${message}</p><p>Urgency: <b>${urgency}</b></p>`));
  },

  async adminTalentRequestAlert(req: { requestRef: string; customerName: string; talentName: string; tourName: string }) {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@jongtour.com';
    await sendEmail(adminEmail, `📩 New Talent Request — ${req.requestRef}`, wrapEmail(`
      <h2>📩 Talent Request ใหม่</h2>
      <div class="info-box">
        <div class="info-row"><span class="info-label">Ref</span><span class="info-value">${req.requestRef}</span></div>
        <div class="info-row"><span class="info-label">ลูกค้า</span><span class="info-value">${req.customerName}</span></div>
        <div class="info-row"><span class="info-label">ไกด์</span><span class="info-value">${req.talentName}</span></div>
        <div class="info-row"><span class="info-label">ทัวร์</span><span class="info-value">${req.tourName}</span></div>
      </div>
      <a href="${SITE_URL}/talent-admin/requests/${req.requestRef}" class="btn">Review Request</a>
    `));
  },

  // ─── Trip Pre-briefing (3 days before) ──────────────
  async tripPreBriefing(talent: { email: string; lineId?: string }, trip: { tourName: string; date: string; pax: number; customerName: string; specialNeeds?: string }) {
    const html = wrapEmail(`
      <h2>📋 Pre-briefing: ${trip.tourName}</h2>
      <p>ทริปของคุณจะเริ่มในอีก 3 วัน!</p>
      <div class="info-box">
        <div class="info-row"><span class="info-label">ทัวร์</span><span class="info-value">${trip.tourName}</span></div>
        <div class="info-row"><span class="info-label">วันเดินทาง</span><span class="info-value">${trip.date}</span></div>
        <div class="info-row"><span class="info-label">ลูกค้า</span><span class="info-value">${trip.customerName} + ${trip.pax - 1} ท่าน</span></div>
        ${trip.specialNeeds ? `<div class="info-row"><span class="info-label">หมายเหตุ</span><span class="info-value">${trip.specialNeeds}</span></div>` : ''}
      </div>
    `);
    await Promise.all([
      sendEmail(talent.email, `📋 Pre-briefing — ${trip.tourName} (${trip.date})`, html),
      talent.lineId && sendLinePush(talent.lineId, [lineFlexNotification('📋 Pre-briefing', `${trip.tourName}\n${trip.date}\nลูกค้า: ${trip.customerName}\n${trip.pax} pax${trip.specialNeeds ? `\n⚠️ ${trip.specialNeeds}` : ''}`)]),
    ]);
  },
};
