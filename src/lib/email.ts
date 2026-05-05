import { Resend } from 'resend';

// ============================================================
// RESEND CLIENT
// ============================================================

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error('RESEND_API_KEY is not set');
    _resend = new Resend(apiKey);
  }
  return _resend;
}

// Email sender — update after domain verification
const FROM_EMAIL = process.env.EMAIL_FROM || 'Jongtour <noreply@jongtour.com>';

// ============================================================
// EMAIL TEMPLATES
// ============================================================

function baseLayout(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #f4f5f7; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1e3a5f 0%, #2d5a8a 100%); padding: 32px 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; }
    .header h1 span { color: #f59e0b; }
    .body { padding: 32px 24px; color: #333; line-height: 1.6; }
    .body h2 { color: #1e3a5f; margin-top: 0; }
    .btn { display: inline-block; padding: 14px 32px; background: #f59e0b; color: #1e3a5f !important; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; }
    .footer { background: #f9fafb; padding: 20px 24px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
    .info-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin: 16px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .info-label { font-weight: 600; color: #64748b; }
    .info-value { color: #1e293b; font-weight: 500; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div style="padding: 24px 16px;">
    <div class="container">
      <div class="header">
        <h1>Jong<span>tour</span></h1>
      </div>
      <div class="body">
        ${content}
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Jongtour Co., Ltd. สงวนลิขสิทธิ์</p>
        <p>หากคุณไม่ได้ดำเนินการนี้ กรุณาเพิกเฉยอีเมลนี้</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ============================================================
// EMAIL FUNCTIONS
// ============================================================

export type SendEmailResult = { success: true; messageId: string } | { success: false; error: string };

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmation(params: {
  to: string;
  bookingNo: string;
  tourName: string;
  departureDate: string;
  travelers: number;
  totalAmount: number;
  currency?: string;
}): Promise<SendEmailResult> {
  const { to, bookingNo, tourName, departureDate, travelers, totalAmount, currency = 'THB' } = params;
  
  const html = baseLayout(`
    <h2>🎉 ยืนยันการจอง</h2>
    <p>สวัสดีค่ะ ขอบคุณที่เลือกใช้บริการ Jongtour</p>
    <p>การจองของคุณได้รับการยืนยันเรียบร้อยแล้ว</p>
    
    <div class="info-box">
      <table>
        <tr><td class="info-label">หมายเลขจอง</td><td class="info-value"><strong>${bookingNo}</strong></td></tr>
        <tr><td class="info-label">ทัวร์</td><td class="info-value">${tourName}</td></tr>
        <tr><td class="info-label">วันเดินทาง</td><td class="info-value">${departureDate}</td></tr>
        <tr><td class="info-label">จำนวนผู้เดินทาง</td><td class="info-value">${travelers} คน</td></tr>
        <tr><td class="info-label">ยอดรวม</td><td class="info-value" style="color: #059669; font-size: 18px; font-weight: 700;">฿${totalAmount.toLocaleString()}</td></tr>
      </table>
    </div>
    
    <p style="text-align: center; margin-top: 24px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://jongtour.com'}/account/bookings/${bookingNo}" class="btn">
        ดูรายละเอียดการจอง
      </a>
    </p>
    
    <p style="margin-top: 24px; color: #64748b; font-size: 14px;">
      หากมีคำถามเพิ่มเติม สามารถติดต่อเราได้ที่ LINE: @Jongtour หรือโทร 02-XXX-XXXX
    </p>
  `);

  return sendEmail({ to, subject: `✅ ยืนยันการจอง ${bookingNo} - ${tourName}`, html });
}

/**
 * Send payment receipt email
 */
export async function sendPaymentReceipt(params: {
  to: string;
  bookingNo: string;
  paymentId: string;
  amount: number;
  method: string;
  paidAt: string;
}): Promise<SendEmailResult> {
  const { to, bookingNo, paymentId, amount, method, paidAt } = params;
  
  const html = baseLayout(`
    <h2>💳 ใบเสร็จรับเงิน</h2>
    <p>ขอบคุณสำหรับการชำระเงิน การชำระเงินของคุณเสร็จสมบูรณ์แล้ว</p>
    
    <div class="info-box">
      <table>
        <tr><td class="info-label">หมายเลขจอง</td><td class="info-value">${bookingNo}</td></tr>
        <tr><td class="info-label">หมายเลขชำระเงิน</td><td class="info-value">${paymentId}</td></tr>
        <tr><td class="info-label">จำนวนเงิน</td><td class="info-value" style="color: #059669; font-weight: 700;">฿${amount.toLocaleString()}</td></tr>
        <tr><td class="info-label">ช่องทาง</td><td class="info-value">${method}</td></tr>
        <tr><td class="info-label">วันที่ชำระ</td><td class="info-value">${paidAt}</td></tr>
      </table>
    </div>
  `);

  return sendEmail({ to, subject: `💳 ใบเสร็จรับเงิน - การจอง ${bookingNo}`, html });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(params: {
  to: string;
  resetUrl: string;
  name?: string;
}): Promise<SendEmailResult> {
  const { to, resetUrl, name = 'คุณ' } = params;
  
  const html = baseLayout(`
    <h2>🔑 รีเซ็ตรหัสผ่าน</h2>
    <p>สวัสดี${name} เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ</p>
    <p>คลิกปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่:</p>
    
    <p style="text-align: center; margin: 32px 0;">
      <a href="${resetUrl}" class="btn">รีเซ็ตรหัสผ่าน</a>
    </p>
    
    <p style="color: #9ca3af; font-size: 13px;">
      ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยอีเมลนี้
    </p>
  `);

  return sendEmail({ to, subject: '🔑 รีเซ็ตรหัสผ่าน - Jongtour', html });
}

/**
 * Send admin invite email
 */
export async function sendAdminInviteEmail(params: {
  to: string;
  name: string;
  role: string;
  inviteUrl: string;
}): Promise<SendEmailResult> {
  const { to, name, role, inviteUrl } = params;
  
  const html = baseLayout(`
    <h2>🎉 เชิญเข้าร่วมทีม Jongtour</h2>
    <p>สวัสดี${name}</p>
    <p>คุณได้รับเชิญให้เข้าร่วมทีม Jongtour ในตำแหน่ง <strong>${role}</strong></p>
    
    <p style="text-align: center; margin: 32px 0;">
      <a href="${inviteUrl}" class="btn">ยอมรับคำเชิญ</a>
    </p>
    
    <p style="color: #9ca3af; font-size: 13px;">
      คำเชิญนี้จะหมดอายุใน 7 วัน
    </p>
  `);

  return sendEmail({ to, subject: `🎉 เชิญเข้าร่วมทีม Jongtour - ${role}`, html });
}

/**
 * Send generic notification email
 */
export async function sendNotificationEmail(params: {
  to: string;
  subject: string;
  title: string;
  body: string;
  ctaText?: string;
  ctaUrl?: string;
}): Promise<SendEmailResult> {
  const { to, subject, title, body, ctaText, ctaUrl } = params;
  
  let ctaHtml = '';
  if (ctaText && ctaUrl) {
    ctaHtml = `<p style="text-align: center; margin: 24px 0;"><a href="${ctaUrl}" class="btn">${ctaText}</a></p>`;
  }

  const html = baseLayout(`
    <h2>${title}</h2>
    <p>${body}</p>
    ${ctaHtml}
  `);

  return sendEmail({ to, subject, html });
}

/**
 * #5 — Send AI Lead Notification to Sales Team
 * Triggered when AI creates a new lead from chat
 */
export async function sendAiLeadNotification(params: {
  leadId: string;
  customerName: string;
  contactInfo: string;
  destination?: string;
  travelDate?: string;
  pax?: number;
  message?: string;
}): Promise<SendEmailResult> {
  const { leadId, customerName, contactInfo, destination, travelDate, pax, message } = params;
  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://jongtour.com'}/admin/crm/leads`;
  
  const html = baseLayout(`
    <h2>🤖 AI สร้าง Lead ใหม่!</h2>
    <p style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 12px; font-weight: 600;">
      ลูกค้าสนใจจาก AI Chat — กรุณาติดต่อกลับภายใน 30 นาที
    </p>
    
    <div class="info-box">
      <table>
        <tr><td class="info-label">Lead ID</td><td class="info-value"><strong>${leadId}</strong></td></tr>
        <tr><td class="info-label">ชื่อลูกค้า</td><td class="info-value">${customerName}</td></tr>
        <tr><td class="info-label">ช่องทางติดต่อ</td><td class="info-value">${contactInfo}</td></tr>
        ${destination ? `<tr><td class="info-label">จุดหมาย</td><td class="info-value">${destination}</td></tr>` : ''}
        ${travelDate ? `<tr><td class="info-label">ช่วงเวลา</td><td class="info-value">${travelDate}</td></tr>` : ''}
        ${pax ? `<tr><td class="info-label">จำนวน</td><td class="info-value">${pax} คน</td></tr>` : ''}
        ${message ? `<tr><td class="info-label">ข้อความ</td><td class="info-value">${message}</td></tr>` : ''}
      </table>
    </div>
    
    <p style="text-align: center; margin-top: 24px;">
      <a href="${adminUrl}" class="btn">เปิด CRM Dashboard</a>
    </p>
    
    <p style="color: #9ca3af; font-size: 13px; margin-top: 16px;">
      Lead นี้ถูกสร้างอัตโนมัติโดย AI Sales Agent เมื่อ ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}
    </p>
  `);

  const salesEmail = process.env.SALES_TEAM_EMAIL || process.env.ADMIN_EMAIL || 'sales@jongtour.com';
  return sendEmail({ to: salesEmail, subject: `🤖 [AI Lead] ${customerName} — ${destination || 'ไม่ระบุจุดหมาย'}`, html });
}
/**
 * Generic Document Email — works for all 13 document types
 */
export async function sendDocumentEmail(params: {
  to: string;
  documentType: string;
  documentNo: string;
  customerName: string;
  pdfUrl: string;
}): Promise<SendEmailResult> {
  const { to, documentType, documentNo, customerName, pdfUrl } = params;

  const typeLabels: Record<string, { emoji: string; title: string; thTitle: string }> = {
    INVOICE: { emoji: '📄', title: 'Invoice', thTitle: 'ใบแจ้งหนี้' },
    RECEIPT: { emoji: '🧾', title: 'Receipt', thTitle: 'ใบเสร็จรับเงิน' },
    VOUCHER: { emoji: '🎫', title: 'Travel Voucher', thTitle: 'เอกสารการเดินทาง' },
    BOOKING_CONFIRMATION: { emoji: '✅', title: 'Booking Confirmation', thTitle: 'ยืนยันการจอง' },
    TRAVEL_APPOINTMENT: { emoji: '🗓️', title: 'Travel Appointment', thTitle: 'ใบนัดหมายการเดินทาง' },
    PAYMENT_REMINDER: { emoji: '⏰', title: 'Payment Reminder', thTitle: 'แจ้งเตือนชำระเงิน' },
    QUOTATION: { emoji: '💰', title: 'Quotation', thTitle: 'ใบเสนอราคา' },
    TAX_INVOICE: { emoji: '🏢', title: 'Tax Invoice', thTitle: 'ใบกำกับภาษี' },
    WITHHOLDING_CERT: { emoji: '📋', title: 'Withholding Certificate', thTitle: 'หนังสือรับรองหัก ณ ที่จ่าย' },
    TRAVELER_LIST: { emoji: '👥', title: 'Traveler List', thTitle: 'รายชื่อผู้เดินทาง' },
    SUPPLIER_CONFIRMATION: { emoji: '🤝', title: 'Supplier Confirmation', thTitle: 'ยืนยันกับซัพพลายเออร์' },
    PRIVATE_GROUP_PROPOSAL: { emoji: '🏝️', title: 'Private Group Proposal', thTitle: 'ข้อเสนอกรุ๊ปส่วนตัว' },
  };

  const label = typeLabels[documentType] || { emoji: '📄', title: documentType, thTitle: documentType };

  const html = baseLayout(`
    <h2>${label.emoji} ${label.thTitle}</h2>
    <p>สวัสดีคุณ${customerName}</p>
    <p>เอกสาร <strong>${label.title}</strong> ของคุณพร้อมแล้ว</p>

    <div class="info-box">
      <table>
        <tr><td class="info-label">ประเภทเอกสาร</td><td class="info-value">${label.thTitle}</td></tr>
        <tr><td class="info-label">เลขที่เอกสาร</td><td class="info-value"><strong>${documentNo}</strong></td></tr>
        <tr><td class="info-label">วันที่ออก</td><td class="info-value">${new Date().toLocaleDateString('th-TH')}</td></tr>
      </table>
    </div>

    <p style="text-align: center; margin: 24px 0;">
      <a href="${pdfUrl}" class="btn">ดาวน์โหลดเอกสาร</a>
    </p>

    <p style="color: #64748b; font-size: 13px;">
      หากมีคำถามเพิ่มเติม สามารถติดต่อเราได้ที่ LINE: @Jongtour หรือโทร 02-XXX-XXXX
    </p>
  `);

  return sendEmail({ to, subject: `${label.emoji} ${label.thTitle} — ${documentNo} | Jongtour`, html });
}

// ============================================================
// CORE SEND FUNCTION
// ============================================================

async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendEmailResult> {
  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    if (error) {
      console.error('Resend Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id || 'unknown' };
  } catch (err) {
    console.error('Email Send Error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown email error' };
  }
}
