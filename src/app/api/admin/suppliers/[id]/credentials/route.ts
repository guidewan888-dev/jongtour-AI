export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/crypto';
import { auditLog } from '@/lib/logger';

/**
 * GET /api/admin/suppliers/[id]/credentials
 * List credentials for a supplier — MASKED passwords
 * ห้ามแสดง password ให้ Admin
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: supplierId } = await params;
  try {
    const credentials = await (prisma as any).supplierCredential.findMany({
      where: { supplierId },
      orderBy: { createdAt: 'desc' },
    });

    // MASK sensitive data — never expose passwords
    const masked = credentials.map((c: any) => ({
      id: c.id,
      supplierId: c.supplierId,
      credentialName: c.credentialName,
      username: c.encryptedUsername ? '●●●●●●●●' : null,
      hasPassword: !!c.encryptedPassword,
      authType: c.authType,
      status: c.status,
      lastUsedAt: c.lastUsedAt,
      failedLoginCount: c.failedLoginCount,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    return NextResponse.json({ success: true, data: masked });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/suppliers/[id]/credentials
 * Create encrypted credential
 * ห้ามเก็บ plain text — encrypt ทันที
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: supplierId } = await params;
  try {
    const { credentialName, username, password, authType } = await req.json();

    if (!credentialName || !username || !password) {
      return NextResponse.json({ success: false, error: 'Missing credentialName, username, or password' }, { status: 400 });
    }

    // Verify supplier exists
    const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
    if (!supplier) {
      return NextResponse.json({ success: false, error: 'Supplier not found' }, { status: 404 });
    }

    // ENCRYPT before storing — password never stored in plain text
    const encryptedUsername = encrypt(username);
    const encryptedPassword = encrypt(password);

    const credential = await (prisma as any).supplierCredential.create({
      data: {
        supplierId,
        credentialName,
        encryptedUsername,
        encryptedPassword,
        authType: authType || 'LOGIN_FORM',
        status: 'ACTIVE',
      },
    });

    await auditLog({
      action: 'CREDENTIAL_CREATE',
      userId: 'ADMIN',
      targetType: 'supplier_credential',
      targetId: credential.id,
      details: { supplierId, credentialName, authType: authType || 'LOGIN_FORM' },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: credential.id,
        credentialName: credential.credentialName,
        status: credential.status,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
