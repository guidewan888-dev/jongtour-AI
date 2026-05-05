import { z } from 'zod';

export const aiToolsRegistry = {
  resolve_supplier_alias: {
    description: "Resolves a user-provided supplier name (e.g., 'เลทโก', 'เช็คอิน') to a strict supplier_id. MUST be called first if a user asks for a specific supplier.",
    parameters: z.object({
      aliasQuery: z.string().describe("The name of the supplier the user is asking about."),
    }),
  },
  search_tours: {
    description: "Searches the database for real, published tours based on criteria. NEVER returns mock data.",
    parameters: z.object({
      destination: z.string().optional().describe("Country, region, or city name."),
      supplier_id: z.string().optional().describe("Strict supplier ID obtained from resolve_supplier_alias."),
      budget_max: z.number().optional().describe("Maximum budget in THB."),
    }),
  },
  get_tour_detail: {
    description: "Gets the full itinerary and details for a specific tour.",
    parameters: z.object({
      tour_id: z.string().describe("The strict database ID of the tour."),
    }),
  },
  get_departure_dates: {
    description: "Gets real departure dates for a specific tour. DO NOT GUESS DATES.",
    parameters: z.object({
      tour_id: z.string().describe("The strict database ID of the tour."),
      month_target: z.string().optional().describe("Format YYYY-MM if specific month is requested."),
    }),
  },
  check_availability: {
    description: "Checks real-time available seats for a specific departure. DO NOT GUESS SEATS.",
    parameters: z.object({
      departure_id: z.string().describe("The strict database ID of the departure."),
    }),
  },
  get_latest_price: {
    description: "Gets the lowest active price for a tour or departure. DO NOT GUESS PRICES.",
    parameters: z.object({
      tour_id: z.string().optional(),
      departure_id: z.string().optional(),
    }),
  },
  get_booking_link: {
    description: "Generates the official booking.jongtour.com link. DO NOT MAKE UP URLS.",
    parameters: z.object({
      tour_id: z.string(),
      departure_id: z.string(),
    }),
  },
  compare_tours: {
    description: "Compares up to 3 tours based on actual database attributes.",
    parameters: z.object({
      tour_ids: z.array(z.string()).max(3).describe("Array of exactly 2 or 3 tour IDs to compare."),
    }),
  },
  create_lead: {
    description: "Creates a CRM lead if the customer is interested but not ready to book.",
    parameters: z.object({
      name: z.string(),
      contact_info: z.string(),
      interest_notes: z.string(),
    }),
  },
  create_quotation: {
    description: "Generates a formal quotation request for the sales team.",
    parameters: z.object({
      tour_id: z.string(),
      pax_count: z.number(),
      customer_email: z.string().email(),
    }),
  },
  create_private_group_itinerary: {
    description: "Generates an F.I.T. or private group itinerary strictly using internal services.",
    parameters: z.object({
      destination: z.string(),
      days: z.number(),
      pax: z.number(),
    }),
  },
  estimate_private_group_price: {
    description: "Estimates private group cost using real API logic (Flights + Hotels). NO GUESSING.",
    parameters: z.object({
      itinerary_id: z.string(),
      pax: z.number(),
    }),
  },
  ask_human_support: {
    description: "Fallback tool if the AI encounters an error, cannot find data, or the user asks something unanswerable.",
    parameters: z.object({
      reason: z.string().describe("Why the AI needs human intervention."),
      urgency: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    }),
  }
};
