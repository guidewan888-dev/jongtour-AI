import { SupabaseClient } from '@supabase/supabase-js';

export class AuditService {
  /**
   * Logs an action to the audit_logs table
   */
  static async logAction(
    supabase: SupabaseClient,
    params: {
      userId?: string;
      action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'EXPORT';
      resource: string;
      resourceId: string;
      oldValues?: any;
      newValues?: any;
    }
  ) {
    const { error } = await supabase.from('audit_logs').insert({
      userId: params.userId,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      oldValues: params.oldValues || null,
      newValues: params.newValues || null,
    });

    if (error) {
      console.error('Failed to write audit log:', error);
    }
  }

  /**
   * Automatically log data changes by comparing old and new states
   */
  static async logChange(
    supabase: SupabaseClient,
    userId: string,
    resource: string,
    resourceId: string,
    oldData: any,
    newData: any
  ) {
    // Only log if something actually changed
    const changedFields: Record<string, any> = {};
    const oldFields: Record<string, any> = {};
    
    let hasChanges = false;
    
    if (oldData && newData) {
      for (const key in newData) {
        if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
          changedFields[key] = newData[key];
          oldFields[key] = oldData[key];
          hasChanges = true;
        }
      }
    }

    if (hasChanges) {
      await this.logAction(supabase, {
        userId,
        action: 'UPDATE',
        resource,
        resourceId,
        oldValues: oldFields,
        newValues: changedFields
      });
    }
  }
}
