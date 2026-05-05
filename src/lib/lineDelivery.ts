/**
 * LINE Document Delivery
 * Uses LINE Messaging API Push Message to send document links.
 */

const LINE_API_URL = 'https://api.line.me/v2/bot/message/push';

export async function sendLineDocument(
  lineUserId: string,
  documentType: string,
  documentNo: string,
  downloadUrl: string,
) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    throw new Error('LINE_CHANNEL_ACCESS_TOKEN not configured');
  }

  const typeLabels: Record<string, string> = {
    INVOICE: '📄 ใบแจ้งหนี้',
    RECEIPT: '🧾 ใบเสร็จรับเงิน',
    VOUCHER: '🎫 Travel Voucher',
    BOOKING_CONFIRMATION: '✅ ยืนยันการจอง',
    TRAVEL_APPOINTMENT: '🗓️ ใบนัดหมายการเดินทาง',
    PAYMENT_REMINDER: '⏰ แจ้งเตือนชำระเงิน',
    QUOTATION: '💰 ใบเสนอราคา',
    PRIVATE_GROUP_PROPOSAL: '🏝️ ข้อเสนอกรุ๊ปส่วนตัว',
  };

  const label = typeLabels[documentType] || `📄 ${documentType}`;

  const body = {
    to: lineUserId,
    messages: [
      {
        type: 'flex',
        altText: `${label} — ${documentNo}`,
        contents: {
          type: 'bubble',
          size: 'kilo',
          header: {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#1E3A5F',
            paddingAll: '15px',
            contents: [
              { type: 'text', text: 'Jongtour', color: '#F59E0B', size: 'lg', weight: 'bold' },
              { type: 'text', text: label, color: '#FFFFFF', size: 'sm', margin: 'sm' },
            ],
          },
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              { type: 'text', text: `เลขที่: ${documentNo}`, size: 'sm', color: '#333333', weight: 'bold' },
              { type: 'text', text: `วันที่: ${new Date().toLocaleDateString('th-TH')}`, size: 'xs', color: '#999999', margin: 'sm' },
              { type: 'separator', margin: 'md' },
              { type: 'text', text: 'กดปุ่มด้านล่างเพื่อดาวน์โหลดเอกสาร', size: 'xs', color: '#666666', margin: 'md', wrap: true },
            ],
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'button',
                action: { type: 'uri', label: 'ดาวน์โหลดเอกสาร', uri: downloadUrl },
                style: 'primary',
                color: '#F59E0B',
              },
            ],
          },
        },
      },
    ],
  };

  const response = await fetch(LINE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LINE API Error ${response.status}: ${errorText}`);
  }

  return { success: true };
}

/**
 * Send payment reminder via LINE
 */
export async function sendLinePaymentReminder(
  lineUserId: string,
  bookingRef: string,
  amount: number,
  dueDate: Date,
  paymentUrl: string,
) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) throw new Error('LINE_CHANNEL_ACCESS_TOKEN not configured');

  const body = {
    to: lineUserId,
    messages: [
      {
        type: 'flex',
        altText: `⏰ แจ้งเตือนชำระเงิน — ${bookingRef}`,
        contents: {
          type: 'bubble',
          size: 'kilo',
          header: {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#DC2626',
            paddingAll: '15px',
            contents: [
              { type: 'text', text: '⏰ แจ้งเตือนชำระเงิน', color: '#FFFFFF', weight: 'bold' },
            ],
          },
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              { type: 'text', text: `Booking: ${bookingRef}`, size: 'sm', weight: 'bold' },
              { type: 'text', text: `ยอด: ฿${amount.toLocaleString()}`, size: 'md', weight: 'bold', color: '#DC2626', margin: 'sm' },
              { type: 'text', text: `กำหนดชำระ: ${dueDate.toLocaleDateString('th-TH')}`, size: 'xs', color: '#666', margin: 'sm' },
            ],
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'button',
                action: { type: 'uri', label: 'ชำระเงินเลย', uri: paymentUrl },
                style: 'primary',
                color: '#059669',
              },
            ],
          },
        },
      },
    ],
  };

  const response = await fetch(LINE_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`LINE API Error: ${await response.text()}`);
  }

  return { success: true };
}
