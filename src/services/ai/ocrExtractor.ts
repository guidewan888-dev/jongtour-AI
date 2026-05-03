import OpenAI from 'openai';
import { getActivePrompt } from './promptService';

export async function processUserImage(openai: OpenAI, userImage: string, customerMessage: string = "") {
  try {
    // Step 1: Raw Text Extraction
    const rawOcrRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: [
          { type: "text", text: "Please extract all text visible in this image exactly as written. If there is no text, just reply 'NO_TEXT'." },
          { type: "image_url", image_url: { url: userImage } }
        ]
      }]
    });
    
    let rawOcrText = rawOcrRes.choices[0].message.content || "";
    if (rawOcrText.toLowerCase().includes("sorry") || rawOcrText.toLowerCase().includes("cannot") || rawOcrText.toLowerCase().includes("can't") || rawOcrText.includes("ไม่สามารถ")) {
       rawOcrText = ""; 
    }

    // Step 2: File Intent Classification
    const classifierPrompt = await getActivePrompt("FILE_INTENT_CLASSIFIER");
    const classifierRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: classifierPrompt },
        { role: "user", content: `file_type: image\nocr_text: ${rawOcrText}\ncustomer_message: ${customerMessage}` },
        { role: "user", content: [{ type: "image_url", image_url: { url: userImage } }] }
      ]
    });

    let intentData: any = {};
    try {
      intentData = JSON.parse(classifierRes.choices[0].message.content || "{}");
    } catch(e) {}

    const fileCategory = intentData.file_category || "unknown";
    console.log("[File Classifier Result]:", fileCategory);

    // Step 3: Vision AI Extraction based on category
    const visionPrompt = await getActivePrompt("VISION_AI_SYSTEM");
    let extractedData: any = null;

    if (fileCategory === "tour_program_image" || fileCategory === "price_table_image" || fileCategory === "departure_table_image") {
       // Extract Tour Data
       const extractRes = await openai.chat.completions.create({
         model: "gpt-4o",
         response_format: { type: "json_object" },
         messages: [
           { role: "system", content: visionPrompt },
           { role: "user", content: `Please extract the tour data as JSON. \nocr_text: ${rawOcrText}\ncustomer_message: ${customerMessage}` },
           { role: "user", content: [{ type: "image_url", image_url: { url: userImage } }] }
         ]
       });
       extractedData = JSON.parse(extractRes.choices[0].message.content || "{}");
       extractedData.internal_flow = "tour_extraction";
    } 
    else if (fileCategory === "travel_destination_image" || fileCategory === "landmark_image") {
       // Extract Visual Destination
       const extractRes = await openai.chat.completions.create({
         model: "gpt-4o-mini",
         response_format: { type: "json_object" },
         messages: [
           { role: "system", content: visionPrompt },
           { role: "user", content: `Please analyze this destination image and return the JSON. \nocr_text: ${rawOcrText}\ncustomer_message: ${customerMessage}` },
           { role: "user", content: [{ type: "image_url", image_url: { url: userImage } }] }
         ]
       });
       extractedData = JSON.parse(extractRes.choices[0].message.content || "{}");
       extractedData.internal_flow = "visual_destination";
    }
    else {
       // Fallback or other document types (like passport, slip)
       extractedData = { 
         internal_flow: "unknown_or_document", 
         intent: intentData 
       };
    }

    console.log("[Vision Extraction]:", JSON.stringify(extractedData, null, 2));
    return extractedData;

  } catch (error) {
    console.error("OCR/Vision Extraction Failed:", error);
    return null;
  }
}

export function getSearchAgentPrompt(extractedDataForSearch: any): string {
  return `คุณคือ AI Search Agent สำหรับระบบค้นหาทัวร์ B2B
หน้าที่ของคุณคือใช้ข้อมูล extracted JSON เพื่อค้นหาทัวร์ที่ตรงที่สุดใน database

ข้อมูลที่สกัดได้จากรูปภาพ:
${JSON.stringify(extractedDataForSearch, null, 2)}

จงค้นหาทัวร์โดยใช้คำสั่ง search_tours ตามพารามิเตอร์ที่เหมาะสม`;
}
