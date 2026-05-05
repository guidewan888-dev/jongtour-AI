export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/crypto';
import { auditLog } from '@/lib/logger';

/**
 * PATCH /api/admin/suppliers/[id]/credentials/[credential_id]
 * Update credential (re-encrypt if password changed)
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; credential_id: string }> }
) {
  const { id: supplierId, credential_id } = await params;
  try {
    const body = await req.json();
    const updateData: any = { updatedAt: new Date() };

    if (body.credentialName) updateData.credentialName = body.credentialName;
    if (body.authType) updateData.authType = body.authType;
    if (body.status) updateData.status = body.status;

    // Re-encrypt if changed
    if (body.username) updateData.encryptedUsername = encrypt(body.username);
    if (body.password) updateData.encryptedPassword = encrypt(body.password);

    // Reset failed count on password change
    if (body.password) updateData.failedLoginCount = 0;

    const credential = await (prisma as any).supplierCredential.update({
      where: { id: credential_id },
      data: updateData,
    });

    await auditLog({
      action: 'CREDENTIAL_UPDATE',
      userId: 'ADMIN',
      targetType: 'supplier_credential',
      targetId: credential_id,
      details: { supplierId, fields: Object.keys(body) },
    });

    return NextResponse.json({
      success: true,
      data: { id: credential.id, credentialName: credential.credentialName, status: credential.status },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/suppliers/[id]/credentials/[credential_id]
 * Delete credential permanently
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; credential_id: string }> }
) {
  const { id: supplierId, credential_id } = await params;
  try {
    await (prisma as any).supplierCredential.delete({ where: { id: credential_id } });

    await auditLog({
      action: 'CREDENTIAL_DELETE',
      userId: 'ADMIN',
      targetType: 'supplier_credential',
      targetId: credential_id,
      details: { supplierId },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
