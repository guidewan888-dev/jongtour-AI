import OpenAI from 'openai';

export const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "resolve_supplier_alias",
      description: "แปลงชื่อ Wholesale/Supplier ที่ลูกค้าพิมพ์ (เช่น Zego, Happy, KTC) ให้เป็น supplier_id สำหรับใช้กรองผลการค้นหา ห้ามเดา supplier_id เอง ต้องเรียกฟังก์ชันนี้เสมอ",
      parameters: {
        type: "object",
        properties: {
          supplier_text: {
            type: "string",
            description: "ชื่อ Wholesale/Supplier ที่ลูกค้าพิมพ์"
          }
        },
        required: ["supplier_text"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_tours",
      description: "ค้นหาโปรแกรมทัวร์จากฐานข้อมูลจริง ต้องเรียกเสมอเมื่อลูกค้าถามหาทัวร์ ห้ามตอบจากความจำ",
      parameters: {
        type: "object",
        properties: {
          destination: { type: "string", description: "ประเทศหรือเมืองปลายทาง (เช่น Japan, Korea, ญี่ปุ่น)" },
          date_from: { type: "string", description: "วันเริ่มต้นช่วงที่ต้องการ (YYYY-MM-DD)" },
          date_to: { type: "string", description: "วันสิ้นสุดช่วงที่ต้องการ (YYYY-MM-DD)" },
          pax: { type: "integer", description: "จำนวนผู้เดินทาง" },
          budget_max: { type: "number", description: "งบประมาณสูงสุดต่อคน (บาท)" },
          supplier_id: { type: "string", description: "กรอง supplier เฉพาะ (ได้จาก resolve_supplier_alias)" },
          airline: { type: "string", description: "สายการบินที่ต้องการ" },
          tour_type: { type: "string", description: "ประเภททัวร์: GROUP, FIT, PRIVATE" },
          keyword: { type: "string", description: "คำค้นเพิ่มเติม เช่น ซากุระ, ออโรร่า" },
          limit: { type: "integer", description: "จำนวนผลลัพธ์สูงสุด (default 10)" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_tour_detail",
      description: "ดึงรายละเอียดโปรแกรมทัวร์ (ไฮไลท์, โปรแกรมรายวัน, เงื่อนไข) ต้องเรียกเมื่อลูกค้าต้องการรายละเอียดเพิ่ม",
      parameters: {
        type: "object",
        properties: {
          tour_id: { type: "string", description: "Tour ID หรือ Tour Code" }
        },
        required: ["tour_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_departure_dates",
      description: "ดึงวันเดินทางทั้งหมดของโปรแกรมทัวร์ ห้ามเดาวันเดินทางเอง ต้องเรียกฟังก์ชันนี้เสมอ",
      parameters: {
        type: "object",
        properties: {
          tour_id: { type: "string", description: "Tour ID หรือ Tour Code" },
          date_from: { type: "string", description: "กรองจากวันที่ (YYYY-MM-DD)" },
          date_to: { type: "string", description: "กรองถึงวันที่ (YYYY-MM-DD)" },
          available_only: { type: "boolean", description: "แสดงเฉพาะรอบที่ยังว่าง" }
        },
        required: ["tour_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "check_availability",
      description: "ตรวจสอบที่ว่างล่าสุดของรอบเดินทาง ห้ามเดาจำนวนที่ว่างเอง ต้องเรียกฟังก์ชันนี้เสมอ",
      parameters: {
        type: "object",
        properties: {
          tour_id: { type: "string", description: "Tour ID หรือ Tour Code" },
          departure_id: { type: "string", description: "Departure ID เฉพาะรอบ" },
          pax: { type: "integer", description: "จำนวนคนที่ต้องการจอง" }
        },
        required: ["tour_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_latest_price",
      description: "ดึงราคาล่าสุดของทัวร์จากฐานข้อมูล ห้ามเดาราคาเอง ห้ามตอบราคาจากความจำ ต้องเรียกฟังก์ชันนี้เสมอเมื่อลูกค้าถามราคา",
      parameters: {
        type: "object",
        properties: {
          tour_id: { type: "string", description: "Tour ID หรือ Tour Code" },
          departure_id: { type: "string", description: "Departure ID (optional)" },
          pax_adult: { type: "integer", description: "จำนวนผู้ใหญ่" },
          pax_child: { type: "integer", description: "จำนวนเด็ก" },
          pax_infant: { type: "integer", description: "จำนวนทารก" }
        },
        required: ["tour_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_booking_link",
      description: "สร้างลิงก์จองจริงของโปรแกรม ห้ามสร้าง URL เอง ต้องเรียกฟังก์ชันนี้เสมอ",
      parameters: {
        type: "object",
        properties: {
          tour_id: { type: "string", description: "Tour ID หรือ Tour Code" },
          departure_id: { type: "string", description: "Departure ID" },
          pax: { type: "integer", description: "จำนวนผู้เดินทาง" }
        },
        required: ["tour_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "compare_tours",
      description: "เปรียบเทียบ 2-3 โปรแกรมทัวร์ให้ลูกค้า (ราคา, วันเดินทาง, ไฮไลท์, สายการบิน) ต้องเรียกเมื่อลูกค้าต้องการเปรียบเทียบ",
      parameters: {
        type: "object",
        properties: {
          tour_ids: { 
            type: "array",
            items: { type: "string" },
            description: "รายการ Tour ID/Code ที่ต้องการเปรียบเทียบ (2-3 รายการ)"
          }
        },
        required: ["tour_ids"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_lead",
      description: "สร้าง lead ให้ทีมขายติดต่อกลับ เมื่อลูกค้าสนใจแต่ต้องการให้เจ้าหน้าที่ช่วย",
      parameters: {
        type: "object",
        properties: {
          customer_name: { type: "string", description: "ชื่อลูกค้า" },
          phone: { type: "string", description: "เบอร์โทรศัพท์" },
          line_id: { type: "string", description: "LINE ID" },
          email: { type: "string", description: "อีเมล" },
          destination: { type: "string", description: "จุดหมายปลายทางที่สนใจ" },
          travel_date: { type: "string", description: "ช่วงเวลาที่ต้องการเดินทาง" },
          pax: { type: "integer", description: "จำนวนคน" },
          message: { type: "string", description: "ข้อความ/ความต้องการ" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_quotation",
      description: "สร้างใบเสนอราคาเบื้องต้นจากข้อมูลทัวร์จริง",
      parameters: {
        type: "object",
        properties: {
          tour_id: { type: "string", description: "Tour ID" },
          departure_id: { type: "string", description: "Departure ID" },
          customer_name: { type: "string", description: "ชื่อลูกค้า" },
          customer_email: { type: "string", description: "อีเมลลูกค้า" },
          pax_adult: { type: "integer", description: "จำนวนผู้ใหญ่" },
          pax_child: { type: "integer", description: "จำนวนเด็ก" },
          notes: { type: "string", description: "หมายเหตุเพิ่มเติม" }
        },
        required: ["tour_id", "departure_id", "customer_name", "pax_adult"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_private_group_itinerary",
      description: "สร้างร่างโปรแกรมกรุ๊ปส่วนตัวให้ลูกค้า พร้อมราคาประมาณการเบื้องต้น",
      parameters: {
        type: "object",
        properties: {
          destination: { type: "string", description: "ประเทศ/เมืองปลายทาง" },
          duration_days: { type: "integer", description: "จำนวนวัน" },
          pax: { type: "integer", description: "จำนวนผู้เดินทาง" },
          travel_period: { type: "string", description: "ช่วงเวลา เช่น ธ.ค. 2025" },
          budget_per_person: { type: "number", description: "งบประมาณต่อคน" },
          hotel_level: { type: "string", description: "ระดับโรงแรม: 3 Star, 4 Star, 5 Star" },
          tour_style: { type: "string", description: "สไตล์ทัวร์: Culture, Adventure, Beach, City" },
          include_airfare: { type: "boolean", description: "รวมตั๋วเครื่องบินหรือไม่" },
          meal_requirement: { type: "string", description: "ข้อกำหนดอาหาร: Halal, Vegetarian, etc." },
          special_request: { type: "string", description: "ความต้องการพิเศษ" }
        },
        required: ["destination", "duration_days", "pax"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "estimate_private_group_price",
      description: "คำนวณราคาประมาณการกรุ๊ปส่วนตัว พร้อมแจ้ง assumptions ให้ลูกค้าทราบ ราคานี้เป็นประมาณการเบื้องต้นเท่านั้น",
      parameters: {
        type: "object",
        properties: {
          destination: { type: "string", description: "ประเทศ/เมืองปลายทาง" },
          duration_days: { type: "integer", description: "จำนวนวัน" },
          pax: { type: "integer", description: "จำนวนผู้เดินทาง" },
          hotel_level: { type: "string", description: "ระดับโรงแรม: 3 Star, 4 Star, 5 Star" },
          include_airfare: { type: "boolean", description: "รวมตั๋วเครื่องบิน" },
          travel_period: { type: "string", description: "ช่วงเวลาเดินทาง" },
          service_level: { type: "string", description: "ระดับบริการ: Standard, Premium, Luxury" }
        },
        required: ["destination", "duration_days", "pax"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "ask_human_support",
      description: "ส่งต่อให้เจ้าหน้าที่เมื่อข้อมูลไม่ชัดเจน เป็นเคสสำคัญ หรือ AI ไม่มั่นใจในคำตอบ",
      parameters: {
        type: "object",
        properties: {
          reason: { type: "string", description: "เหตุผลที่ต้องส่งต่อ" },
          customer_message: { type: "string", description: "ข้อความลูกค้า" },
          priority: { type: "string", description: "ความเร่งด่วน: LOW, NORMAL, HIGH, URGENT" },
          context: { type: "string", description: "บริบทเพิ่มเติมจากการสนทนา" }
        },
        required: ["reason", "customer_message"]
      }
    }
  }
];
