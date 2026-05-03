export function checkSensitiveCase(userMessage: string): { isSensitive: boolean; reason: string | null } {
  const sensitiveKeywords = [
    "ขอเงินคืน", "คืนเงิน", "refund",
    "โกง", "หลอกลวง", "scam",
    "ฟ้อง", "สคบ", "ตำรวจ", "แจ้งความ",
    "แย่มาก", "ห่วย", "ร้องเรียน", "complaint"
  ];

  const lowerMessage = userMessage.toLowerCase();
  
  for (const keyword of sensitiveKeywords) {
    if (lowerMessage.includes(keyword)) {
      return { 
        isSensitive: true, 
        reason: `ระบบตรวจพบคำว่า "${keyword}" ซึ่งเป็นกรณีที่ต้องใช้ความระมัดระวัง (Sensitive Case) ระบบจึงทำการโอนสายให้ฝ่ายบริการลูกค้า (Human Support)` 
      };
    }
  }

  return { isSensitive: false, reason: null };
}

export function validateAiOutput(aiMessage: string, availableTours: any[]): { isValid: boolean; sanitizedMessage: string } {
  let sanitizedMessage = aiMessage;
  let isValid = true;

  // 1. Anti-Hallucination: Check for made up booking links
  // The system only allows booking links that match the ID of tours in `availableTours`
  const bookingLinkRegex = /booking\.jongtour\.com\/checkout\/([a-zA-Z0-9_-]+)/g;
  
  const validTourCodes = availableTours.map(t => t.code);
  const validTourIds = availableTours.map(t => t.id);

  let match;
  while ((match = bookingLinkRegex.exec(sanitizedMessage)) !== null) {
    const matchedId = match[1];
    // We check if the ID in the URL exists in the context we provided to AI
    if (!validTourCodes.includes(matchedId) && !validTourIds.includes(matchedId)) {
      isValid = false;
      console.warn(`[Guardrail] AI Hallucinated a booking link: ${match[0]}`);
      sanitizedMessage = sanitizedMessage.replace(
        match[0], 
        "#" // Neutralize the fake link
      );
      sanitizedMessage += "\n\n*(หมายเหตุ: ลิงก์จองทัวร์บางรายการอาจหมดอายุหรือไม่ถูกต้อง กรุณาแจ้งแอดมินเพื่อตรวจสอบอีกครั้ง)*";
    }
  }

  // 2. Anti-Hallucination: Check for impossible prices
  // If the AI says a price lower than the absolute minimum price we gave it
  if (availableTours && availableTours.length > 0) {
    const minRealPrice = Math.min(...availableTours.map(t => t.price).filter(p => p > 0));
    const priceRegex = /([0-9]{1,3}(,[0-9]{3})*)\s*บาท/g;
    
    let priceMatch;
    while ((priceMatch = priceRegex.exec(sanitizedMessage)) !== null) {
      const statedPrice = parseInt(priceMatch[1].replace(/,/g, ''));
      // If AI says a price is less than the real minimum price and it's a realistic price range (> 1000 to avoid matching things like "500 บาทมัดจำ")
      if (statedPrice > 1000 && statedPrice < minRealPrice) {
        isValid = false;
        console.warn(`[Guardrail] AI Hallucinated a low price: ${statedPrice} (Min real is ${minRealPrice})`);
        sanitizedMessage += `\n\n*(หมายเหตุ: ราคาเริ่มต้นที่ถูกต้อง ณ ปัจจุบันคือ ${minRealPrice.toLocaleString()} บาท)*`;
        break; // Append disclaimer once
      }
    }
  }

  return { isValid, sanitizedMessage };
}
