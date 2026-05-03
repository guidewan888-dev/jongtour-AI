import { NextResponse } from 'next/server';

// Simple in-memory store for rate limiting (For edge/serverless, Redis like Upstash is recommended)
// Map structure: { "ip_address": { count: number, resetAt: number } }
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

/**
 * Basic memory-based rate limiter.
 * Note: In Vercel serverless environment, memory is not shared across instances.
 * For production, integrate with Upstash Redis or Vercel KV.
 */
export async function checkRateLimit(
  ip: string, 
  action: string = 'global', 
  config: RateLimitConfig = { limit: 100, windowMs: 60000 }
) {
  const key = `${ip}:${action}`;
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    // New or expired record
    rateLimitStore.set(key, { count: 1, resetAt: now + config.windowMs });
    return { success: true, remaining: config.limit - 1 };
  }

  if (record.count >= config.limit) {
    return { success: false, remaining: 0 };
  }

  // Increment
  record.count += 1;
  rateLimitStore.set(key, record);
  
  return { success: true, remaining: config.limit - record.count };
}

/**
 * Helper to generate 429 response
 */
export function RateLimitResponse() {
  return new NextResponse(
    JSON.stringify({ success: false, error: 'Too many requests, please try again later.' }),
    { 
      status: 429, 
      headers: { 'Content-Type': 'application/json', 'Retry-After': '60' } 
    }
  );
}
