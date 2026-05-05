export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Clean up base64 prefix if present (e.g. data:image/jpeg;base64,...)
    const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

    const prompt = `You are a strict data extraction system. Extract the following information from this passport image. 
Return ONLY a valid JSON object with the following keys, and nothing else. If a field is illegible or missing, use null.
{
  "firstName": "string (English First Name)",
  "lastName": "string (English Last Name)",
  "passportNumber": "string (Passport Number)",
  "dateOfBirth": "string (YYYY-MM-DD)",
  "expiryDate": "string (YYYY-MM-DD)",
  "gender": "string (M or F or null)"
}`;

    const imageParts = [
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg",
        },
      },
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const responseText = result.response.text();
    
    // Clean markdown formatting if any
    const jsonStr = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
    
    let parsedData;
    try {
      parsedData = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse Gemini output:", jsonStr);
      return NextResponse.json({ error: "Failed to parse OCR data" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: parsedData });

  } catch (error) {
    console.error("OCR API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

