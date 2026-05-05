/**
 * Generic API client wrapper for frontend use.
 * Provides standardized error handling and type safety.
 */

type ApiResponse<T> = {
  data: T | null;
  error: string | null;
  status: number;
};

export async function apiGet<T>(url: string): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { method: 'GET' });
}

export async function apiPost<T>(url: string, body: unknown): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function apiPatch<T>(url: string, body: unknown): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function apiDelete<T>(url: string): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { method: 'DELETE' });
}

async function apiRequest<T>(url: string, init: RequestInit): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(url, { ...init, credentials: 'include' });
    const status = res.status;

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({ error: res.statusText }));
      return { data: null, error: errorBody.error || `HTTP ${status}`, status };
    }

    const data = await res.json().catch(() => null);
    return { data: data as T, error: null, status };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Network error',
      status: 0,
    };
  }
}
