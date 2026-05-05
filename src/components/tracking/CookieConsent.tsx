"use client";
import React, { useState, useEffect } from "react";
import { Shield, X } from "lucide-react";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("jt_cookie_consent");
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("jt_cookie_consent", "granted");
    setVisible(false);

    // Enable all tracking
    if (typeof window !== "undefined" && (window as any).dataLayer) {
      (window as any).dataLayer.push({ event: "consent_granted" });
    }
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("consent", "update", {
        ad_storage: "granted",
        analytics_storage: "granted",
        functionality_storage: "granted",
        personalization_storage: "granted",
      });
    }
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("consent", "grant");
    }
  };

  const handleDecline = () => {
    localStorage.setItem("jt_cookie_consent", "denied");
    setVisible(false);

    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("consent", "update", {
        ad_storage: "denied",
        analytics_storage: "denied",
      });
    }
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("consent", "revoke");
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 animate-slide-up">
      <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Shield className="w-6 h-6 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-slate-700">
              เราใช้คุกกี้เพื่อปรับปรุงประสบการณ์การใช้งาน วิเคราะห์ข้อมูลผู้เข้าชม และแสดงโฆษณาที่ตรงกลุ่มเป้าหมาย
            </p>
            <a href="/privacy-policy" className="text-xs text-primary font-bold hover:underline mt-1 inline-block">
              นโยบายความเป็นส่วนตัว →
            </a>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm font-medium text-slate-500 rounded-lg hover:bg-slate-100 transition-colors"
          >
            ปฏิเสธ
          </button>
          <button
            onClick={handleAccept}
            className="px-5 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
          >
            ยอมรับทั้งหมด
          </button>
        </div>
      </div>
    </div>
  );
}
