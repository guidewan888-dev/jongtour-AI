export const dynamic = 'force-dynamic';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const path = new URL(request.url).searchParams.get('path') || '/';
  revalidatePath(path, 'layout');
  return NextResponse.json({ revalidated: true, now: Date.now(), path });
}

