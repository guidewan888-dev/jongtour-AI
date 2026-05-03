/**
 * UserService
 * Manages user profiles across all user types (Customer, Agent, Admin, Sale)
 */
import { SupabaseClient } from '@supabase/supabase-js';

export class UserService {
  /**
   * Get full user profile including role and company (if applicable)
   */
  static async getUserProfile(supabase: SupabaseClient, userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*, role:roles(*), company:Company(*)')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    return data;
  }

  /**
   * Update user profile information
   */
  static async updateProfile(supabase: SupabaseClient, userId: string, updates: any) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
}
