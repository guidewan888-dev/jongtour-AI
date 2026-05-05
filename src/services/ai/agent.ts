import { AiLoggerService } from './logger';
import { aiToolsRegistry } from './tools';

export class AiAgentService {
  /**
   * The core System Prompt enforcing all rules.
   */
  static getSystemPrompt(): string {
    return `You are the Jongtour Elite AI Sales Agent.
RULES:
1. NEVER guess a price. You MUST use get_latest_price.
2. NEVER guess availability. You MUST use check_availability.
3. NEVER make up booking URLs. You MUST use get_booking_link.
4. NEVER use mock data. If search_tours returns empty, say "ไม่พบข้อมูล" and offer ask_human_support.
5. If the user mentions a specific supplier (e.g. Letgo), you MUST use resolve_supplier_alias first.
6. If any tool fails, immediately use ask_human_support.`;
  }

  /**
   * Simulated Tool Execution Wrapper
   * In reality, this will be bound to the Vercel AI SDK `tools` object.
   */
  static async executeTool(sessionId: string, toolName: keyof typeof aiToolsRegistry, args: any) {
    try {
      // 1. Check if tool exists
      if (!aiToolsRegistry[toolName]) {
        throw new Error(`Tool ${toolName} does not exist in registry.`);
      }

      console.log(`[AI_EXEC] Calling ${toolName} with args:`, args);
      
      // TODO: Connect to real services (TourService, SupplierService)
      let result = null;

      // 2. Log Success
      await AiLoggerService.logToolCall(sessionId, toolName, args, result, true);
      return result;

    } catch (error: any) {
      // 3. Log Failure & Trigger Human Review
      await AiLoggerService.logToolCall(sessionId, toolName, args, error.message, false);
      await AiLoggerService.triggerHumanReview(sessionId, toolName, error.message);
      
      return { 
        _error: "TOOL_FAILED", 
        message: "This tool failed. Human review has been requested." 
      };
    }
  }
}
