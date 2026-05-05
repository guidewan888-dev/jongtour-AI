import { prisma } from '@/lib/prisma';

// ============================================================
// CENTRALIZED LOGGER
// ============================================================

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export type AuditAction = 
  | 'LOGIN' | 'LOGOUT' | 'REGISTER'
  | 'BOOKING_CREATE' | 'BOOKING_UPDATE' | 'BOOKING_CANCEL'
  | 'PAYMENT_CREATE' | 'PAYMENT_CONFIRM' | 'REFUND_CREATE'
  | 'TOUR_CREATE' | 'TOUR_UPDATE' | 'TOUR_DELETE'
  | 'CUSTOMER_UPDATE' | 'CUSTOMER_DELETE'
  | 'LEAD_CREATE' | 'LEAD_UPDATE'
  | 'QUOTATION_CREATE' | 'QUOTATION_SEND'
  | 'VOUCHER_GENERATE' | 'INVOICE_GENERATE'
  | 'USER_INVITE' | 'USER_ROLE_CHANGE' | 'USER_DEACTIVATE'
  | 'SETTING_CHANGE'
  | 'SYNC_START' | 'SYNC_COMPLETE' | 'SYNC_ERROR'
  | 'AI_QUERY' | 'AI_ESCALATE'
  | 'PERMISSION_DENIED'
  | 'SYSTEM_ERROR'
  // RPA & Wholesale Automation
  | 'CREDENTIAL_CREATE' | 'CREDENTIAL_UPDATE' | 'CREDENTIAL_DELETE' | 'CREDENTIAL_TEST_LOGIN'
  | 'RPA_SESSION_START' | 'RPA_SESSION_STOP' | 'RPA_FILL_FORM'
  | 'RPA_REQUEST_APPROVAL' | 'RPA_ADMIN_APPROVE' | 'RPA_SUBMIT_BOOKING'
  | 'RPA_MANUAL_FOLLOW_UP' | 'RPA_SCREENSHOT' | 'RPA_ERROR'
  | 'EXTERNAL_BOOKING_REF_SAVE';

/**
 * Log to console with structured format
 */
export function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  const logEntry = { timestamp, level, message, ...meta };
  
  switch (level) {
    case 'ERROR': console.error(JSON.stringify(logEntry)); break;
    case 'WARN': console.warn(JSON.stringify(logEntry)); break;
    case 'DEBUG': if (process.env.NODE_ENV === 'development') console.log(JSON.stringify(logEntry)); break;
    default: console.log(JSON.stringify(logEntry));
  }
}

/**
 * Write an audit log entry to the database.
 * Non-blocking — errors are caught and logged to console.
 */
export async function auditLog(params: {
  action: AuditAction;
  userId?: string;
  targetType?: string;
  targetId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        action: params.action,
        userId: params.userId || 'SYSTEM',
        targetType: params.targetType,
        targetId: params.targetId,
        details: params.details ? JSON.stringify(params.details) : undefined,
        ipAddress: params.ipAddress,
      },
    });
  } catch (err) {
    // Never let audit logging crash the main flow
    log('ERROR', 'Failed to write audit log', { error: String(err), action: params.action });
  }
}
