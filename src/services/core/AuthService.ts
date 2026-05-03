/**
 * AuthService
 * Handles authentication logic, session management, and Supabase auth wrappers.
 * Shared across all subdomains.
 */
import { SupabaseClient } from '@supabase/supabase-js';

export class AuthService {
  /**
   * Get current authenticated user
   */
  static async getCurrentUser(supabase: SupabaseClient) {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  }

  /**
   * Check if a user is logged in
   */
  static async isAuthenticated(supabase: SupabaseClient): Promise<boolean> {
    const user = await this.getCurrentUser(supabase);
    return !!user;
  }

  /**
   * Sign out the user
   */
  static async signOut(supabase: SupabaseClient) {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    return true;
  }
}
