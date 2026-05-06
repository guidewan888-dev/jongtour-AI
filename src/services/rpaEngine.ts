/**
 * Jongtour Wholesale RPA Engine
 * 
 * ใช้ Puppeteer สำหรับ:
 * - Login เข้าเว็บ Wholesale
 * - เปิด wholesale_tour_url
 * - กรอกข้อมูล Booking
 * - Capture screenshot
 * - อ่าน external_booking_ref
 * 
 * กฎความปลอดภัย:
 * - ห้าม AI เห็น password (decrypt เฉพาะ runtime)
 * - ห้าม log password
 * - ถ้าเจอ CAPTCHA/OTP → หยุดทันที
 * - ถ้า Bot ไม่มั่นใจ → ห้ามกดจอง
 * - ก่อน Submit → ต้องมี Admin approve
 */

import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/crypto';
import { auditLog } from '@/lib/logger';

// ============================================================
// TYPES
// ============================================================

export type RpaSessionStatus =
  | 'NOT_STARTED'
  | 'CHECKING_DATA'
  | 'LOGGING_IN'
  | 'LOGIN_FAILED'
  | 'OPENING_WHOLESALE_PAGE'
  | 'FILLING_FORM'
  | 'WAITING_ADMIN_APPROVAL'
  | 'SUBMITTED'
  | 'CONFIRMED'
  | 'WAITING_SUPPLIER_CONFIRM'
  | 'FAILED'
  | 'CAPTCHA_DETECTED'
  | 'OTP_REQUIRED'
  | 'MANUAL_FOLLOW_UP_REQUIRED';

export interface RpaFillField {
  selector: string;
  value: string;
  fieldName: string;
  type?: 'text' | 'select' | 'click' | 'date';
}

export interface RpaResult {
  success: boolean;
  status: RpaSessionStatus;
  message: string;
  screenshotUrl?: string;
  externalBookingRef?: string;
  error?: string;
}

// ============================================================
// SESSION HELPERS
// ============================================================

async function updateSession(sessionId: string, data: any) {
  return (prisma as any).wholesaleRpaSession.update({
    where: { id: sessionId },
    data: { ...data, updatedAt: new Date() },
  });
}

async function logAction(sessionId: string, bookingId: string, actionType: string, data: any) {
  return (prisma as any).wholesaleRpaAction.create({
    data: {
      sessionId,
      bookingId,
      actionType,
      actionStatus: data.status || 'SUCCESS',
      actionUrl: data.url || null,
      inputSummary: data.input || null,
      outputSummary: data.output || null,
      screenshotUrl: data.screenshotUrl || null,
      errorMessage: data.error || null,
    },
  });
}

// ============================================================
// SCREENSHOT CAPTURE & UPLOAD
// ============================================================

async function captureAndUpload(
  page: any,
  sessionId: string,
  label: string
): Promise<string | null> {
  try {
    const screenshotBuffer = await page.screenshot({ fullPage: false, type: 'png' });

    // Upload to Supabase
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)!,
    );

    const fileName = `rpa-screenshots/${sessionId}/${label}-${Date.now()}.png`;
    const { error } = await supabase.storage
      .from('jongtour-docs')
      .upload(fileName, screenshotBuffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (error) {
      console.error('[RPA Screenshot] Upload error:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('jongtour-docs')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (err) {
    console.error('[RPA Screenshot] Capture failed:', err);
    return null;
  }
}

// ============================================================
// CAPTCHA / OTP / ANOMALY DETECTION
// ============================================================

async function detectBlockers(page: any, config: any): Promise<{
  captcha: boolean;
  otp: boolean;
  anomaly: boolean;
  message: string;
}> {
  try {
    const pageContent = await page.content();
    const pageUrl = page.url();

    // CAPTCHA detection
    const captchaPatterns = [
      'captcha', 'recaptcha', 'hcaptcha', 'g-recaptcha',
      'cf-turnstile', 'cloudflare', 'challenge-form',
    ];
    const captchaCustomRule = config?.captchaDetectionRule;
    const allCaptchaPatterns = captchaCustomRule
      ? [...captchaPatterns, captchaCustomRule]
      : captchaPatterns;

    const hasCaptcha = allCaptchaPatterns.some(p =>
      pageContent.toLowerCase().includes(p.toLowerCase())
    );

    // OTP detection
    const otpPatterns = [
      'otp', 'one-time', 'verification code', 'รหัสยืนยัน',
      'verify your', 'two-factor', '2fa',
    ];
    const otpCustomRule = config?.otpDetectionRule;
    const allOtpPatterns = otpCustomRule
      ? [...otpPatterns, otpCustomRule]
      : otpPatterns;

    const hasOtp = allOtpPatterns.some(p =>
      pageContent.toLowerCase().includes(p.toLowerCase())
    );

    // Page anomaly (unexpected redirects, error pages)
    const anomalyPatterns = [
      '403 forbidden', '404 not found', '500 internal',
      'access denied', 'maintenance', 'ระบบปิดปรับปรุง',
    ];
    const hasAnomaly = anomalyPatterns.some(p =>
      pageContent.toLowerCase().includes(p.toLowerCase())
    );

    if (hasCaptcha) return { captcha: true, otp: false, anomaly: false, message: 'CAPTCHA detected on page' };
    if (hasOtp) return { captcha: false, otp: true, anomaly: false, message: 'OTP/2FA required' };
    if (hasAnomaly) return { captcha: false, otp: false, anomaly: true, message: `Page anomaly at ${pageUrl}` };

    return { captcha: false, otp: false, anomaly: false, message: 'OK' };
  } catch {
    return { captcha: false, otp: false, anomaly: false, message: 'Detection check failed' };
  }
}

// ============================================================
// CORE RPA WORKFLOW
// ============================================================

/**
 * Execute the full RPA workflow for a booking
 * Called by the bot service or internal scheduler
 */
export async function executeRpaWorkflow(sessionId: string): Promise<RpaResult> {
  let browser: any = null;
  let page: any = null;

  try {
    // 1. Load session
    const session = await (prisma as any).wholesaleRpaSession.findUniqueOrThrow({
      where: { id: sessionId },
      include: {
        booking: {
          include: {
            customer: true,
            tour: true,
            departure: true,
            travelers: true,
            supplier: { include: { automationConfig: true } },
          },
        },
        supplier: true,
      },
    });

    const { booking } = session;
    const config = booking.supplier?.automationConfig;
    const selectors = config?.selectorsJson || {};

    if (!config?.automationEnabled) {
      await updateSession(sessionId, { status: 'FAILED', errorMessage: 'Automation not enabled' });
      return { success: false, status: 'FAILED', message: 'Automation not enabled for this supplier' };
    }

    // 2. Get credentials (decrypt in backend runtime only — ห้าม log password)
    await updateSession(sessionId, { status: 'LOGGING_IN' });

    const credential = await (prisma as any).supplierCredential.findFirst({
      where: { supplierId: session.supplierId, status: 'ACTIVE' },
    });

    if (!credential) {
      await updateSession(sessionId, { status: 'LOGIN_FAILED', errorMessage: 'No active credentials' });
      return { success: false, status: 'LOGIN_FAILED', message: 'No active credentials', error: 'CREDENTIAL_NOT_FOUND' };
    }

    const username = decrypt(credential.encryptedUsername);
    const password = decrypt(credential.encryptedPassword);

    if (!username || !password) {
      await updateSession(sessionId, { status: 'LOGIN_FAILED', errorMessage: 'Credential decryption failed' });
      return { success: false, status: 'LOGIN_FAILED', message: 'Credential decryption failed' };
    }

    // 3. Launch browser
    const puppeteer = await import('puppeteer');
    browser = await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // 4. Login
    await logAction(sessionId, booking.id, 'NAVIGATE_LOGIN', { url: config.loginUrl, input: 'Opening login page' });
    await page.goto(config.loginUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    // Check for blockers before login
    const loginBlockers = await detectBlockers(page, config);
    if (loginBlockers.captcha) {
      const screenshot = await captureAndUpload(page, sessionId, 'captcha-detected');
      await updateSession(sessionId, { status: 'CAPTCHA_DETECTED', screenshotBeforeUrl: screenshot, errorMessage: loginBlockers.message });
      await logAction(sessionId, booking.id, 'CAPTCHA_DETECTED', { status: 'FAILED', screenshotUrl: screenshot, error: loginBlockers.message });
      return { success: false, status: 'CAPTCHA_DETECTED', message: loginBlockers.message, screenshotUrl: screenshot || undefined };
    }
    if (loginBlockers.otp) {
      const screenshot = await captureAndUpload(page, sessionId, 'otp-detected');
      await updateSession(sessionId, { status: 'OTP_REQUIRED', screenshotBeforeUrl: screenshot, errorMessage: loginBlockers.message });
      await logAction(sessionId, booking.id, 'OTP_DETECTED', { status: 'FAILED', screenshotUrl: screenshot, error: loginBlockers.message });
      return { success: false, status: 'OTP_REQUIRED', message: loginBlockers.message, screenshotUrl: screenshot || undefined };
    }

    // Fill login form (password never logged)
    const usernameSelector = selectors.usernameField || 'input[name="username"], input[type="email"], #username, #email';
    const passwordSelector = selectors.passwordField || 'input[name="password"], input[type="password"], #password';
    const loginSubmitSelector = selectors.submitLogin || 'button[type="submit"], input[type="submit"], .login-btn';

    await page.waitForSelector(usernameSelector, { timeout: 10000 });
    await page.type(usernameSelector, username, { delay: 50 });
    await page.type(passwordSelector, password, { delay: 50 });

    await logAction(sessionId, booking.id, 'FILL_LOGIN', { input: `Username entered: ${username.substring(0, 3)}***`, status: 'SUCCESS' });

    await page.click(loginSubmitSelector);
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});

    // Check login success
    const postLoginBlockers = await detectBlockers(page, config);
    if (postLoginBlockers.otp) {
      const screenshot = await captureAndUpload(page, sessionId, 'otp-after-login');
      await updateSession(sessionId, { status: 'OTP_REQUIRED', screenshotBeforeUrl: screenshot, errorMessage: 'OTP required after login' });
      return { success: false, status: 'OTP_REQUIRED', message: 'OTP required after login', screenshotUrl: screenshot || undefined };
    }

    // Update credential last used
    await (prisma as any).supplierCredential.update({
      where: { id: credential.id },
      data: { lastUsedAt: new Date(), failedLoginCount: 0 },
    });

    await logAction(sessionId, booking.id, 'LOGIN_SUCCESS', { status: 'SUCCESS', url: page.url() });

    // 5. Navigate to booking page
    await updateSession(sessionId, { status: 'OPENING_WHOLESALE_PAGE' });

    const bookingUrl = booking.wholesaleRef?.wholesaleBookingUrl
      || booking.tour?.bookingUrl
      || (config.bookingUrlPattern?.replace('{tourId}', booking.tour?.externalTourId || ''));

    if (bookingUrl) {
      await page.goto(bookingUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      await logAction(sessionId, booking.id, 'NAVIGATE_BOOKING', { url: bookingUrl, status: 'SUCCESS' });
    }

    // Capture "before" screenshot
    const screenshotBefore = await captureAndUpload(page, sessionId, 'before-fill');
    await updateSession(sessionId, { screenshotBeforeUrl: screenshotBefore });

    // 6. Fill booking form
    await updateSession(sessionId, { status: 'FILLING_FORM' });
    const fillActions: any[] = [];

    // Helper: try to fill a field safely
    async function safeFill(selector: string, value: string, fieldName: string) {
      try {
        const exists = await page.$(selector);
        if (!exists) {
          fillActions.push({ field: fieldName, status: 'SKIPPED', reason: 'Selector not found' });
          return;
        }
        await page.evaluate((sel: string) => {
          const el = document.querySelector(sel) as HTMLInputElement;
          if (el) el.value = '';
        }, selector);
        await page.type(selector, value, { delay: 30 });
        fillActions.push({ field: fieldName, status: 'SUCCESS', value: value.substring(0, 20) });
      } catch (err: any) {
        fillActions.push({ field: fieldName, status: 'FAILED', error: err.message });
      }
    }

    // Fill departure date
    if (selectors.departureField && booking.departure?.startDate) {
      const dateStr = new Date(booking.departure.startDate).toLocaleDateString('en-GB');
      await safeFill(selectors.departureField, dateStr, 'departure_date');
    }

    // Fill pax count
    if (selectors.paxField) {
      await safeFill(selectors.paxField, String(booking.travelers?.length || 0), 'pax_count');
    }

    // Fill traveler names
    for (let i = 0; i < (booking.travelers || []).length; i++) {
      const t = booking.travelers[i];
      const nameSelector = selectors.travelerName?.replace('{i}', String(i + 1))
        || selectors.travelerName?.replace('{i}', String(i));

      if (nameSelector) {
        const fullName = `${t.title || ''} ${t.firstName || ''} ${t.lastName || ''}`.trim();
        await safeFill(nameSelector, fullName, `traveler_name_${i + 1}`);
      }
    }

    // Fill contact info
    if (selectors.phone && booking.customer?.phone) {
      await safeFill(selectors.phone, booking.customer.phone, 'phone');
    }
    if (selectors.email && booking.customer?.email) {
      await safeFill(selectors.email, booking.customer.email, 'email');
    }

    // Log all fill actions
    for (const action of fillActions) {
      await logAction(sessionId, booking.id, 'FILL_FIELD', {
        input: `${action.field}: ${action.value || 'N/A'}`,
        status: action.status,
        error: action.error,
      });
    }

    // Check for failures
    const failedFields = fillActions.filter(a => a.status === 'FAILED');
    if (failedFields.length > 0) {
      const screenshot = await captureAndUpload(page, sessionId, 'fill-error');
      await updateSession(sessionId, {
        status: 'FAILED',
        errorMessage: `Failed to fill: ${failedFields.map(f => f.field).join(', ')}`,
        screenshotBeforeUrl: screenshot || screenshotBefore,
      });
      return {
        success: false,
        status: 'FAILED',
        message: `Failed to fill ${failedFields.length} fields`,
        screenshotUrl: screenshot || undefined,
      };
    }

    // 7. Stop and wait for admin approval
    const screenshotFilled = await captureAndUpload(page, sessionId, 'form-filled');
    await updateSession(sessionId, {
      status: 'WAITING_ADMIN_APPROVAL',
      screenshotBeforeUrl: screenshotFilled || screenshotBefore,
    });

    await logAction(sessionId, booking.id, 'FORM_FILLED', {
      status: 'SUCCESS',
      input: `${fillActions.filter(a => a.status === 'SUCCESS').length} fields filled`,
      screenshotUrl: screenshotFilled,
    });

    return {
      success: true,
      status: 'WAITING_ADMIN_APPROVAL',
      message: `Form filled successfully (${fillActions.filter(a => a.status === 'SUCCESS').length} fields). Waiting for admin approval.`,
      screenshotUrl: screenshotFilled || undefined,
    };
  } catch (err: any) {
    console.error('[RPA Engine] Error:', err.message);

    // Capture error screenshot
    let errorScreenshot: string | null = null;
    if (page) {
      errorScreenshot = await captureAndUpload(page, sessionId, 'error');
    }

    await updateSession(sessionId, {
      status: 'FAILED',
      finishedAt: new Date(),
      errorMessage: err.message,
      screenshotAfterUrl: errorScreenshot,
    });

    await auditLog({
      action: 'RPA_ERROR',
      userId: 'BOT',
      targetType: 'wholesale_rpa_session',
      targetId: sessionId,
      details: { error: err.message },
    });

    return { success: false, status: 'FAILED', message: err.message, error: err.message, screenshotUrl: errorScreenshot || undefined };
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

// ============================================================
// SUBMIT BOOKING (after admin approval)
// ============================================================

/**
 * Execute the submit action after admin approval
 * ห้าม Bot จองเองถ้าไม่มี Admin approve
 */
export async function executeRpaSubmit(sessionId: string): Promise<RpaResult> {
  let browser: any = null;
  let page: any = null;

  try {
    const session = await (prisma as any).wholesaleRpaSession.findUniqueOrThrow({
      where: { id: sessionId },
      include: {
        booking: {
          include: {
            tour: true,
            supplier: { include: { automationConfig: true } },
          },
        },
      },
    });

    // GUARD: Must be approved
    if (!session.adminApprovedBy) {
      return { success: false, status: 'FAILED', message: 'Admin approval required before submit' };
    }

    const config = session.booking.supplier?.automationConfig;
    const selectors = config?.selectorsJson || {};

    // Re-login and navigate
    const credential = await (prisma as any).supplierCredential.findFirst({
      where: { supplierId: session.supplierId, status: 'ACTIVE' },
    });
    if (!credential) {
      return { success: false, status: 'LOGIN_FAILED', message: 'No active credentials' };
    }

    const username = decrypt(credential.encryptedUsername);
    const password = decrypt(credential.encryptedPassword);
    if (!username || !password) {
      return { success: false, status: 'LOGIN_FAILED', message: 'Decryption failed' };
    }

    const puppeteer = await import('puppeteer');
    browser = await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    // Login
    if (config?.loginUrl) {
      await page.goto(config.loginUrl, { waitUntil: 'networkidle2', timeout: 30000 });

      const usernameSelector = selectors.usernameField || 'input[name="username"], input[type="email"]';
      const passwordSelector = selectors.passwordField || 'input[name="password"], input[type="password"]';
      const loginSubmitSelector = selectors.submitLogin || 'button[type="submit"]';

      await page.waitForSelector(usernameSelector, { timeout: 10000 });
      await page.type(usernameSelector, username, { delay: 50 });
      await page.type(passwordSelector, password, { delay: 50 });
      await page.click(loginSubmitSelector);
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
    }

    // Navigate to booking page
    const bookingUrl = session.booking.wholesaleRef?.wholesaleBookingUrl
      || session.booking.tour?.bookingUrl
      || config?.bookingUrlPattern?.replace('{tourId}', session.booking.tour?.externalTourId || '');

    if (bookingUrl) {
      await page.goto(bookingUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    }

    // Screenshot before submit
    const beforeSubmit = await captureAndUpload(page, sessionId, 'before-submit');

    // Click submit button
    const submitSelector = selectors.submitBooking || 'button[type="submit"], .submit-booking, .btn-confirm';

    const submitButton = await page.$(submitSelector);
    if (!submitButton) {
      await updateSession(sessionId, { status: 'FAILED', errorMessage: 'Submit button not found' });
      return { success: false, status: 'FAILED', message: 'Submit button not found on page' };
    }

    await submitButton.click();
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});

    // Screenshot after submit
    const afterSubmit = await captureAndUpload(page, sessionId, 'after-submit');

    // Try to read external booking ref
    let externalRef: string | null = null;
    if (selectors.confirmationRef) {
      try {
        externalRef = await page.$eval(selectors.confirmationRef, (el: HTMLElement) => el.textContent?.trim() || null);
      } catch {
        // Try reading from page text
        const bodyText = await page.$eval('body', (el: HTMLElement) => el.textContent || '');
        const refMatch = bodyText.match(/(?:booking|ref|confirmation|เลขที่จอง)[:\s]*([A-Z0-9-]+)/i);
        if (refMatch) externalRef = refMatch[1];
      }
    }

    // Update session
    await updateSession(sessionId, {
      status: externalRef ? 'CONFIRMED' : 'WAITING_SUPPLIER_CONFIRM',
      finishedAt: new Date(),
      screenshotAfterUrl: afterSubmit,
    });

    // Save external ref if found
    if (externalRef) {
      await (prisma as any).bookingWholesaleRef.upsert({
        where: { bookingId: session.bookingId },
        create: {
          bookingId: session.bookingId,
          supplierId: session.supplierId,
          externalBookingRef: externalRef,
          supplierConfirmedAt: new Date(),
          createdBy: 'BOT',
        },
        update: {
          externalBookingRef: externalRef,
          supplierConfirmedAt: new Date(),
        },
      });

      await prisma.booking.update({
        where: { id: session.bookingId },
        data: { wholesaleStatus: 'CONFIRMED' },
      });
    } else {
      await prisma.booking.update({
        where: { id: session.bookingId },
        data: { wholesaleStatus: 'WAITING_CONFIRM' },
      });
    }

    await logAction(sessionId, session.bookingId, 'SUBMIT_SUCCESS', {
      status: 'SUCCESS',
      output: externalRef ? `Ref: ${externalRef}` : 'Submitted — waiting confirmation',
      screenshotUrl: afterSubmit,
    });

    await auditLog({
      action: 'RPA_SUBMIT_BOOKING',
      userId: session.adminApprovedBy || 'BOT',
      targetType: 'wholesale_rpa_session',
      targetId: sessionId,
      details: { externalRef, bookingId: session.bookingId },
    });

    return {
      success: true,
      status: externalRef ? 'CONFIRMED' : 'WAITING_SUPPLIER_CONFIRM',
      message: externalRef ? `Booking confirmed: ${externalRef}` : 'Submitted — waiting for supplier confirmation',
      screenshotUrl: afterSubmit || undefined,
      externalBookingRef: externalRef || undefined,
    };
  } catch (err: any) {
    let errorScreenshot: string | null = null;
    if (page) errorScreenshot = await captureAndUpload(page, sessionId, 'submit-error');

    await updateSession(sessionId, {
      status: 'FAILED',
      finishedAt: new Date(),
      errorMessage: err.message,
      screenshotAfterUrl: errorScreenshot,
    });

    return { success: false, status: 'FAILED', message: err.message, screenshotUrl: errorScreenshot || undefined };
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

// ============================================================
// MANUAL COPY HELPER
// ============================================================

/**
 * Generate copy-friendly booking summary for manual follow-up
 */
export function generateCopyHelper(booking: any): string {
  const lines = [
    `=== Jongtour Booking Summary ===`,
    `Booking Ref: ${booking.bookingRef}`,
    `Tour: ${booking.tour?.tourName || '-'}`,
    `Tour Code: ${booking.tour?.tourCode || '-'}`,
    `Departure: ${booking.departure?.startDate ? new Date(booking.departure.startDate).toLocaleDateString('th-TH') : '-'}`,
    `Return: ${booking.departure?.endDate ? new Date(booking.departure.endDate).toLocaleDateString('th-TH') : '-'}`,
    ``,
    `=== Customer ===`,
    `Name: ${booking.customer?.firstName || ''} ${booking.customer?.lastName || ''}`,
    `Email: ${booking.customer?.email || '-'}`,
    `Phone: ${booking.customer?.phone || '-'}`,
    ``,
    `=== Travelers (${booking.travelers?.length || 0}) ===`,
  ];

  for (const [i, t] of (booking.travelers || []).entries()) {
    lines.push(`${i + 1}. ${t.title || ''} ${t.firstName || ''} ${t.lastName || ''} | Passport: ${t.passportNo || '-'} | DOB: ${t.dateOfBirth ? new Date(t.dateOfBirth).toLocaleDateString('en-GB') : '-'}`);
  }

  lines.push('', `Total Price: ฿${(booking.totalPrice || 0).toLocaleString()}`);
  return lines.join('\n');
}
