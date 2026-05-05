/**
 * OpenAI Token & Cost Tracker
 * Logs usage per conversation for billing insights.
 * 
 * Pricing (as of 2024-2025, GPT-4o-mini):
 * - Input:  $0.15 / 1M tokens
 * - Output: $0.60 / 1M tokens
 * - Embedding (text-embedding-3-small): $0.02 / 1M tokens
 */

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  model: string;
}

const PRICING: Record<string, { input: number; output: number }> = {
  'gpt-4o-mini':     { input: 0.15 / 1_000_000,  output: 0.60 / 1_000_000 },
  'gpt-4o':          { input: 2.50 / 1_000_000,   output: 10.0 / 1_000_000 },
  'gpt-3.5-turbo':   { input: 0.50 / 1_000_000,   output: 1.50 / 1_000_000 },
  'text-embedding-3-small': { input: 0.02 / 1_000_000, output: 0 },
};

export function calculateCost(
  model: string,
  promptTokens: number,
  completionTokens: number
): number {
  const price = PRICING[model] || PRICING['gpt-4o-mini'];
  return (promptTokens * price.input) + (completionTokens * price.output);
}

export function extractUsage(response: any, model: string = 'gpt-4o-mini'): TokenUsage {
  const usage = response?.usage;
  if (!usage) {
    return { promptTokens: 0, completionTokens: 0, totalTokens: 0, estimatedCostUsd: 0, model };
  }
  
  const promptTokens = usage.prompt_tokens || 0;
  const completionTokens = usage.completion_tokens || 0;
  const totalTokens = usage.total_tokens || promptTokens + completionTokens;
  const estimatedCostUsd = calculateCost(model, promptTokens, completionTokens);

  return { promptTokens, completionTokens, totalTokens, estimatedCostUsd, model };
}

/**
 * Accumulate multiple API call usages (e.g. initial + second pass).
 */
export function mergeUsage(...usages: TokenUsage[]): TokenUsage {
  return usages.reduce((acc, u) => ({
    promptTokens: acc.promptTokens + u.promptTokens,
    completionTokens: acc.completionTokens + u.completionTokens,
    totalTokens: acc.totalTokens + u.totalTokens,
    estimatedCostUsd: acc.estimatedCostUsd + u.estimatedCostUsd,
    model: u.model || acc.model,
  }), { promptTokens: 0, completionTokens: 0, totalTokens: 0, estimatedCostUsd: 0, model: 'gpt-4o-mini' });
}
