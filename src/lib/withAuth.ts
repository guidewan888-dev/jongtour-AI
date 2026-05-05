/**
 * withAuth — API route guard wrapper
 * Usage:
 *   export const GET = withAuth(handler, { roles: ['ADMIN'] });
 *   export const POST = withAuth(handler, { permission: { action: 'create', resource: 'bookings' } });
 */
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { RolePermissionService } from '@/services/core/RolePermissionService';
import { AuthService } from '@/services/core/AuthService';

type AuthOptions = {
  roles?: string[];
  permission?: { action: string; resource: string };
  rateLimit?: number; // per minute
};

type AuthenticatedHandler = (
  req: NextRequest,
  context: { userId: string; role: string; params?: any }
) => Promise<NextResponse>;

export function withAuth(handler: AuthenticatedHandler, options: AuthOptions = {}) {
  return async (req: NextRequest, routeContext?: any) => {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const limit = options.rateLimit || 60;
    if (!AuthService.checkApiRateLimit(`api:${ip}`, limit)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Auth check
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Auth not configured' }, { status: 500 });
    }

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        get(name: string) { return req.cookies.get(name)?.value; },
        set() {},
        remove() {},
      },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    const role = user.user_metadata?.role || 'CUSTOMER';

    // Role check
    if (options.roles && options.roles.length > 0) {
      if (!options.roles.includes(role) && role !== 'SUPER_ADMIN') {
        await AuthService.logAudit(userId, 'ACCESS_DENIED', 'api', req.nextUrl.pathname);
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Permission check
    if (options.permission) {
      if (!RolePermissionService.hasPermission(role, options.permission.action, options.permission.resource)) {
        await AuthService.logAudit(userId, 'PERMISSION_DENIED', options.permission.resource, req.nextUrl.pathname);
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
    }

    // Execute handler
    return handler(req, { userId, role, params: routeContext?.params });
  };
}

/** Simple API key auth for webhooks/cron */
export function withApiKey(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const apiKey = req.headers.get('x-api-key') || new URL(req.url).searchParams.get('api_key');
    if (!AuthService.validateApiKey(apiKey)) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }
    return handler(req);
  };
}
