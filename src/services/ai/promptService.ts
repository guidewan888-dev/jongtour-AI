import { PrismaClient } from "@prisma/client";
import { BOOKING_ASSISTANT_SYSTEM_PROMPT } from "./prompts/bookingAssistantPrompt";
import { FILE_INTENT_CLASSIFIER_PROMPT } from "./prompts/fileIntentClassifierPrompt";
import { VISION_AI_PROMPT } from "./prompts/visionAiPrompt";
import { RESPONSE_STRATEGY_PROMPT } from "./prompts/responseStrategyPrompt";

const prisma = new PrismaClient();

export async function getActivePrompt(templateName: string): Promise<string> {
  try {
    const template = await prisma.aiPromptTemplate.findUnique({
      where: { name: templateName }
    });

    if (template) {
      const activeVersion = await prisma.aiPromptVersion.findFirst({
        where: { 
          templateId: template.id,
          version: template.currentVersion
        }
      });
      if (activeVersion) {
        return activeVersion.content;
      }
    }
  } catch (error) {
    console.error(`Error fetching prompt [${templateName}] from DB:`, error);
  }

  // Fallback to static code if DB fetch fails or no active version exists
  if (templateName === "BOOKING_ASSISTANT_SYSTEM_PROMPT") {
    return BOOKING_ASSISTANT_SYSTEM_PROMPT;
  }
  if (templateName === "FILE_INTENT_CLASSIFIER") {
    return FILE_INTENT_CLASSIFIER_PROMPT;
  }
  if (templateName === "VISION_AI_SYSTEM") {
    return VISION_AI_PROMPT;
  }
  if (templateName === "SALES_RESPONSE_STRATEGY") {
    return RESPONSE_STRATEGY_PROMPT;
  }

  // Default fallback
  return "คุณคือ AI Assistant โปรดตอบคำถามลูกค้าอย่างสุภาพ";
}
