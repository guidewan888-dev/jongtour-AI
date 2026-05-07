import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

// ─── Rate Limiting (in-memory for edge) ────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 100; // requests per window
const RATE_WINDOW = 60_000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT;
}

// ─── Security Headers ──────────────────────────────────
function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  return response;
}

// ─── Protected Paths ───────────────────────────────────
const ADMIN_PATHS = [
  '/dashboard', '/bookings', '/customers', '/payments', '/operations',
  '/affiliate-admin', '/talent-admin', '/visa-admin', '/visa-center', '/document-center',
  '/feature-flags', '/recruitment', '/settings', '/admin',
  '/wholesale', '/sales', '/communications', '/invoices', '/manual-booking',
  '/agents', '/ai-center', '/cms', '/reports', '/marketing', '/system-health',
  '/tour-management', '/users', '/roles', '/permissions', '/audit-logs',
  '/email-templates', '/integrations', '/vouchers', '/receipts', '/inbox',
  '/guide-applications', '/tour-leader-applications', '/appointments',
];
const ACCOUNT_PATHS = ['/account'];
const TALENT_PORTAL_PATHS = ['/talent-portal'];
const AFFILIATE_PORTAL_PATHS = ['/affiliate'];

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: { headers: req.headers },
  });

  const url = req.nextUrl;
  const hostname = req.headers.get('host') || 'jongtour.com';
  let currentHost = hostname.split(':')[0];
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || '127.0.0.1';

  // ─── Rate Limiting ────────────────────────────────
  if (!checkRateLimit(ip)) {
    return new NextResponse('Too Many Requests', { status: 429, headers: { 'Retry-After': '60' } });
  }

  // ─── Security Headers ─────────────────────────────
  response = addSecurityHeaders(response);

  // Local dev, Vercel preview, and bare domain → treat as main tour portal
  if (currentHost.includes('vercel.app') || currentHost === 'localhost' || currentHost === '127.0.0.1' || currentHost === 'jongtour.com' || currentHost === 'www.jongtour.com') {
    currentHost = 'tour.jongtour.com'; 
  }

  // ─── SUPABASE AUTH GUARD ──────────────────────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  let session: { user?: { user_metadata?: Record<string, string> } } | null = null;

  if (supabaseUrl && supabaseKey && supabaseKey.startsWith('ey')) {
    try {
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          get(name: string) { return req.cookies.get(name)?.value; },
          set(name: string, value: string, options: CookieOptions) {
            req.cookies.set({ name, value, ...options });
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            req.cookies.set({ name, value: '', ...options });
            response.cookies.set({ name, value: '', ...options });
          },
        },
      });
      const { data } = await supabase.auth.getSession();
      session = data?.session as typeof session;
    } catch (_e) {
      // Continue without auth
    }
  }

  const role = session?.user?.user_metadata?.role || '';
  const isAuthenticated = !!session;

  // ===================================================================
  // ROUTING ARCHITECTURE
  // ===================================================================

  // 1. Admin Portal
  if (currentHost.startsWith('admin.')) {
    if (!isAuthenticated && !url.pathname.startsWith('/login') && !url.pathname.startsWith('/forgot-password')) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (isAuthenticated && !url.pathname.startsWith('/login')) {
      if (role !== 'ADMIN' && role !== 'SUPER_ADMIN' && !url.pathname.startsWith('/403')) {
        return NextResponse.redirect(new URL('/403', req.url));
      }
    }
    return addSecurityHeaders(response);
  }
  
  // 2. Agent Portal
  if (currentHost.startsWith('agent.')) {
    if (!isAuthenticated && !url.pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (isAuthenticated) {
      const allowed = ['AGENT', 'AGENT_ADMIN', 'ADMIN', 'SUPER_ADMIN'];
      if (!allowed.includes(role) && !url.pathname.startsWith('/403')) {
        return NextResponse.redirect(new URL('/403', req.url));
      }
    }
    url.pathname = `/agent-portal${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // 3. Sale CRM
  if (currentHost.startsWith('sale.')) {
    if (!isAuthenticated && !url.pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (isAuthenticated) {
      const allowed = ['SALE_MANAGER', 'SALE_STAFF', 'ADMIN', 'SUPER_ADMIN'];
      if (!allowed.includes(role) && !url.pathname.startsWith('/403')) {
        return NextResponse.redirect(new URL('/403', req.url));
      }
    }
    url.pathname = `/sales${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // 4. Booking Portal
  if (currentHost.startsWith('booking.')) {
    url.pathname = `/book${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // 5. Info Portal
  if (currentHost.startsWith('info.')) {
    return addSecurityHeaders(response);
  }

  // ─── Path-based Auth Guards (main domain) ─────────
  // Admin paths require admin role (exclude admin-login to prevent redirect loop)
  if (ADMIN_PATHS.some(p => url.pathname.startsWith(p)) && !url.pathname.startsWith('/admin-login')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL(`/admin-login?redirect=${encodeURIComponent(url.pathname)}`, req.url));
    }
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/403', req.url));
    }
  }

  // Account paths require login
  if (ACCOUNT_PATHS.some(p => url.pathname.startsWith(p))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(url.pathname)}`, req.url));
    }
  }

  // Talent portal requires talent role
  if (TALENT_PORTAL_PATHS.some(p => url.pathname.startsWith(p))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(url.pathname)}`, req.url));
    }
    const allowed = ['TALENT', 'ADMIN', 'SUPER_ADMIN'];
    if (!allowed.includes(role) && !url.pathname.startsWith('/403')) {
      return NextResponse.redirect(new URL('/403', req.url));
    }
  }

  // Affiliate portal requires affiliate role
  if (AFFILIATE_PORTAL_PATHS.some(p => url.pathname.startsWith(`/${p}`))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(url.pathname)}`, req.url));
    }
  }

  // 6. Main domain auth routes → rewrite to /pub-auth/*
  const authPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];
  if (authPaths.some(p => url.pathname === p || url.pathname.startsWith(p + '/')) && !url.pathname.startsWith('/admin-login')) {
    url.pathname = `/pub-auth${url.pathname}`;
    return NextResponse.rewrite(url);
  }
  // ─── Legacy Route Redirects (/region/* → /tours/*, /country/* → /tours/*/*)
  const COUNTRY_TO_CONTINENT: Record<string, string> = {
    japan:'asia',china:'asia','south-korea':'asia',taiwan:'asia',vietnam:'asia',
    hongkong:'asia',singapore:'asia',malaysia:'asia',india:'asia',cambodia:'asia',
    myanmar:'asia',laos:'asia',philippines:'asia',srilanka:'asia',macau:'asia',
    uk:'europe',france:'europe',italy:'europe',switzerland:'europe',spain:'europe',
    turkey:'europe',russia:'europe',georgia:'europe',egypt:'europe',dubai:'europe',
    usa:'americas',canada:'americas',australia:'oceania',newzealand:'oceania',
  };
  const REGION_MAP: Record<string, string> = { asia:'asia', europe:'europe', americas:'americas', oceania:'oceania', africa:'europe' };

  if (url.pathname.startsWith('/region/')) {
    const regionSlug = url.pathname.split('/')[2];
    const mapped = REGION_MAP[regionSlug] || regionSlug;
    return NextResponse.redirect(new URL(`/tours/${mapped}`, req.url), 301);
  }
  if (url.pathname.startsWith('/country/')) {
    const countrySlug = url.pathname.split('/')[2];
    const continent = COUNTRY_TO_CONTINENT[countrySlug] || 'asia';
    return NextResponse.redirect(new URL(`/tours/${continent}/${countrySlug}`, req.url), 301);
  }
  // Legacy /wholesale/<partner-code> → /wholesaler/<partner-code> redirect
  // Only redirect public partner pages, NOT admin sub-paths
  const ADMIN_WHOLESALE_PATHS = ['dashboard', 'suppliers', 'sync', 'sync-logs', 'diagnostics', 'error-logs', 'human-review', 'credentials'];
  if (url.pathname.startsWith('/wholesale/')) {
    const slug = url.pathname.split('/')[2];
    if (slug && !ADMIN_WHOLESALE_PATHS.includes(slug)) {
      return NextResponse.redirect(new URL(`/wholesaler/${slug}`, req.url), 301);
    }
  }

  // 7. Default — tour portal
  return addSecurityHeaders(response);
}
