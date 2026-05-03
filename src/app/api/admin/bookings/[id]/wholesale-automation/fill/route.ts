import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string, credential_id?: string } }) {
  return NextResponse.json({ status: 'success', message: 'RPA API Stub: admin/bookings/[id]/wholesale-automation/fill [GET]' });
}

export async function POST(req: NextRequest, { params }: { params: { id: string, credential_id?: string } }) {
  return NextResponse.json({ status: 'success', message: 'RPA API Stub: admin/bookings/[id]/wholesale-automation/fill [POST]' });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string, credential_id?: string } }) {
  return NextResponse.json({ status: 'success', message: 'RPA API Stub: admin/bookings/[id]/wholesale-automation/fill [PATCH]' });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string, credential_id?: string } }) {
  return NextResponse.json({ status: 'success', message: 'RPA API Stub: admin/bookings/[id]/wholesale-automation/fill [DELETE]' });
}
