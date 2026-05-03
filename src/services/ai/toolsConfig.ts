import OpenAI from 'openai';

export const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "search_tours",
      description: "ค้นหาทัวร์จากฐานข้อมูล โดยต้องรองรับ supplier_id filter",
      parameters: {
        type: "object",
        properties: {
          destination: { type: "string" },
          date_from: { type: "string", format: "date" },
          date_to: { type: "string", format: "date" },
          pax: { type: "integer" },
          budget_min: { type: "number" },
          budget_max: { type: "number" },
          supplier_id: { type: "string", description: "รหัส Supplier ที่ต้องการ filter แบบ strict" },
          limit: { type: "integer", default: 10 }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_tour_detail",
      description: "Get deep details of a specific tour (itinerary, highlights, meals). Use when user asks about a specific program.",
      parameters: {
        type: "object",
        properties: {
          tourCode: { type: "string", description: "The exact tour code (e.g., 'ZGHGK')" }
        },
        required: ["tourCode"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "check_availability",
      description: "Check departure dates, available seats, and exact prices. Use when user asks 'When can I travel?' or 'Are there seats?'",
      parameters: {
        type: "object",
        properties: {
          tourCode: { type: "string", description: "The exact tour code" }
        },
        required: ["tourCode"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_booking_link",
      description: "Generate a booking URL for the user to checkout. Use only when user wants to book.",
      parameters: {
        type: "object",
        properties: {
          tourCode: { type: "string", description: "The tour code" },
          departureId: { type: "string", description: "The ID of the specific departure date the user chose" }
        },
        required: ["tourCode", "departureId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_departure_dates",
      description: "Get all available departure dates for a tour.",
      parameters: {
        type: "object",
        properties: { tourCode: { type: "string" } },
        required: ["tourCode"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_price",
      description: "Get pricing details for a tour.",
      parameters: {
        type: "object",
        properties: { tourCode: { type: "string" } },
        required: ["tourCode"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "compare_tours",
      description: "Compare multiple tours based on their codes.",
      parameters: {
        type: "object",
        properties: { tourCodes: { type: "array", items: { type: "string" } } },
        required: ["tourCodes"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "ask_human_support",
      description: "Forward the request to human support when AI cannot fulfill it.",
      parameters: {
        type: "object",
        properties: { reason: { type: "string" } },
        required: ["reason"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_supplier_by_alias",
      description: "ค้นหา Supplier จากชื่อหรือ alias ที่ลูกค้าพิมพ์",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "ชื่อ Supplier ที่ลูกค้าพิมพ์ เช่น Let's Go, Let' go, เล็ทโก"
          }
        },
        required: ["name"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "validate_supplier_results",
      description: "ตรวจสอบว่าผลลัพธ์ทั้งหมดเป็นของ Supplier ที่ลูกค้าระบุจริงหรือไม่",
      parameters: {
        type: "object",
        properties: {
          requested_supplier_id: { type: "string" },
          tour_results: { type: "array", items: { type: "object" } }
        },
        required: ["requested_supplier_id", "tour_results"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_crawl_coverage_report",
      description: "Generate a Crawl Coverage Report showing database ingestion stats.",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  },
  {
    type: "function",
    function: {
      name: "calculate_fit_price",
      description: "Calculate exact pricing and generate a custom private tour itinerary (F.I.T / กรุ๊ปเหมา / จัดทริป). Use ONLY when user explicitly wants a private or customized trip.",
      parameters: {
        type: "object",
        properties: {
          country: { type: "string", description: "Target country (e.g. 'ญี่ปุ่น')" },
          pax: { type: "number", description: "Number of travelers" },
          durationDays: { type: "number", description: "Duration in days" }
        },
        required: ["country", "pax", "durationDays"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_user_preferences",
      description: "AI CRM: บันทึกหรืออัปเดตความชอบ/ความสนใจของลูกค้า (เช่น ปลายทางที่ชอบ, งบประมาณ, จำนวนคนเดินทาง) เพื่อให้ AI จำได้ในการคุยครั้งถัดไป ให้เรียกใช้เมื่อลูกค้าให้ข้อมูลใหม่ที่น่าจะเป็นประโยชน์",
      parameters: {
        type: "object",
        properties: {
          key: { type: "string", description: "The preference key (e.g., 'favorite_destination', 'budget', 'pax', 'special_request')" },
          value: { type: "string", description: "The preference value (e.g., 'ญี่ปุ่น', '20000', '2', 'ไม่เอาทัวร์ลงร้านยา')" }
        },
        required: ["key", "value"]
      }
    }
  }
];
