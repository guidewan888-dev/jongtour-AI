/**
 * Wholesale Automation AI Tools
 * 
 * 11 function-calling tools for AI to orchestrate wholesale booking
 * 
 * กฎ AI:
 * - AI ทำหน้าที่ Controller/Orchestrator เท่านั้น
 * - ห้ามเข้าถึง raw password
 * - ห้ามเรียก submit โดยไม่ผ่าน admin approve
 * - ทุกขั้นตอนต้อง log ใน audit trail
 */

import OpenAI from 'openai';

// ============================================================
// TOOL DEFINITIONS (for OpenAI function calling)
// ============================================================

export const wholesaleTools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_booking_detail",
      description: "ดึงรายละเอียด Booking สำหรับ Wholesale automation — ข้อมูลลูกค้า ผู้เดินทาง ทัวร์ วันเดินทาง",
      parameters: {
        type: "object",
        properties: {
          booking_id: { type: "string", description: "Booking ID (cuid)" },
          booking_ref: { type: "string", description: "Booking Reference (เช่น JT-250501-1234)" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "validate_booking_for_wholesale",
      description: "ตรวจสอบว่า Booking พร้อมจอง Wholesale หรือไม่ — ตรวจ supplier, credentials, automation config",
      parameters: {
        type: "object",
        properties: {
          booking_id: { type: "string", description: "Booking ID" },
        },
        required: ["booking_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_supplier_automation_config",
      description: "ดึงข้อมูลการตั้งค่า automation ของ Supplier — login URL, selectors, booking method",
      parameters: {
        type: "object",
        properties: {
          supplier_id: { type: "string", description: "Supplier ID" },
        },
        required: ["supplier_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "start_wholesale_rpa_session",
      description: "เริ่มเซสชัน RPA สำหรับจอง Wholesale — สร้างเซสชันใหม่และเริ่ม bot",
      parameters: {
        type: "object",
        properties: {
          booking_id: { type: "string", description: "Booking ID" },
          started_by: { type: "string", description: "ผู้เริ่ม (ADMIN หรือ AI)" },
        },
        required: ["booking_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_rpa_session_status",
      description: "ดึงสถานะ RPA session ล่าสุด — bot status, screenshots, actions",
      parameters: {
        type: "object",
        properties: {
          booking_id: { type: "string", description: "Booking ID" },
        },
        required: ["booking_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "request_admin_approval",
      description: "ขอให้ Admin มาอนุมัติก่อน Submit จอง — Bot ห้าม Submit เองถ้าไม่ได้รับอนุมัติ",
      parameters: {
        type: "object",
        properties: {
          session_id: { type: "string", description: "RPA Session ID" },
          filled_summary: { type: "string", description: "สรุปข้อมูลที่กรอกแล้ว" },
        },
        required: ["session_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "capture_wholesale_screenshot",
      description: "สั่ง Bot ถ่ายภาพหน้าจอ Wholesale ปัจจุบัน",
      parameters: {
        type: "object",
        properties: {
          session_id: { type: "string", description: "RPA Session ID" },
          label: { type: "string", description: "ชื่อภาพ เช่น before-fill, after-fill" },
        },
        required: ["session_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "save_external_booking_ref",
      description: "บันทึกเลขจอง Wholesale ที่ได้จากเว็บ — ใช้ได้ทั้งจาก Bot และ Admin ใส่มือ",
      parameters: {
        type: "object",
        properties: {
          booking_id: { type: "string", description: "Booking ID" },
          external_ref: { type: "string", description: "เลขจอง Wholesale (เช่น WB-2026-12345)" },
          wholesale_status: { type: "string", description: "สถานะ: CONFIRMED, WAITING_CONFIRM" },
        },
        required: ["booking_id", "external_ref"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "mark_manual_follow_up",
      description: "ส่งต่อให้ Admin ทำเอง — ใช้เมื่อ Bot ทำไม่ได้ (CAPTCHA, OTP, selector ไม่ตรง)",
      parameters: {
        type: "object",
        properties: {
          booking_id: { type: "string", description: "Booking ID" },
          session_id: { type: "string", description: "RPA Session ID (ถ้ามี)" },
          reason: { type: "string", description: "เหตุผลที่ Bot ทำไม่ได้" },
        },
        required: ["booking_id", "reason"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_wholesale_copy_helper",
      description: "สร้างข้อความสรุป Booking สำหรับ Copy/Paste ไปกรอกใน Wholesale เอง",
      parameters: {
        type: "object",
        properties: {
          booking_id: { type: "string", description: "Booking ID" },
        },
        required: ["booking_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "stop_rpa_session",
      description: "หยุด RPA session ที่กำลังทำงาน — กรณี Bot ทำงานผิดพลาดหรือ Admin ต้องการหยุด",
      parameters: {
        type: "object",
        properties: {
          session_id: { type: "string", description: "RPA Session ID" },
          reason: { type: "string", description: "เหตุผลที่หยุด" },
        },
        required: ["session_id"],
      },
    },
  },
];

// ============================================================
// TOOL EXECUTOR
// ============================================================

/**
 * Execute a wholesale tool call from AI
 * ห้าม AI เข้าถึง credentials หรือ submit โดยตรง
 */
export async function executeWholesaleTool(
  toolName: string,
  args: any,
  baseUrl: string
): Promise<string> {
  try {
    switch (toolName) {
      case 'get_booking_detail': {
        const bookingId = args.booking_id || args.booking_ref;
        const { prisma } = await import('@/lib/prisma');
        const booking = await prisma.booking.findFirst({
          where: args.booking_id ? { id: args.booking_id } : { bookingRef: args.booking_ref },
          include: {
            customer: { select: { firstName: true, lastName: true, email: true, phone: true } },
            tour: { select: { tourName: true, tourCode: true, externalTourId: true, bookingUrl: true } },
            departure: { select: { startDate: true, endDate: true, remainingSeats: true } },
            supplier: { select: { id: true, displayName: true, canonicalName: true } },
            travelers: { select: { title: true, firstName: true, lastName: true, paxType: true, passportNo: true, dateOfBirth: true } },
            wholesaleRef: true,
          },
        });
        if (!booking) return JSON.stringify({ error: 'Booking not found' });
        return JSON.stringify({
          booking_id: booking.id,
          booking_ref: booking.bookingRef,
          status: booking.status,
          wholesale_status: booking.wholesaleStatus,
          wholesale_method: booking.wholesaleBookingMethod,
          supplier: booking.supplier,
          tour: booking.tour,
          departure: booking.departure,
          customer: booking.customer,
          travelers_count: booking.travelers.length,
          travelers: booking.travelers,
          external_ref: booking.wholesaleRef?.externalBookingRef || null,
          total_price: booking.totalPrice,
        });
      }

      case 'validate_booking_for_wholesale': {
        const res = await fetch(`${baseUrl}/api/admin/bookings/${args.booking_id}/wholesale-automation`);
        const data = await res.json();
        if (!data.success) return JSON.stringify({ error: data.error });
        return JSON.stringify({
          booking_id: data.data.bookingId,
          booking_ref: data.data.bookingRef,
          supplier: data.data.supplier?.displayName,
          automation_supported: data.data.automationSupported,
          credential_status: data.data.credentialStatus,
          bot_status: data.data.botStatus,
          wholesale_status: data.data.wholesaleStatus,
          ready: data.data.automationSupported && data.data.credentialStatus === 'CONFIGURED',
          issues: [
            !data.data.automationSupported && 'Automation not supported for this supplier',
            data.data.credentialStatus !== 'CONFIGURED' && 'Credentials not configured',
          ].filter(Boolean),
        });
      }

      case 'get_supplier_automation_config': {
        const res = await fetch(`${baseUrl}/api/admin/suppliers/${args.supplier_id}/automation-config`);
        const data = await res.json();
        if (!data.success) return JSON.stringify({ error: data.error });
        if (!data.data) return JSON.stringify({ configured: false, message: 'No automation config for this supplier' });
        return JSON.stringify({
          configured: true,
          enabled: data.data.automationEnabled,
          login_url: data.data.loginUrl,
          booking_method: data.data.bookingMethod,
          requires_approval: data.data.requiresAdminApproval,
          status: data.data.status,
          // ห้ามส่ง selectors ให้ AI — เป็นข้อมูล internal
        });
      }

      case 'start_wholesale_rpa_session': {
        const res = await fetch(`${baseUrl}/api/admin/bookings/${args.booking_id}/wholesale-automation/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ startedBy: args.started_by || 'AI' }),
        });
        const data = await res.json();
        return JSON.stringify(data);
      }

      case 'get_rpa_session_status': {
        const res = await fetch(`${baseUrl}/api/admin/bookings/${args.booking_id}/wholesale-automation`);
        const data = await res.json();
        if (!data.success) return JSON.stringify({ error: data.error });
        return JSON.stringify({
          bot_status: data.data.botStatus,
          session_id: data.data.currentSessionId,
          last_error: data.data.lastErrorMessage,
          screenshots_count: data.data.screenshots?.length || 0,
          admin_approved: !!data.data.adminApprovedBy,
          external_ref: data.data.externalBookingRef,
        });
      }

      case 'request_admin_approval': {
        const res = await fetch(`${baseUrl}/api/admin/bookings/${args.booking_id || 'unknown'}/wholesale-automation/request-approval`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: args.session_id, filledSummary: args.filled_summary }),
        });
        return JSON.stringify(await res.json());
      }

      case 'capture_wholesale_screenshot': {
        // Delegate to bot service if available
        return JSON.stringify({ status: 'DELEGATED', message: 'Screenshot capture is handled by the RPA bot service' });
      }

      case 'save_external_booking_ref': {
        const res = await fetch(`${baseUrl}/api/admin/bookings/${args.booking_id}/external-booking-ref`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            externalBookingRef: args.external_ref,
            wholesaleStatus: args.wholesale_status || 'CONFIRMED',
            createdBy: 'AI',
          }),
        });
        return JSON.stringify(await res.json());
      }

      case 'mark_manual_follow_up': {
        const res = await fetch(`${baseUrl}/api/admin/bookings/${args.booking_id}/wholesale-automation/manual-follow-up`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: args.session_id,
            reason: args.reason,
            markedBy: 'AI',
          }),
        });
        return JSON.stringify(await res.json());
      }

      case 'get_wholesale_copy_helper': {
        const res = await fetch(`${baseUrl}/api/admin/bookings/${args.booking_id}/copy-helper`);
        const data = await res.json();
        return data.success ? data.data : JSON.stringify({ error: data.error });
      }

      case 'stop_rpa_session': {
        // Find booking by session
        const { prisma } = await import('@/lib/prisma');
        const session = await (prisma as any).wholesaleRpaSession.findUnique({
          where: { id: args.session_id },
          select: { bookingId: true },
        });
        if (!session) return JSON.stringify({ error: 'Session not found' });

        const res = await fetch(`${baseUrl}/api/admin/bookings/${session.bookingId}/wholesale-automation/stop`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: args.session_id, reason: args.reason, stoppedBy: 'AI' }),
        });
        return JSON.stringify(await res.json());
      }

      default:
        return JSON.stringify({ error: `Unknown wholesale tool: ${toolName}` });
    }
  } catch (err: any) {
    return JSON.stringify({ error: err.message });
  }
}

/**
 * Check if a tool name is a wholesale tool
 */
export function isWholesaleTool(name: string): boolean {
  return wholesaleTools.some(t => t.function.name === name);
}
