import dns from 'node:dns';

let dnsConfigured = false;

function ensureDnsOrder() {
  if (dnsConfigured) return;
  try {
    dns.setDefaultResultOrder('ipv4first');
    dnsConfigured = true;
  } catch {
    // ignore runtime without node:dns support
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableNetworkError(error: any): boolean {
  const name = String(error?.name || '');
  const message = String(error?.message || '');
  const details = String(error?.details || '');
  const text = `${name} ${message} ${details}`.toLowerCase();
  return (
    name === 'AbortError'
    || text.includes('connect timeout')
    || text.includes('und_err_connect_timeout')
    || text.includes('econnreset')
    || text.includes('econnrefused')
    || text.includes('etimedout')
    || text.includes('fetch failed')
  );
}

/**
 * Hardened fetch for Supabase REST calls.
 * - Prefer IPv4 DNS order (helps some ISP/IPv6 routes)
 * - Per-attempt timeout
 * - Retry transient network failures
 */
export async function supabaseFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  ensureDnsOrder();

  const maxAttempts = 3;
  const timeoutMs = 30_000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const timeoutController = new AbortController();
    const timeout = setTimeout(() => timeoutController.abort(), timeoutMs);

    try {
      const signal = init?.signal
        ? AbortSignal.any([init.signal, timeoutController.signal])
        : timeoutController.signal;

      const response = await fetch(input, { ...init, signal });
      return response;
    } catch (error: any) {
      const retryable = isRetryableNetworkError(error);
      if (!retryable || attempt >= maxAttempts) {
        throw error;
      }
      await sleep(700 * attempt);
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error('Supabase fetch failed after retries');
}

