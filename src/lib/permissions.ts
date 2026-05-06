import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// ============================================================
// TYPES
// ============================================================

export type AppRole = 
  | 'SUPER_ADMIN' 
  | 'ADMIN' 
  | 'SALE_MANAGER' 
  | 'SALE_STAFF' 
  | 'OPERATION' 
  | 'FINANCE' 
  | 'CONTENT_MANAGER' 
  | 'AGENT'
  | 'CUSTOMER';

export type AuthUser = {
  id: string;
  email: string;
  role: AppRole;
  name?: string;
};

export type AuthResult = 
  | { authenticated: true; user: AuthUser }
  | { authenticated: false; error: string; status: number };

// ============================================================
// ROLE HIERARCHY — higher number = more access
// ============================================================

const ROLE_LEVEL: Record<AppRole, number> = {
  CUSTOMER: 0,
  AGENT: 1,
  SALE_STAFF: 2,
  OPERATION: 3,
  FINANCE: 3,
  CONTENT_MANAGER: 3,
  SALE_MANAGER: 4,
  ADMIN: 5,
  SUPER_ADMIN: 6,
};

// ============================================================
// ROUTE PERMISSION MAP
// ============================================================

const ROUTE_PERMISSIONS: Record<string, AppRole[]> = {
  // Admin core
  '/api/admin/': ['ADMIN', 'SUPER_ADMIN'],
  '/api/admin/sync': ['ADMIN', 'SUPER_ADMIN', 'OPERATION'],
  '/api/admin/users': ['ADMIN', 'SUPER_ADMIN'],
  '/api/admin/invite': ['ADMIN', 'SUPER_ADMIN'],
  '/api/admin/ai/': ['ADMIN', 'SUPER_ADMIN', 'CONTENT_MANAGER'],
  '/api/admin/line-crm': ['ADMIN', 'SUPER_ADMIN', 'SALE_MANAGER'],
  '/api/admin/link-monitor': ['ADMIN', 'SUPER_ADMIN', 'CONTENT_MANAGER'],
  '/api/admin/generate-embeddings': ['ADMIN', 'SUPER_ADMIN'],
  '/api/admin/rpa/': ['ADMIN', 'SUPER_ADMIN'],
  
  // Wholesale & RPA Automation
  '/api/admin/suppliers/': ['ADMIN', 'SUPER_ADMIN'],
  '/api/admin/suppliers/credentials': ['SUPER_ADMIN'],  // Only SUPER_ADMIN can manage credentials
  '/api/admin/suppliers/credentials/test-login': ['SUPER_ADMIN'],
  '/api/admin/suppliers/automation-config': ['ADMIN', 'SUPER_ADMIN'],
  '/api/admin/bookings/wholesale-automation': ['ADMIN', 'SUPER_ADMIN', 'OPERATION'],
  '/api/admin/bookings/wholesale-automation/start': ['ADMIN', 'SUPER_ADMIN'],
  '/api/admin/bookings/wholesale-automation/approve': ['ADMIN', 'SUPER_ADMIN'],  // Only ADMIN+ can approve
  '/api/admin/bookings/wholesale-automation/submit': ['ADMIN', 'SUPER_ADMIN'],  // Only ADMIN+ can submit
  '/api/admin/bookings/wholesale-automation/stop': ['ADMIN', 'SUPER_ADMIN', 'OPERATION'],
  '/api/admin/bookings/wholesale-automation/manual-follow-up': ['ADMIN', 'SUPER_ADMIN', 'OPERATION'],
  '/api/admin/bookings/external-booking-ref': ['ADMIN', 'SUPER_ADMIN', 'OPERATION'],
  '/api/admin/bookings/copy-helper': ['ADMIN', 'SUPER_ADMIN', 'OPERATION', 'SALE_MANAGER'],
  '/api/admin/bookings/wholesale-automation/screenshots': ['ADMIN', 'SUPER_ADMIN', 'OPERATION'],
  
  // Reports & Finance
  '/api/reports/': ['ADMIN', 'SUPER_ADMIN', 'FINANCE', 'SALE_MANAGER'],
  
  // CMS
  '/api/cms/': ['ADMIN', 'SUPER_ADMIN', 'CONTENT_MANAGER'],
  
  // Leads & CRM
  '/api/leads/': ['ADMIN', 'SUPER_ADMIN', 'SALE_MANAGER', 'SALE_STAFF'],
};

// ============================================================
// CORE AUTH FUNCTIONS
// ============================================================

/**
 * Get the authenticated user from the current request context.
 * Uses Supabase server-side auth (cookies).
 */
export async function getAuthUser(): Promise<AuthResult> {
  try {
    const cookieStore = cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            try { cookieStore.set({ name, value, ...options }); } catch { /* read-only in some contexts */ }
          },
          remove(name: string, options: CookieOptions) {
            try { cookieStore.set({ name, value: '', ...options }); } catch { /* read-only */ }
          },
        },
      }
    );

    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return { authenticated: false, error: 'ไม่ได้เข้าสู่ระบบ', status: 401 };
    }

    const user: AuthUser = {
      id: session.user.id,
      email: session.user.email || '',
      role: (session.user.user_metadata?.role as AppRole) || 'CUSTOMER',
      name: session.user.user_metadata?.name || session.user.email,
    };

    return { authenticated: true, user };
  } catch {
    return { authenticated: false, error: 'Authentication error', status: 500 };
  }
}

/**
 * Require authentication. Returns user or 401 response.
 */
export async function requireAuth(): Promise<AuthUser | NextResponse> {
  const result = await getAuthUser();
  if (!result.authenticated) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return result.user;
}

/**
 * Require a specific role (or higher). Returns user or 403 response.
 */
export async function requireRole(...allowedRoles: AppRole[]): Promise<AuthUser | NextResponse> {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult as AuthUser;
  
  // SUPER_ADMIN always has access
  if (user.role === 'SUPER_ADMIN') return user;
  
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { error: 'ไม่มีสิทธิ์เข้าถึง' },
      { status: 403 }
    );
  }

  return user;
}

/**
 * Check if a user has at least the specified role level.
 */
export function hasMinimumRole(userRole: AppRole, minimumRole: AppRole): boolean {
  return ROLE_LEVEL[userRole] >= ROLE_LEVEL[minimumRole];
}

/**
 * Check route permission based on path pattern matching.
 */
export function checkRoutePermission(pathname: string, userRole: AppRole): boolean {
  // SUPER_ADMIN always passes
  if (userRole === 'SUPER_ADMIN') return true;

  // Check specific route permissions (most specific match first)
  const sortedRoutes = Object.keys(ROUTE_PERMISSIONS).sort((a, b) => b.length - a.length);
  
  for (const routePattern of sortedRoutes) {
    if (pathname.startsWith(routePattern)) {
      return ROUTE_PERMISSIONS[routePattern].includes(userRole);
    }
  }

  // Default: ADMIN+ for any unmatched admin route
  if (pathname.startsWith('/api/admin')) {
    return hasMinimumRole(userRole, 'ADMIN');
  }

  // Public APIs are accessible to all authenticated users
  return true;
}

// ============================================================
// HELPER: Use in API routes
// ============================================================

/**
 * Quick guard for admin-only API routes.
 * Usage:
 *   const user = await requireAdmin();
 *   if (user instanceof NextResponse) return user;
 */
export async function requireAdmin(): Promise<AuthUser | NextResponse> {
  return requireRole('ADMIN', 'SUPER_ADMIN');
}

/**
 * Quick guard for sale team API routes.
 */
export async function requireSaleTeam(): Promise<AuthUser | NextResponse> {
  return requireRole('ADMIN', 'SUPER_ADMIN', 'SALE_MANAGER', 'SALE_STAFF');
}

/**
 * Quick guard for finance team API routes.
 */
export async function requireFinance(): Promise<AuthUser | NextResponse> {
  return requireRole('ADMIN', 'SUPER_ADMIN', 'FINANCE');
}

/**
 * Quick guard for content managers.
 */
export async function requireContentManager(): Promise<AuthUser | NextResponse> {
  return requireRole('ADMIN', 'SUPER_ADMIN', 'CONTENT_MANAGER');
}

/**
 * Quick guard for super admin only (credential management).
 */
export async function requireSuperAdmin(): Promise<AuthUser | NextResponse> {
  return requireRole('SUPER_ADMIN');
}

/**
 * Quick guard for RPA/wholesale automation routes.
 * ADMIN, SUPER_ADMIN, and OPERATION can view.
 * Only ADMIN+ can approve/submit.
 */
export async function requireRpaAccess(): Promise<AuthUser | NextResponse> {
  return requireRole('ADMIN', 'SUPER_ADMIN', 'OPERATION');
}

/**
 * Quick guard for RPA approval actions (approve, submit).
 * Only ADMIN and SUPER_ADMIN can approve bookings.
 */
export async function requireRpaApproval(): Promise<AuthUser | NextResponse> {
  return requireRole('ADMIN', 'SUPER_ADMIN');
}
