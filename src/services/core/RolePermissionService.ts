/**
 * RolePermissionService
 * Enforces RBAC (Role-based Access Control) across all subdomains
 */
import { SupabaseClient } from '@supabase/supabase-js';

export class RolePermissionService {
  /**
   * Check if user has specific role
   */
  static async hasRole(supabase: SupabaseClient, userId: string, allowedRoles: string[]): Promise<boolean> {
    const { data, error } = await supabase
      .from('users')
      .select('role:roles(name)')
      .eq('id', userId)
      .single();
      
    if (error || !data || !data.role) return false;
    
    // @ts-ignore - type handling
    return allowedRoles.includes(data.role.name);
  }

  /**
   * Validate subdomain access based on role
   */
  static canAccessSubdomain(roleName: string, subdomain: string): boolean {
    const accessMap: Record<string, string[]> = {
      'SUPER_ADMIN': ['admin', 'b2badmin', 'sale', 'agent', 'booking', 'tour', 'info'],
      'ADMIN': ['admin', 'b2badmin', 'sale', 'agent', 'booking', 'tour', 'info'],
      'SALE': ['sale', 'booking', 'tour', 'info'],
      'AGENT': ['agent', 'booking', 'tour', 'info'],
      'CUSTOMER': ['booking', 'tour', 'info'],
      'SUPPLIER': ['b2badmin', 'info'] // Limited access
    };

    const allowed = accessMap[roleName] || accessMap['CUSTOMER'];
    return allowed.includes(subdomain);
  }
}
