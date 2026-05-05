import OpenAI from 'openai';

/**
 * Retry wrapper for OpenAI API calls.
 * - Retries on 429 (rate limit), 500, 503 errors
 * - Falls back to cheaper model on repeated failures
 * - Exponential backoff with jitter
 */

interface RetryConfig {
  maxRetries?: number;
  fallbackModel?: string;
  initialDelayMs?: number;
}

export async function callWithRetry<T>(
  fn: (model?: string) => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const { maxRetries = 2, fallbackModel = 'gpt-3.5-turbo', initialDelayMs = 1000 } = config;
  
  let lastError: any;
  
  // Try with original model
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const status = error?.status || error?.response?.status;
      
      // Only retry on transient errors
      if (status === 429 || status === 500 || status === 502 || status === 503) {
        if (attempt < maxRetries) {
          const delay = initialDelayMs * Math.pow(2, attempt) + Math.random() * 500;
          console.warn(`[AI Retry] Attempt ${attempt + 1}/${maxRetries} failed with ${status}. Retrying in ${Math.round(delay)}ms...`);
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
      } else {
        // Non-retryable error (401, 400, etc.)
        throw error;
      }
    }
  }
  
  // All retries failed — try fallback model
  console.warn(`[AI Fallback] All retries failed. Trying fallback model: ${fallbackModel}`);
  try {
    return await fn(fallbackModel);
  } catch (fallbackError: any) {
    console.error(`[AI Fallback] Fallback also failed:`, fallbackError?.message);
    throw lastError; // Throw original error
  }
}

/**
 * Create OpenAI chat completion with automatic retry + fallback.
 */
export async function createChatCompletionSafe(
  openai: OpenAI,
  params: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming,
  retryConfig?: RetryConfig
): Promise<OpenAI.Chat.Completions.ChatCompletion> {
  return callWithRetry(
    async (fallbackModel?: string) => {
      const model = fallbackModel || params.model;
      return openai.chat.completions.create({ ...params, model });
    },
    retryConfig
  );
}
