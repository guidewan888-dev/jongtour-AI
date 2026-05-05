export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auditLog } from '@/lib/logger';

/**
 * GET /api/admin/suppliers/[id]/automation-config
 * Get supplier automation configuration (selectors, URLs, rules)
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: supplierId } = await params;
  try {
    const config = await (prisma as any).supplierAutomationConfig.findUnique({
      where: { supplierId },
    });

    if (!config) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No automation config — use POST to create',
      });
    }

    return NextResponse.json({ success: true, data: config });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/suppliers/[id]/automation-config
 * Create or update supplier automation config
 * แต่ละ Supplier หน้าเว็บไม่เหมือนกัน จึงต้องมี automation config แยก
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: supplierId } = await params;
  try {
    const body = await req.json();

    // Validate supplier exists
    const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
    if (!supplier) {
      return NextResponse.json({ success: false, error: 'Supplier not found' }, { status: 404 });
    }

    // Build selectors JSON from individual fields
    const selectorsJson = body.selectors || {
      usernameField: body.usernameFieldSelector || null,
      passwordField: body.passwordFieldSelector || null,
      submitLogin: body.submitLoginSelector || null,
      tourSearch: body.tourSearchUrl || null,
      departureField: body.departureFieldSelector || null,
      paxField: body.paxFieldSelector || null,
      travelerName: body.travelerNameSelector || null,
      phone: body.phoneSelector || null,
      email: body.emailSelector || null,
      submitBooking: body.submitBookingSelector || null,
      confirmationRef: body.confirmationRefSelector || null,
    };

    const config = await (prisma as any).supplierAutomationConfig.upsert({
      where: { supplierId },
      create: {
        supplierId,
        automationEnabled: body.automationEnabled ?? false,
        loginUrl: body.loginUrl || null,
        bookingMethod: body.bookingMethod || 'MANUAL',
        selectorsJson,
        bookingUrlPattern: body.bookingUrlPattern || null,
        requiresAdminApproval: body.requiresAdminApproval ?? true,
        captchaDetectionRule: body.captchaDetectionRule || null,
        otpDetectionRule: body.otpDetectionRule || null,
        status: body.status || 'DRAFT',
      },
      update: {
        automationEnabled: body.automationEnabled,
        loginUrl: body.loginUrl,
        bookingMethod: body.bookingMethod,
        selectorsJson,
        bookingUrlPattern: body.bookingUrlPattern,
        requiresAdminApproval: body.requiresAdminApproval,
        captchaDetectionRule: body.captchaDetectionRule,
        otpDetectionRule: body.otpDetectionRule,
        status: body.status,
      },
    });

    await auditLog({
      action: 'SETTING_CHANGE',
      userId: 'ADMIN',
      targetType: 'supplier_automation_config',
      targetId: config.id,
      details: { supplierId, automationEnabled: config.automationEnabled },
    });

    return NextResponse.json({ success: true, data: config });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
