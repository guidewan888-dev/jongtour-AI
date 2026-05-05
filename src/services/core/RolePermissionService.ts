/**
 * RolePermissionService — RBAC enforcement across all subdomains
 */
import { prisma } from '@/lib/prisma';

// ─── Role Hierarchy ────────────────────────────────────
const ROLE_HIERARCHY: Record<string, number> = {
  SUPER_ADMIN: 100,
  ADMIN: 90,
  SALE_MANAGER: 70,
  SALE_STAFF: 60,
  AGENT_ADMIN: 50,
  AGENT: 40,
  TALENT: 30,
  AFFILIATE: 25,
  CUSTOMER: 10,
  GUEST: 0,
};

// ─── Subdomain Access Map ──────────────────────────────
const SUBDOMAIN_ACCESS: Record<string, string[]> = {
  SUPER_ADMIN: ['admin', 'b2badmin', 'sale', 'agent', 'booking', 'tour', 'info', 'talent-admin', 'affiliate-admin'],
  ADMIN: ['admin', 'b2badmin', 'sale', 'agent', 'booking', 'tour', 'info', 'talent-admin', 'affiliate-admin'],
  SALE_MANAGER: ['sale', 'booking', 'tour', 'info'],
  SALE_STAFF: ['sale', 'booking', 'tour', 'info'],
  AGENT_ADMIN: ['agent', 'booking', 'tour', 'info'],
  AGENT: ['agent', 'booking', 'tour', 'info'],
  TALENT: ['talent-portal', 'tour', 'info'],
  AFFILIATE: ['affiliate', 'tour', 'info'],
  CUSTOMER: ['booking', 'tour', 'info', 'account'],
  GUEST: ['tour', 'info'],
};

// ─── Resource Permissions ──────────────────────────────
const DEFAULT_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: ['*:*'],
  ADMIN: ['*:*'],
  SALE_MANAGER: ['read:bookings', 'create:bookings', 'update:bookings', 'read:customers', 'create:leads', 'update:leads', 'read:tours', 'read:payments'],
  SALE_STAFF: ['read:bookings', 'create:bookings', 'read:customers', 'create:leads', 'read:tours'],
  AGENT_ADMIN: ['read:bookings', 'create:bookings', 'read:tours', 'read:quotations', 'create:quotations'],
  AGENT: ['read:bookings', 'create:bookings', 'read:tours', 'read:quotations'],
  TALENT: ['read:talent_requests', 'update:talent_schedule', 'read:talent_reviews'],
  AFFILIATE: ['read:affiliate_dashboard', 'read:affiliate_commissions', 'read:affiliate_clicks'],
  CUSTOMER: ['read:bookings', 'create:bookings', 'read:tours', 'create:talent_requests', 'read:notifications'],
};

export class RolePermissionService {

  /** Check if user has specific role */
  static async hasRole(userId: string, allowedRoles: string[]): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: { select: { name: true } } },
    });
    if (!user) return false;
    return allowedRoles.includes(user.role.name);
  }

  /** Check role hierarchy (can the actor manage the target?) */
  static canManage(actorRole: string, targetRole: string): boolean {
    return (ROLE_HIERARCHY[actorRole] || 0) > (ROLE_HIERARCHY[targetRole] || 0);
  }

  /** Validate subdomain access */
  static canAccessSubdomain(roleName: string, subdomain: string): boolean {
    const allowed = SUBDOMAIN_ACCESS[roleName] || SUBDOMAIN_ACCESS['GUEST'];
    return allowed.includes(subdomain);
  }

  /** Check resource permission */
  static hasPermission(roleName: string, action: string, resource: string): boolean {
    const perms = DEFAULT_PERMISSIONS[roleName] || [];
    return perms.includes('*:*') || perms.includes(`${action}:${resource}`);
  }

  /** Get all permissions for a role */
  static getPermissions(roleName: string): string[] {
    return DEFAULT_PERMISSIONS[roleName] || [];
  }

  /** Admin guard — returns 403 response data if not authorized */
  static async adminGuard(userId: string): Promise<{ authorized: boolean; role?: string; error?: string }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: { select: { name: true } } },
    });
    if (!user) return { authorized: false, error: 'User not found' };
    const adminRoles = ['ADMIN', 'SUPER_ADMIN'];
    if (!adminRoles.includes(user.role.name)) {
      return { authorized: false, role: user.role.name, error: 'Insufficient permissions' };
    }
    return { authorized: true, role: user.role.name };
  }

  /** API route guard helper */
  static async apiGuard(userId: string | null, requiredPermission: { action: string; resource: string }): Promise<{ authorized: boolean; error?: string }> {
    if (!userId) return { authorized: false, error: 'Not authenticated' };
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: { select: { name: true } } },
    });
    if (!user) return { authorized: false, error: 'User not found' };
    if (!this.hasPermission(user.role.name, requiredPermission.action, requiredPermission.resource)) {
      return { authorized: false, error: `Missing permission: ${requiredPermission.action}:${requiredPermission.resource}` };
    }
    return { authorized: true };
  }

  /** Data access filter — restrict queries by role */
  static getDataFilter(roleName: string, userId: string): Record<string, any> {
    switch (roleName) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
        return {}; // No filter — see everything
      case 'AGENT':
      case 'AGENT_ADMIN':
        return { agentId: userId }; // Only own agent data
      case 'CUSTOMER':
        return { customerId: userId }; // Only own data
      case 'TALENT':
        return { talentId: userId }; // Only own talent data
      default:
        return { id: 'NONE' }; // Block all
    }
  }
}
