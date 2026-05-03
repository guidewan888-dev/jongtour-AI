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

  const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || (process.env.NODE_ENV === 'production' ? '.jongtour.com' : undefined);

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookieOptions: {
        domain: cookieDomain,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      },
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => req.cookies.set(name, value, { ...options, domain: cookieDomain || options.domain }));
          response = NextResponse.next({
            request: req,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, { ...options, domain: cookieDomain || options.domain })
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
  const isB2bAdminSubdomain = subdomain === 'b2badmin';
  const isSupplierSubdomain = subdomain === 'supplier';
  const isAgentSubdomain = subdomain === 'agent' || subdomain === 'b2b';
  const isBookingSubdomain = subdomain === 'booking';
  const isTourSubdomain = subdomain === 'tour';
  const isInfoSubdomain = subdomain === 'info';
  const isSaleSubdomain = subdomain === 'sale';
  
  // Check path rules
  const isAdminPath = url.pathname.startsWith('/admin') || isAdminSubdomain;
  const isB2bAdminPath = url.pathname.startsWith('/b2badmin') || isB2bAdminSubdomain;
  const isSupplierPath = url.pathname.startsWith('/supplier') || isSupplierSubdomain;
  const isAgentPath = url.pathname.startsWith('/b2b') || url.pathname.startsWith('/agent') || isAgentSubdomain;
  const isBookingPath = url.pathname.startsWith('/booking') || isBookingSubdomain;
  const isTourCmsPath = url.pathname.startsWith('/tour') || isTourSubdomain;
  const isInfoPath = url.pathname.startsWith('/info') || isInfoSubdomain;
  const isSalePath = url.pathname.startsWith('/sale') || isSaleSubdomain;
  
  const isAuthPath = url.pathname.startsWith('/auth') || url.pathname.startsWith('/login') || url.pathname.startsWith('/admin-login');

  // Paths that should not be rewritten or blocked
  const excludePaths = ['/api', '/_next', '/favicon.ico', '/images'];
  const shouldExclude = excludePaths.some(p => url.pathname.startsWith(p));

  if (shouldExclude) {
    return response;
  }

  // Authentication Guards
  if ((isAdminSubdomain || isAgentSubdomain || isB2bAdminSubdomain || isSupplierSubdomain || isSaleSubdomain) && (url.pathname === '/login' || url.pathname === '/auth/login')) {
    if ((isAdminSubdomain || isB2bAdminSubdomain || isSupplierSubdomain || isSaleSubdomain) && url.pathname !== '/auth/admin-login') {
      url.pathname = '/auth/admin-login';
      return NextResponse.redirect(url);
    } else if (isAgentSubdomain && url.pathname !== '/auth/login') {
      url.pathname = '/auth/login';
      return NextResponse.redirect(url);
    }
  }

  // Info, Tour, Booking are mostly public, but Agent, Sale, Admin, Supplier require auth for their base paths
  if ((isAdminPath || isB2bAdminPath || isSupplierPath || isAgentPath || isSalePath) && !isAuthPath && !user) {
    // Not logged in -> Redirect to login
    url.pathname = (isAdminPath || isB2bAdminPath || isSupplierPath || isSalePath) ? '/auth/admin-login' : '/auth/login';
    return NextResponse.redirect(url);
  }

  if (isAuthPath && user) {
    // If they have an error parameter (e.g. unauthorized), let them stay on the login page to see it
    if (url.searchParams.has('error')) {
      return response;
    }

    // Already logged in -> Redirect to B2B or Admin based on subdomain
    if (isAdminSubdomain) {
      url.pathname = '/';
    } else {
      url.pathname = '/b2b';
    }
    return NextResponse.redirect(url);
  }

  // Subdomain Rewrites
  // Only rewrite if it's not an auth path
  if (!isAuthPath) {
    if (isAdminSubdomain && !url.pathname.startsWith('/admin')) {
      url.pathname = `/admin${url.pathname === '/' ? '' : url.pathname}`;
      return NextResponse.rewrite(url);
    }

    if (isB2bAdminSubdomain && !url.pathname.startsWith('/b2badmin')) {
      url.pathname = `/b2badmin${url.pathname === '/' ? '' : url.pathname}`;
      return NextResponse.rewrite(url);
    }

    if (isSupplierSubdomain && !url.pathname.startsWith('/supplier')) {
      url.pathname = `/supplier${url.pathname === '/' ? '' : url.pathname}`;
      return NextResponse.rewrite(url);
    }

    if (isSaleSubdomain && !url.pathname.startsWith('/sale')) {
      url.pathname = `/sale${url.pathname === '/' ? '' : url.pathname}`;
      return NextResponse.rewrite(url);
    }

    if (isInfoSubdomain && !url.pathname.startsWith('/info')) {
      url.pathname = `/info${url.pathname === '/' ? '' : url.pathname}`;
      return NextResponse.rewrite(url);
    }

    if (isTourSubdomain && !url.pathname.startsWith('/tour')) {
      url.pathname = `/tour${url.pathname === '/' ? '' : url.pathname}`;
      return NextResponse.rewrite(url);
    }

    if (isBookingSubdomain && !url.pathname.startsWith('/booking')) {
      url.pathname = `/booking${url.pathname === '/' ? '' : url.pathname}`;
      return NextResponse.rewrite(url);
    }

    if (isAgentSubdomain && !url.pathname.startsWith('/b2b')) {
      url.pathname = `/b2b${url.pathname === '/' ? '' : url.pathname}`;
      return NextResponse.rewrite(url);
    }

    if (!isAdminSubdomain && !isB2bAdminSubdomain && !isSupplierSubdomain && !isSaleSubdomain && !isInfoSubdomain && !isBookingSubdomain && !isTourSubdomain && !isAgentSubdomain && url.pathname.startsWith('/admin')) {
      url.hostname = `admin.${hostname.replace('www.', '')}`;
      url.pathname = url.pathname.replace(/^\/admin/, '') || '/';
      return NextResponse.redirect(url);
    }
  }

  return response;
}
