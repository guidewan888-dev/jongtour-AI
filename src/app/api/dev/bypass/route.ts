import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const hostname = url.hostname;
  
  // Only allow this in local development
  if (!hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
    return NextResponse.json({ error: 'Only allowed on localhost' }, { status: 403 });
  }
  
  const cookieStore = await cookies();
  cookieStore.set('admin_bypass', 'supersecret99', { path: '/' });
  
  return NextResponse.redirect(new URL('/admin', request.url));
}
