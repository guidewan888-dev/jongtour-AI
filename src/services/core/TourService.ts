/**
 * TourService
 * Manages Tour Master data, searching, and filtering
 */
import { SupabaseClient } from '@supabase/supabase-js';

export class TourService {
  /**
   * Get basic tour details (Fast load)
   */
  static async getTourSummary(supabase: SupabaseClient, tourId: string) {
    const { data, error } = await supabase
      .from('Tour')
      .select('id, code, title, days, nights, countries, thumbnail')
      .eq('id', tourId)
      .single();
      
    if (error) throw error;
    return data;
  }

  /**
   * Search tours with complex filters (Used by B2C and B2B)
   */
  static async searchTours(supabase: SupabaseClient, filters: any, isB2B: boolean = false) {
    let query = supabase.from('Tour').select('*, departures:TourDeparture(*)');

    if (filters.country) query = query.contains('countries', [filters.country]);
    if (filters.minPrice) query = query.gte('startingPrice', filters.minPrice);
    
    // If B2C, exclude hidden tours. B2B might see more.
    if (!isB2B) {
      query = query.eq('status', 'ACTIVE');
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
}
