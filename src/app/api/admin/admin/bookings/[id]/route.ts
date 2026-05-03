import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return NextResponse.json({ status: 'success', message: 'API Stub: admin/bookings/[id] [GET]' });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  return NextResponse.json({ status: 'success', message: 'API Stub: admin/bookings/[id] [POST]' });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return NextResponse.json({ status: 'success', message: 'API Stub: admin/bookings/[id] [PATCH]' });
}
