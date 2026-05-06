// src/lib/services/placeholderService.ts

/**
 * Placeholder Service Layer
 * 
 * Used during Phase 7 API Binding Audit to replace hardcoded Mock Data.
 * This ensures that if an API is not yet ready, the UI safely falls back 
 * to an empty state instead of presenting fake data to the end user.
 */

export async function getPlaceholderData(tableName: string) {
  // In the future, this will be wired to Supabase:
  // const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)!);
  // const { data } = await supabase.from(tableName).select('*');
  
  console.warn(`[API Audit] Missing backend for ${tableName}. Returning empty placeholder array to prevent Mock Data hallucination.`);
  
  // Return empty array to trigger standard UI Empty States
  return [];
}

export async function getPlaceholderDashboardData() {
  console.warn(`[API Audit] Missing backend for Dashboard metrics. Returning zeros.`);
  return {
    metrics: {
      supplierCount: 0,
      apiStatus: 'PENDING',
      lastSync: '-',
      syncErrors: 0,
      missingLinks: 0,
      needReview: 0,
      totalSyncedTours: 0
    },
    suppliers: []
  };
}
