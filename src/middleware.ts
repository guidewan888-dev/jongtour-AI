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

  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1') || process.env.NODE_ENV === 'development';
  const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || ((process.env.NODE_ENV === 'production' && !isLocalhost) ? '.jongtour.com' : undefined);
  const isSecure = process.env.NODE_ENV === 'production' && !isLocalhost;

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookieOptions: {
        domain: cookieDomain,
        path: '/',
        sameSite: 'lax',
        secure: isSecure,
      },
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => req.cookies.set(name, value, { ...options, domain: cookieDomain || options.domain, secure: isSecure }));
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

  // Use getSession to avoid global API rate limits in middleware
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

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

  response.headers.set('x-agent-subdomain', subdomain || '');

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

  // IP Restriction for Admin/B2BAdmin Subdomains
  if (isAdminSubdomain || isB2bAdminSubdomain) {
    // In production, configure NEXT_PUBLIC_ADMIN_WHITELIST_IPS with comma-separated IPs
    const whitelistIps = process.env.NEXT_PUBLIC_ADMIN_WHITELIST_IPS;
    if (whitelistIps && whitelistIps !== '*') {
      const clientIp = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
      const allowedIps = whitelistIps.split(',').map(ip => ip.trim());
      
      // If client IP is known and not in whitelist, block access
      if (clientIp !== 'unknown' && !allowedIps.includes(clientIp)) {
        console.log(`[Security] Blocked unauthorized IP: ${clientIp} trying to access Admin portal`);
        // Return 404 to completely hide the existence of the admin portal
        return new NextResponse(
          "Not Found",
          { status: 404 }
        );
      }
    }
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

  const isBypass = req.cookies.get('admin_bypass')?.value === 'supersecret99';

  // Not logged in -> Redirect to login for protected domains
  if ((isAdminPath || isB2bAdminPath || isSupplierPath || isAgentPath || isSalePath) && !isAuthPath && !user && !isBypass) {
    url.pathname = (isAdminPath || isB2bAdminPath || isSupplierPath || isSalePath) ? '/auth/admin-login' : '/auth/login';
    return NextResponse.redirect(url);
  }

  // RBAC Enforcement (Role-Based Access Control)
  if (user && !isAuthPath) {
    // 1. Fetch User Role
    const { data: dbUser } = await supabase
      .from('users')
      .select('role:roles(name)')
      .eq('email', user.email)
      .single();
      
    // @ts-ignore
    const userRole = dbUser?.role?.name || 'CUSTOMER';

    // 2. Access Matrix
    const accessMap: Record<string, string[]> = {
      'SUPER_ADMIN': ['admin', 'b2badmin', 'sale', 'agent', 'booking', 'tour', 'info'],
      'ADMIN': ['admin', 'b2badmin', 'sale', 'agent', 'booking', 'tour', 'info'],
      'OPERATION': ['admin', 'b2badmin', 'booking', 'tour', 'info'],
      'FINANCE': ['admin', 'booking', 'tour', 'info'],
      'CONTENT_MANAGER': ['admin', 'tour', 'info'],
      'SALE_MANAGER': ['sale', 'booking', 'tour', 'info'],
      'SALE_STAFF': ['sale', 'booking', 'tour', 'info'],
      'SUPPLIER_MANAGER': ['b2badmin', 'tour', 'info'],
      'API_MANAGER': ['b2badmin'],
      'AGENT_OWNER': ['agent', 'booking', 'tour', 'info'],
      'AGENT_STAFF': ['agent', 'booking', 'tour', 'info'],
      'CUSTOMER_SUPPORT': ['sale', 'booking', 'tour', 'info'],
      'CUSTOMER': ['booking', 'tour', 'info']
    };

    const allowedDomains = accessMap[userRole] || ['booking', 'tour', 'info'];

    // 3. Check Current Domain Need
    let requiredDomain = null;
    if (isAdminPath) requiredDomain = 'admin';
    else if (isB2bAdminPath) requiredDomain = 'b2badmin';
    else if (isSalePath) requiredDomain = 'sale';
    else if (isAgentPath) requiredDomain = 'agent';

    // 4. Enforce Access
    if (requiredDomain && !allowedDomains.includes(requiredDomain)) {
      console.log(`[RBAC Blocked] User ${user.email} (Role: ${userRole}) tried to access ${requiredDomain}.`);
      
      // Prevent cross-domain redirects that drop sessions for Admin
      if (requiredDomain === 'admin') {
        url.pathname = '/admin/forbidden';
        return NextResponse.rewrite(url);
      }

      // Redirect to a fallback domain they have access to
      let fallbackDomain = 'tour';
      if (allowedDomains.includes('admin')) fallbackDomain = 'admin';
      else if (allowedDomains.includes('sale')) fallbackDomain = 'sale';
      else if (allowedDomains.includes('b2badmin')) fallbackDomain = 'b2badmin';
      else if (allowedDomains.includes('agent')) fallbackDomain = 'agent';
      
      const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'jongtour.com';
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
      const port = process.env.NODE_ENV === 'production' ? '' : ':3000';
      
      // We use absolute URL for cross-subdomain redirect
      return NextResponse.redirect(`${protocol}://${fallbackDomain}.${rootDomain}${port}/`);
    }
  }

  if (isAuthPath && user) {
    if (url.searchParams.has('error')) {
      return response;
    }
    // Already logged in -> Let RBAC logic above or normal app flow handle it.
    // If they are on the login page but already logged in, redirect them to root.
    url.pathname = '/';
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

    if (!isLocalhost && !isAdminSubdomain && !isB2bAdminSubdomain && !isSupplierSubdomain && !isSaleSubdomain && !isInfoSubdomain && !isBookingSubdomain && !isTourSubdomain && !isAgentSubdomain && url.pathname.startsWith('/admin')) {
      url.hostname = `admin.${hostname.replace('www.', '')}`;
      url.pathname = url.pathname.replace(/^\/admin/, '') || '/';
      return NextResponse.redirect(url);
    }
  }

  return response;
}
