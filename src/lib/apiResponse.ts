/**
 * API Response Helpers — Standardized JSON response format
 */
import { NextResponse } from 'next/server';
import { ErrorMonitor, type ErrorCategory } from './errorMonitor';

type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    page?: number;
    total?: number;
    totalPages?: number;
    limit?: number;
  };
};

/** Success response */
export function apiSuccess<T>(data: T, meta?: ApiResponse['meta'], status = 200) {
  return NextResponse.json({ success: true, data, ...(meta && { meta }) } satisfies ApiResponse<T>, { status });
}

/** Error response */
export function apiError(message: string, status = 400, category?: ErrorCategory) {
  if (status >= 500 && category) {
    ErrorMonitor.capture(message, { severity: 'HIGH', category });
  }
  return NextResponse.json({ success: false, error: message } satisfies ApiResponse, { status });
}

/** Paginated response */
export function apiPaginated<T>(data: T[], total: number, page: number, limit: number) {
  return apiSuccess(data, {
    page,
    total,
    totalPages: Math.ceil(total / limit),
    limit,
  });
}

/** Unauthorized response */
export function apiUnauthorized() {
  return apiError('Unauthorized', 401, 'AUTH');
}

/** Not found response */
export function apiNotFound(resource = 'Resource') {
  return apiError(`${resource} not found`, 404);
}

/** Validation error */
export function apiValidationError(fields: Record<string, string>) {
  return NextResponse.json({
    success: false,
    error: 'Validation failed',
    details: fields,
  }, { status: 422 });
}

/** Wrap handler with error catching */
export function withErrorHandler(handler: (req: Request) => Promise<Response>, category: ErrorCategory = 'API') {
  return async (req: Request) => {
    try {
      return await handler(req);
    } catch (err: any) {
      ErrorMonitor.capture(err, { severity: 'HIGH', category, url: req.url });
      return apiError(err.message || 'Internal Server Error', 500, category);
    }
  };
}
