"use client";
import { useEffect } from "react";

/**
 * useUTMCapture — Captures UTM params + click IDs on entry
 * Stores first-touch (localStorage) and last-touch (sessionStorage)
 * Sets cookie for server-side use
 */
export function useUTMCapture() {
  useEffect(() => {
    try {
      const url = new URL(window.location.href);

      const utmParams = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
      const clickIds = ["gclid", "fbclid", "ttclid", "msclkid", "ref", "src_id", "adv"];

      const captured: Record<string, string> = {};

      [...utmParams, ...clickIds].forEach((param) => {
        const value = url.searchParams.get(param);
        if (value) captured[param] = value;
      });

      if (Object.keys(captured).length > 0) {
        const payload = { ...captured, captured_at: Date.now(), landing_page: window.location.pathname };

        // First-touch (persist 30 days)
        const existing = localStorage.getItem("jt_first_touch");
        if (!existing) {
          localStorage.setItem("jt_first_touch", JSON.stringify(payload));
        }

        // Last-touch (session only)
        sessionStorage.setItem("jt_last_touch", JSON.stringify(payload));

        // Cookie for server-side
        document.cookie = `jt_utm=${encodeURIComponent(JSON.stringify(captured))}; path=/; max-age=2592000; samesite=lax`;

        // Also persist landing page
        if (!sessionStorage.getItem("jt_landing")) {
          sessionStorage.setItem("jt_landing", window.location.href);
        }
      }
    } catch {}
  }, []);
}

/**
 * getAttribution — Returns first/last touch data for booking attribution
 */
export function getAttribution() {
  try {
    return {
      first_touch: JSON.parse(localStorage.getItem("jt_first_touch") || "{}"),
      last_touch: JSON.parse(sessionStorage.getItem("jt_last_touch") || "{}"),
      landing_page: sessionStorage.getItem("jt_landing") || "",
    };
  } catch {
    return { first_touch: {}, last_touch: {}, landing_page: "" };
  }
}
