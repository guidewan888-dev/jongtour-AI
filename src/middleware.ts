import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from "@supabase/ssr";

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

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || '';

  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qterfftaebnoawnzkfgu.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_SRwNSJ89mInda5FcuB1W2w_9IEJlSOI';

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          response = NextResponse.next({
            request: req,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser();

  // Extract subdomain (e.g., ktc.jongtour.com -> ktc)
  const hostParts = hostname.replace('www.', '').split(':'); // remove port if exists
  const hostNameOnly = hostParts[0];
  
  let subdomain = null;
  // Handle localhost (e.g., ktc.localhost)
  if (hostNameOnly.endsWith('localhost')) {
    const parts = hostNameOnly.split('.');
    if (parts.length > 1) subdomain = parts[0];
  } else {
    // Handle production (e.g., ktc.jongtour.com)
    // Assume jongtour.com is the root domain
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'jongtour.com';
    if (hostNameOnly.endsWith(`.${rootDomain}`)) {
      subdomain = hostNameOnly.replace(`.${rootDomain}`, '');
    }
  }

  const isAdminSubdomain = subdomain === 'admin';
  const isBookingSubdomain = subdomain === 'booking' || subdomain === 'b2b';
  const isAgentSubdomain = subdomain && !isAdminSubdomain && !isBookingSubdomain;

  // Check path rules
  const isAdminPath = url.pathname.startsWith('/admin') || isAdminSubdomain;
  const isB2bPath = url.pathname.startsWith('/b2b') || isBookingSubdomain;
  const isAuthPath = url.pathname.startsWith('/auth');

  // Paths that should not be rewritten or blocked
  const excludePaths = ['/api', '/_next', '/favicon.ico', '/images'];
  const shouldExclude = excludePaths.some(p => url.pathname.startsWith(p));

  if (shouldExclude) {
    return response;
  }

  // Authentication Guards
  if ((isAdminPath || isB2bPath) && !user) {
    // Not logged in -> Redirect to login
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  if (isAuthPath && user) {
    // Already logged in -> Redirect to B2B or Admin
    // Ideally we fetch role from Prisma here, but we can't use Prisma client in Edge Runtime easily.
    // For now, redirect to /b2b as default, and the b2b/admin layouts can do the final role check.
    url.pathname = '/b2b';
    return NextResponse.redirect(url);
  }

  // Subdomain Rewrites
  if (isAdminSubdomain && !url.pathname.startsWith('/admin')) {
    url.pathname = `/admin${url.pathname === '/' ? '' : url.pathname}`;
    return NextResponse.rewrite(url);
  }

  if (!isAdminSubdomain && !isBookingSubdomain && url.pathname.startsWith('/admin')) {
    url.hostname = `admin.${hostname.replace('www.', '')}`;
    url.pathname = url.pathname.replace(/^\/admin/, '') || '/';
    return NextResponse.redirect(url);
  }

  if (isBookingSubdomain && !url.pathname.startsWith('/b2b')) {
    url.pathname = `/b2b${url.pathname === '/' ? '' : url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Rewrite for Agent Subdomain (White-label B2B2C Portal)
  // e.g. ktc.jongtour.com/tours -> rewrites to /agent/ktc/tours
  if (isAgentSubdomain && !url.pathname.startsWith('/agent')) {
    url.pathname = `/agent/${subdomain}${url.pathname === '/' ? '' : url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return response;
}
