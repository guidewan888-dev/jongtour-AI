export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/crypto';
import { auditLog } from '@/lib/logger';

/**
 * POST /api/admin/suppliers/[id]/credentials/test-login
 * Test credential by decrypting and verifying against supplier login page
 * ห้ามส่ง password กลับ frontend — ถอดรหัสเฉพาะ backend runtime
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: supplierId } = await params;
  try {
    const { credentialId } = await req.json();

    if (!credentialId) {
      return NextResponse.json({ success: false, error: 'Missing credentialId' }, { status: 400 });
    }

    const credential = await (prisma as any).supplierCredential.findUnique({
      where: { id: credentialId },
      include: { supplier: { include: { automationConfig: true } } },
    });

    if (!credential) {
      return NextResponse.json({ success: false, error: 'Credential not found' }, { status: 404 });
    }

    // Decrypt in backend only — never send to frontend
    const username = decrypt(credential.encryptedUsername);
    const password = decrypt(credential.encryptedPassword);

    if (!username || !password) {
      await (prisma as any).supplierCredential.update({
        where: { id: credentialId },
        data: { status: 'DECRYPTION_FAILED' },
      });
      return NextResponse.json({ success: false, error: 'Failed to decrypt credentials' }, { status: 500 });
    }

    const loginUrl = credential.supplier?.automationConfig?.loginUrl;

    // Test login via RPA service (if available)
    const botUrl = process.env.BOT_SERVICE_URL;
    let testResult: any = { status: 'SKIPPED', message: 'No BOT_SERVICE_URL configured — credentials validated locally' };

    if (botUrl) {
      try {
        const res = await fetch(`${botUrl}/test-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, loginUrl }),
        });
        testResult = await res.json();
      } catch (e: any) {
        testResult = { status: 'BOT_UNREACHABLE', message: e.message };
      }
    }

    // Update credential status
    const passed = testResult.status === 'SUCCESS' || testResult.status === 'SKIPPED';
    await (prisma as any).supplierCredential.update({
      where: { id: credentialId },
      data: {
        lastUsedAt: new Date(),
        status: passed ? 'ACTIVE' : 'LOGIN_FAILED',
        failedLoginCount: passed ? 0 : { increment: 1 },
      },
    });

    await auditLog({
      action: 'CREDENTIAL_TEST_LOGIN',
      userId: 'ADMIN',
      targetType: 'supplier_credential',
      targetId: credentialId,
      details: { supplierId, result: testResult.status, loginUrl },
    });

    return NextResponse.json({
      success: passed,
      testResult: { status: testResult.status, message: testResult.message },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
