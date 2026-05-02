import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.).*)',
  ],
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || '';

  // Extract subdomain (e.g., admin.jongtour.com -> admin)
  const isAdmin = hostname.startsWith('admin.');
  const isBooking = hostname.startsWith('booking.');

  // Rewrite for Admin Subdomain
  if (isAdmin) {
    // If the path doesn't already start with /admin, we prepend it.
    // E.g., visiting admin.jongtour.com/sync will load /admin/sync internally
    if (!url.pathname.startsWith('/admin')) {
      url.pathname = `/admin${url.pathname === '/' ? '' : url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  // Rewrite for Booking Subdomain (B2B Agent Portal)
  if (isBooking) {
    // Assuming you will create a /booking folder in the future
    if (!url.pathname.startsWith('/booking')) {
      url.pathname = `/booking${url.pathname === '/' ? '' : url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}
