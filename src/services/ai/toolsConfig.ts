import OpenAI from 'openai';

export const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "resolve_supplier_alias",
      description: "แปลงชื่อ Wholesale/Supplier ที่ลูกค้าพิมพ์ให้เป็น supplier_id",
      parameters: {
        type: "object",
        properties: {
          supplier_text: {
            type: "string"
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
      description: "ค้นหาโปรแกรมทัวร์จากฐานข้อมูลจริง",
      parameters: {
        type: "object",
        properties: {
          destination: { type: "string" },
          date_from: { type: "string" },
          date_to: { type: "string" },
          pax: { type: "integer" },
          budget_max: { type: "number" },
          supplier_id: { type: "string" },
          airline: { type: "string" },
          tour_type: { type: "string" },
          limit: { type: "integer" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_tour_detail",
      description: "ดึงรายละเอียดโปรแกรมทัวร์",
      parameters: {
        type: "object",
        properties: {
          tour_id: { type: "string" }
        },
        required: ["tour_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_departure_dates",
      description: "ดึงวันเดินทางของโปรแกรมทัวร์",
      parameters: {
        type: "object",
        properties: {
          tour_id: { type: "string" },
          date_from: { type: "string" },
          date_to: { type: "string" }
        },
        required: ["tour_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "check_availability",
      description: "ตรวจสอบที่ว่างล่าสุด",
      parameters: {
        type: "object",
        properties: {
          tour_id: { type: "string" },
          departure_id: { type: "string" },
          pax: { type: "integer" },
          force_live_check: { type: "boolean" }
        },
        required: ["tour_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_latest_price",
      description: "ดึงราคาล่าสุดของทัวร์",
      parameters: {
        type: "object",
        properties: {
          tour_id: { type: "string" },
          departure_id: { type: "string" },
          adult: { type: "integer" },
          child: { type: "integer" },
          infant: { type: "integer" },
          currency: { type: "string" }
        },
        required: ["tour_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_booking_link",
      description: "ดึงลิงก์จองจริงของโปรแกรม",
      parameters: {
        type: "object",
        properties: {
          tour_id: { type: "string" },
          departure_id: { type: "string" },
          pax: { type: "integer" }
        },
        required: ["tour_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_lead",
      description: "สร้าง lead ให้ทีมขายติดต่อกลับ",
      parameters: {
        type: "object",
        properties: {
          customer_name: { type: "string" },
          phone: { type: "string" },
          line_id: { type: "string" },
          destination: { type: "string" },
          travel_date: { type: "string" },
          pax: { type: "integer" },
          message: { type: "string" },
          source: { type: "string" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_quotation",
      description: "สร้างใบเสนอราคาเบื้องต้น",
      parameters: {
        type: "object",
        properties: {
          customer_id: { type: "string" },
          tour_id: { type: "string" },
          departure_id: { type: "string" },
          pax: { type: "integer" },
          quoted_price: { type: "number" },
          notes: { type: "string" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_private_group_itinerary",
      description: "สร้างร่างโปรแกรมกรุ๊ปส่วนตัว",
      parameters: {
        type: "object",
        properties: {
          destination: { type: "string" },
          duration_days: { type: "integer" },
          pax: { type: "integer" },
          travel_period: { type: "string" },
          budget_per_person: { type: "number" },
          hotel_level: { type: "string" },
          tour_style: { type: "string" },
          include_airfare: { type: "boolean" },
          meal_requirement: { type: "string" },
          special_request: { type: "string" }
        },
        required: ["destination", "duration_days", "pax"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "estimate_private_group_price",
      description: "คำนวณราคาประมาณการกรุ๊ปส่วนตัว",
      parameters: {
        type: "object",
        properties: {
          destination: { type: "string" },
          duration_days: { type: "integer" },
          pax: { type: "integer" },
          hotel_level: { type: "string" },
          include_airfare: { type: "boolean" },
          travel_period: { type: "string" },
          service_level: { type: "string" }
        },
        required: ["destination", "duration_days", "pax"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "ask_human_support",
      description: "ส่งต่อให้เจ้าหน้าที่เมื่อข้อมูลไม่ชัดเจนหรือเป็นเคสสำคัญ",
      parameters: {
        type: "object",
        properties: {
          reason: { type: "string" },
          customer_message: { type: "string" },
          priority: { type: "string" }
        },
        required: ["reason", "customer_message"]
      }
    }
  }
];
