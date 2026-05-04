/**
 * AISearchService
 * Core wrapper for RAG Vector Search and AI Chatbot inference
 */
import { SupabaseClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

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
    if (!process.env.OPENAI_API_KEY) {
      console.warn("OPENAI_API_KEY is not set, returning mock embedding for safety");
      return Array(1536).fill(0);
    }
    
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float",
    });
    
    return response.data[0].embedding;
  }
}
