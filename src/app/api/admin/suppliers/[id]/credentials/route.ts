import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string, credential_id?: string } }) {
  return NextResponse.json({ status: 'success', message: 'RPA API Stub: admin/suppliers/[id]/credentials [GET]' });
}

export async function POST(req: NextRequest, { params }: { params: { id: string, credential_id?: string } }) {
  return NextResponse.json({ status: 'success', message: 'RPA API Stub: admin/suppliers/[id]/credentials [POST]' });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string, credential_id?: string } }) {
  return NextResponse.json({ status: 'success', message: 'RPA API Stub: admin/suppliers/[id]/credentials [PATCH]' });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string, credential_id?: string } }) {
  return NextResponse.json({ status: 'success', message: 'RPA API Stub: admin/suppliers/[id]/credentials [DELETE]' });
}
