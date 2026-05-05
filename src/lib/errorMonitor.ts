/**
 * Error Monitoring Service — Centralized error tracking, logging, and alerting
 */

type ErrorSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type ErrorCategory = 'API' | 'DATABASE' | 'AUTH' | 'PAYMENT' | 'SYNC' | 'AI' | 'WEBHOOK' | 'GENERAL';

interface ErrorReport {
  message: string;
  stack?: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  context?: Record<string, any>;
  userId?: string;
  url?: string;
  timestamp: string;
}

class ErrorMonitor {
  private static errors: ErrorReport[] = [];
  private static readonly MAX_BUFFER = 100;

  /** Log an error */
  static capture(
    error: Error | string,
    options?: {
      severity?: ErrorSeverity;
      category?: ErrorCategory;
      context?: Record<string, any>;
      userId?: string;
      url?: string;
    }
  ): void {
    const report: ErrorReport = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'string' ? undefined : error.stack,
      severity: options?.severity || 'MEDIUM',
      category: options?.category || 'GENERAL',
      context: options?.context,
      userId: options?.userId,
      url: options?.url,
      timestamp: new Date().toISOString(),
    };

    this.errors.push(report);
    if (this.errors.length > this.MAX_BUFFER) {
      this.errors = this.errors.slice(-this.MAX_BUFFER);
    }

    // Console output with color coding
    const prefix = `[${report.severity}][${report.category}]`;
    if (report.severity === 'CRITICAL' || report.severity === 'HIGH') {
      console.error(prefix, report.message, report.context);
    } else {
      console.warn(prefix, report.message);
    }

    // Critical errors → attempt DB log + notification
    if (report.severity === 'CRITICAL') {
      this.persistCriticalError(report).catch(() => {});
    }
  }

  /** Persist critical errors to DB */
  private static async persistCriticalError(report: ErrorReport) {
    try {
      const { prisma } = await import('@/lib/prisma');
      await (prisma as any).systemErrorLog.create({
        data: {
          message: report.message.substring(0, 500),
          stack: report.stack?.substring(0, 2000),
          severity: report.severity,
          category: report.category,
          context: report.context || {},
          userId: report.userId,
        },
      });
    } catch {
      // Silently fail — can't do much if DB itself is down
    }

    // Attempt admin notification for critical errors
    try {
      const { NotificationService } = await import('@/services/core/NotificationService');
      await NotificationService.adminAlert(
        `🚨 CRITICAL ERROR [${report.category}]: ${report.message}`,
        'CRITICAL'
      );
    } catch {}
  }

  /** Get recent errors */
  static getRecentErrors(limit = 20): ErrorReport[] {
    return this.errors.slice(-limit).reverse();
  }

  /** Get error stats */
  static getStats() {
    const now = Date.now();
    const last24h = this.errors.filter(e => now - new Date(e.timestamp).getTime() < 86400000);
    return {
      total: this.errors.length,
      last24h: last24h.length,
      bySeverity: {
        CRITICAL: last24h.filter(e => e.severity === 'CRITICAL').length,
        HIGH: last24h.filter(e => e.severity === 'HIGH').length,
        MEDIUM: last24h.filter(e => e.severity === 'MEDIUM').length,
        LOW: last24h.filter(e => e.severity === 'LOW').length,
      },
      byCategory: last24h.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  /** Wrap async function with error capture */
  static wrapAsync<T>(
    fn: () => Promise<T>,
    options?: { severity?: ErrorSeverity; category?: ErrorCategory; context?: Record<string, any> }
  ): Promise<T | null> {
    return fn().catch(err => {
      this.capture(err, options);
      return null;
    });
  }

  /** Clear buffer */
  static clear() {
    this.errors = [];
  }
}

export { ErrorMonitor, type ErrorReport, type ErrorSeverity, type ErrorCategory };
