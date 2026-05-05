// Rule 6: ทุก tool call ต้อง log
// Rule 7: ถ้า tool fail ต้องส่ง Human Review

export class AiLoggerService {
  /**
   * Logs an executed tool call. 
   * In the final implementation, this will write to the database (e.g., AiToolLog).
   */
  static async logToolCall(sessionId: string, toolName: string, parameters: any, result: any, success: boolean) {
    console.log(`[AI_TOOL_LOG] ${new Date().toISOString()} | Session: ${sessionId} | Tool: ${toolName} | Success: ${success}`);
    
    // TODO: Write to Prisma database
    // await prisma.aiToolLog.create({ data: { sessionId, toolName, parameters, result, success } })
  }

  /**
   * Triggers the fallback to Human Review queue.
   */
  static async triggerHumanReview(sessionId: string, toolName: string, errorReason: string) {
    console.warn(`[AI_HUMAN_REVIEW_TRIGGERED] Session: ${sessionId} | Tool Failed: ${toolName} | Reason: ${errorReason}`);
    
    // TODO: Write to Admin Review Queue in Database
    // await prisma.adminReviewQueue.create({ ... })
  }
}
