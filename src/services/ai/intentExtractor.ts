import OpenAI from 'openai';
import { getIntentExtractorPrompt } from './prompts';

export interface IntentExtractionResult {
  intent: string;
  destination: string | null;
  date_from: string | null;
  date_to: string | null;
  pax: number | null;
  budget_min: number | null;
  budget_max: number | null;
  supplier_filter_required: boolean;
  requested_supplier_text: string | null;
  matched_supplier: {
    supplier_id: string | null;
    canonical_name: string | null;
    matched_alias: string | null;
    confidence: number;
  };
  strict_filters: {
    supplier_id: string | null;
  };
  should_ask_user: boolean;
  question_to_user: string | null;
}

export async function extractIntent(
  openai: OpenAI, 
  userMessage: string
): Promise<{ extracted: IntentExtractionResult | null, shouldReturnEarly: boolean, earlyReturnMessage: string }> {
  
  if (!userMessage || userMessage.trim().length === 0) {
    return { extracted: null, shouldReturnEarly: false, earlyReturnMessage: "" };
  }

  try {
    const intentRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "intent_extraction",
          strict: true,
          schema: {
            type: "object",
            properties: {
              intent: { type: "string", enum: ["search_tour", "other"] },
              destination: { type: ["string", "null"] },
              date_from: { type: ["string", "null"] },
              date_to: { type: ["string", "null"] },
              pax: { type: ["number", "null"] },
              budget_min: { type: ["number", "null"] },
              budget_max: { type: ["number", "null"] },
              supplier_filter_required: { type: "boolean" },
              requested_supplier_text: { type: ["string", "null"] },
              matched_supplier: {
                type: "object",
                properties: {
                  supplier_id: { type: ["string", "null"] },
                  canonical_name: { type: ["string", "null"] },
                  matched_alias: { type: ["string", "null"] },
                  confidence: { type: "number" }
                },
                required: ["supplier_id", "canonical_name", "matched_alias", "confidence"],
                additionalProperties: false
              },
              strict_filters: {
                type: "object",
                properties: {
                  supplier_id: { type: ["string", "null"] }
                },
                required: ["supplier_id"],
                additionalProperties: false
              },
              should_ask_user: { type: "boolean" },
              question_to_user: { type: ["string", "null"] }
            },
            required: ["intent", "destination", "date_from", "date_to", "pax", "budget_min", "budget_max", "supplier_filter_required", "requested_supplier_text", "matched_supplier", "strict_filters", "should_ask_user", "question_to_user"],
            additionalProperties: false
          }
        }
      },
      messages: [
        { role: "system", content: getIntentExtractorPrompt() },
        { role: "user", content: userMessage }
      ]
    });
    
    const intentExtracted = JSON.parse(intentRes.choices[0].message.content || "{}") as IntentExtractionResult;
    console.log("[Intent Extractor Result]:", JSON.stringify(intentExtracted, null, 2));

    if (intentExtracted.supplier_filter_required && !intentExtracted.matched_supplier.supplier_id) {
      return {
        extracted: intentExtracted,
        shouldReturnEarly: true,
        earlyReturnMessage: intentExtracted.question_to_user || "รบกวนระบุชื่อ Supplier อีกครั้งได้ไหมครับว่าหมายถึงเจ้าไหน?"
      };
    }

    return { extracted: intentExtracted, shouldReturnEarly: false, earlyReturnMessage: "" };

  } catch (error) {
    console.error("Intent Extraction Failed:", error);
    return { extracted: null, shouldReturnEarly: false, earlyReturnMessage: "" };
  }
}
