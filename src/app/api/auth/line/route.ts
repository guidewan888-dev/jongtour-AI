import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  let origin = 'https://jongtour.com';
  
  const redirectUri = `${origin}/api/auth/line/callback`;
  const clientId = process.env.LINE_CLIENT_ID || '2009935240';
  const state = Math.random().toString(36).substring(7);

  if (!clientId) {
    return NextResponse.json({ error: 'LINE_CLIENT_ID is not configured' }, { status: 500 });
  }

  const lineAuthUrl = new URL('https://access.line.me/oauth2/v2.1/authorize');
  lineAuthUrl.searchParams.append('response_type', 'code');
  lineAuthUrl.searchParams.append('client_id', clientId);
  lineAuthUrl.searchParams.append('redirect_uri', redirectUri);
  lineAuthUrl.searchParams.append('state', state);
  lineAuthUrl.searchParams.append('scope', 'profile openid email');
  lineAuthUrl.searchParams.append('prompt', 'consent'); // Force consent screen to ensure email permission is requested

  return NextResponse.redirect(lineAuthUrl.toString());
}
