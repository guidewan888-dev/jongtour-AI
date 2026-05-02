import OpenAI from 'openai';
import { getQualityCheckerPrompt } from './prompts';

export async function runQualityChecker(
  openai: OpenAI,
  requestedSupplierId: string,
  requestedSupplierName: string,
  tours: any[],
  finalOutputText: string
): Promise<string> {
  try {
    const qcPrompt = getQualityCheckerPrompt(
      requestedSupplierId,
      requestedSupplierName,
      tours,
      finalOutputText
    );

    const qcRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: qcPrompt }]
    });
    
    const qcData = JSON.parse(qcRes.choices[0].message.content || "{}");
    console.log("[Quality Checker]:", qcData);
    
    if (qcData.approved === false && qcData.safe_response) {
       return qcData.safe_response;
    }
  } catch (err) {
    console.error("Quality Checker Error:", err);
  }
  
  return finalOutputText;
}
