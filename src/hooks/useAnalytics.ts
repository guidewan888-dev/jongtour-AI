"use client";

/**
 * Analytics hook — Unified event dispatch to dataLayer (GTM picks up)
 * Supports GA4, Meta Pixel, LINE Tag, TikTok Pixel events
 */

declare global {
  interface Window {
    dataLayer: Record<string, any>[];
    fbq: (...args: any[]) => void;
    _lt: (...args: any[]) => void;
    ttq: { track: (...args: any[]) => void; page: () => void };
    twq: (...args: any[]) => void;
  }
}

type EcommerceItem = {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_category2?: string;
  price: number;
  quantity?: number;
};

// ─── DataLayer Push (GTM) ────────────────────────
function push(data: Record<string, any>) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(data);
}

// ─── Ecommerce Events (GA4 Standard) ────────────
export const analytics = {
  /** Tour detail viewed */
  viewItem(item: EcommerceItem) {
    push({
      event: "view_item",
      ecommerce: { currency: "THB", value: item.price, items: [{ ...item, quantity: 1 }] },
    });
    // Meta Pixel
    if (window.fbq) window.fbq("track", "ViewContent", {
      content_ids: [item.item_id], content_name: item.item_name,
      content_type: "product", value: item.price, currency: "THB",
    });
    // TikTok
    if (window.ttq) window.ttq.track("ViewContent", {
      content_id: item.item_id, content_name: item.item_name,
      content_type: "product", value: item.price, currency: "THB",
    });
  },

  /** Start booking */
  addToCart(items: EcommerceItem[], value: number) {
    push({ event: "add_to_cart", ecommerce: { currency: "THB", value, items } });
    if (window.fbq) window.fbq("track", "AddToCart", {
      content_ids: items.map(i => i.item_id), content_type: "product", value, currency: "THB",
    });
    if (window.ttq) window.ttq.track("AddToCart", {
      content_id: items[0]?.item_id, value, currency: "THB",
    });
  },

  /** Begin checkout */
  beginCheckout(items: EcommerceItem[], value: number) {
    push({ event: "begin_checkout", ecommerce: { currency: "THB", value, items } });
    if (window.fbq) window.fbq("track", "InitiateCheckout", {
      content_ids: items.map(i => i.item_id), num_items: items.length, value, currency: "THB",
    });
  },

  /** Add payment info */
  addPaymentInfo(paymentType: string, value: number) {
    push({ event: "add_payment_info", ecommerce: { currency: "THB", value, payment_type: paymentType } });
  },

  /** Purchase complete (MOST IMPORTANT) */
  purchase(transactionId: string, value: number, items: EcommerceItem[], coupon?: string) {
    push({
      event: "purchase",
      ecommerce: { transaction_id: transactionId, value, currency: "THB", coupon, items },
    });
    if (window.fbq) window.fbq("track", "Purchase", {
      content_ids: items.map(i => i.item_id), content_type: "product",
      value, currency: "THB", num_items: items.length,
    });
    if (window._lt) window._lt("send", "cv", [process.env.NEXT_PUBLIC_LINE_TAG_ID || "", "Conversion"], {
      value, currency: "THB", transaction_id: transactionId,
    });
    if (window.ttq) window.ttq.track("CompletePayment", {
      content_id: items[0]?.item_id, value, currency: "THB", order_id: transactionId,
    });
  },

  /** Search */
  search(query: string) {
    push({ event: "search", search_term: query });
    if (window.fbq) window.fbq("track", "Search", { search_string: query });
  },

  /** Share */
  share(method: string, contentType: string, itemId: string) {
    push({ event: "share", method, content_type: contentType, item_id: itemId });
  },

  /** Visa application */
  visaSubmit(country: string, tier: string, value: number) {
    push({ event: "visa_application_submitted", visa_country: country, visa_tier: tier, value });
    if (window.fbq) window.fbq("trackCustom", "VisaApplicationStart", { visa_country: country, tier });
  },

  /** AI Chat */
  aiChatStarted() { push({ event: "ai_chat_started" }); },
  aiChatHandoff() { push({ event: "ai_chat_handoff_to_human" }); },

  /** Sign up / Login */
  signUp(method: string) {
    push({ event: "sign_up", method });
    if (window.fbq) window.fbq("track", "CompleteRegistration", { method });
  },
  login(method: string) { push({ event: "login", method }); },

  /** Lead */
  lead(source: string) {
    push({ event: "generate_lead", source });
    if (window.fbq) window.fbq("track", "Lead", { value: 0, currency: "THB" });
  },

  /** Group trip */
  groupTripCreated(members: number, destination: string) {
    push({ event: "group_trip_created", members_count: members, destination });
    if (window.fbq) window.fbq("trackCustom", "GroupTripCreated", { members, destination });
  },
};
