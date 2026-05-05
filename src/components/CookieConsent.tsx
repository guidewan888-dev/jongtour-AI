"use client";
import { useState, useEffect } from "react";

const COOKIE_KEY = "jt_consent";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = (level: "all" | "essential") => {
    localStorage.setItem(COOKIE_KEY, JSON.stringify({ level, ts: Date.now() }));
    setShow(false);

    // Enable/disable tracking based on consent
    if (level === "all" && typeof window !== "undefined") {
      (window as any).dataLayer?.push({ event: "consent_granted" });
    }
  };

  if (!show) return null;

  return (
    <div className="cookie-banner">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium">🍪 เว็บไซต์นี้ใช้คุกกี้</p>
          <p className="text-xs text-gray-300 mt-1">
            เราใช้คุกกี้เพื่อพัฒนาประสบการณ์การใช้งาน วิเคราะห์การเข้าชม และแสดงโฆษณาที่ตรงใจ
            ตาม <a href="/privacy-policy" className="underline hover:text-white">นโยบายความเป็นส่วนตัว</a> และ พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => accept("essential")}
            className="px-4 py-2 text-xs font-medium text-gray-300 border border-gray-500 rounded-lg hover:bg-gray-700 transition-colors"
          >
            เฉพาะที่จำเป็น
          </button>
          <button
            onClick={() => accept("all")}
            className="px-4 py-2 text-xs font-bold bg-[#F97316] text-white rounded-lg hover:bg-[#EA580C] transition-colors"
          >
            ยอมรับทั้งหมด
          </button>
        </div>
      </div>
    </div>
  );
}
