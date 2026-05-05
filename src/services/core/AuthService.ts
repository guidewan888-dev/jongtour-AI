/**
 * AuthService — Authentication, session management, and audit logging
 */
import { SupabaseClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';

export class AuthService {
  /** Get current authenticated user with role */
  static async getCurrentUser(supabase: SupabaseClient) {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  }

  /** Check if a user is logged in */
  static async isAuthenticated(supabase: SupabaseClient): Promise<boolean> {
    const user = await this.getCurrentUser(supabase);
    return !!user;
  }

  /** Get user with full role and permissions from DB */
  static async getUserWithRole(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: { include: { permissions: true } },
        agent: { select: { id: true, companyName: true, tier: true } },
      },
    });
  }

  /** Check if user has specific permission */
  static async hasPermission(userId: string, action: string, resource: string): Promise<boolean> {
    const user = await this.getUserWithRole(userId);
    if (!user) return false;

    // Super admin has all permissions
    if (user.role.name === 'SUPER_ADMIN') return true;

    return user.role.permissions.some(
      p => p.action === action && p.resource === resource
    );
  }

  /** Check role-based access */
  static async requireRole(userId: string, allowedRoles: string[]): Promise<{ allowed: boolean; role: string }> {
    const user = await this.getUserWithRole(userId);
    if (!user) return { allowed: false, role: '' };
    return { allowed: allowedRoles.includes(user.role.name), role: user.role.name };
  }

  /** Sign out with audit log */
  static async signOut(supabase: SupabaseClient) {
    const user = await this.getCurrentUser(supabase);
    if (user) {
      await this.logAudit(user.id, 'LOGOUT', 'session', user.id);
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    return true;
  }

  /** Log audit trail */
  static async logAudit(userId: string | null, action: string, resource: string, resourceId: string, oldValues?: any, newValues?: any) {
    try {
      await prisma.auditLog.create({
        data: { userId, action, resource, resourceId, oldValues, newValues },
      });
    } catch (e) {
      console.error('[AuditLog] Failed:', e);
    }
  }

  /** Validate API key for server-to-server calls */
  static validateApiKey(apiKey: string | null): boolean {
    if (!apiKey) return false;
    const validKeys = (process.env.API_KEYS || '').split(',').map(k => k.trim());
    return validKeys.includes(apiKey);
  }

  /** Rate limit check by key (for API routes) */
  private static apiLimits = new Map<string, { count: number; reset: number }>();
  static checkApiRateLimit(key: string, limit = 60, windowMs = 60_000): boolean {
    const now = Date.now();
    const entry = this.apiLimits.get(key);
    if (!entry || now > entry.reset) {
      this.apiLimits.set(key, { count: 1, reset: now + windowMs });
      return true;
    }
    entry.count++;
    return entry.count <= limit;
  }

  /** Sanitize user input (XSS prevention) */
  static sanitize(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /** Validate CSRF token */
  static validateCsrf(token: string | null, sessionToken: string | null): boolean {
    if (!token || !sessionToken) return false;
    return token === sessionToken;
  }
}
