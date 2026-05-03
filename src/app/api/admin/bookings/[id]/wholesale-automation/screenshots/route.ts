import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string, credential_id?: string } }) {
  return NextResponse.json({ status: 'success', message: 'RPA API Stub: admin/bookings/[id]/wholesale-automation/screenshots [GET]' });
}

export async function POST(req: NextRequest, { params }: { params: { id: string, credential_id?: string } }) {
  return NextResponse.json({ status: 'success', message: 'RPA API Stub: admin/bookings/[id]/wholesale-automation/screenshots [POST]' });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string, credential_id?: string } }) {
  return NextResponse.json({ status: 'success', message: 'RPA API Stub: admin/bookings/[id]/wholesale-automation/screenshots [PATCH]' });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string, credential_id?: string } }) {
  return NextResponse.json({ status: 'success', message: 'RPA API Stub: admin/bookings/[id]/wholesale-automation/screenshots [DELETE]' });
}
