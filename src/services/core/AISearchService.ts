/**
 * AISearchService
 * Core wrapper for RAG Vector Search and AI Chatbot inference
 */
import { SupabaseClient } from '@supabase/supabase-js';

export class AISearchService {
  /**
   * Perform Semantic Search using pgvector
   */
  static async semanticSearch(supabase: SupabaseClient, queryText: string, embedding: number[]) {
    // Calls PostgreSQL function `match_tours`
    const { data, error } = await supabase.rpc('match_tours', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: 5
    });
    
    if (error) throw error;
    return data;
  }

  /**
   * Generate embeddings for new tour content
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    // Call OpenAI text-embedding-3-small
    return []; // mock
  }
}
