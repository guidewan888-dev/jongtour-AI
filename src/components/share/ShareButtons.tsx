"use client";
import React, { useState } from "react";
import { Share2, Link2, QrCode, Check, MessageCircle, X } from "lucide-react";

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
  hashtags?: string[];
  price?: string;
  compact?: boolean;
}

const PLATFORMS = [
  { id: "line", label: "LINE", emoji: "💬", color: "#06C755" },
  { id: "facebook", label: "Facebook", emoji: "📘", color: "#1877F2" },
  { id: "twitter", label: "X", emoji: "𝕏", color: "#000" },
  { id: "whatsapp", label: "WhatsApp", emoji: "💬", color: "#25D366" },
  { id: "telegram", label: "Telegram", emoji: "✈️", color: "#26A5E4" },
  { id: "email", label: "Email", emoji: "📧", color: "#EA4335" },
];

function enc(s: string) { return encodeURIComponent(s); }

function getShareUrl(platform: string, url: string, title: string, desc: string, hashtags?: string[]) {
  switch (platform) {
    case "line": return `https://social-plugins.line.me/lineit/share?url=${enc(url)}`;
    case "facebook": return `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`;
    case "twitter": return `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}${hashtags ? `&hashtags=${hashtags.join(",")}` : ""}`;
    case "whatsapp": return `https://wa.me/?text=${enc(title + " " + url)}`;
    case "telegram": return `https://t.me/share/url?url=${enc(url)}&text=${enc(title)}`;
    case "email": return `mailto:?subject=${enc(title)}&body=${enc(desc + "\n\n" + url)}`;
    default: return url;
  }
}

function trackShare(platform: string, url: string) {
  try {
    fetch("/api/analytics/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform, url, ts: Date.now() }),
    });
    // GA4
    if (typeof window !== "undefined" && (window as any).dataLayer) {
      (window as any).dataLayer.push({ event: "share", method: platform, content_type: "page", item_id: url });
    }
  } catch {}
}

export default function ShareButtons({ url, title, description = "", image, hashtags, price, compact = false }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    trackShare("copy", url);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url });
        trackShare("native", url);
      } catch {}
    }
  };

  const handlePlatformShare = (platform: string) => {
    const shareUrl = getShareUrl(platform, url, title, description, hashtags);
    window.open(shareUrl, "_blank", "width=600,height=600");
    trackShare(platform, url);
  };

  const primaryPlatforms = PLATFORMS.slice(0, compact ? 2 : 4);
  const morePlatforms = PLATFORMS.slice(compact ? 2 : 4);

  return (
    <div className="relative">
      <div className="flex items-center gap-2 flex-wrap">
        {/* LINE — Primary for Thai market */}
        <button
          onClick={() => handlePlatformShare("line")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-white text-sm font-bold transition-all hover:scale-105 active:scale-95"
          style={{ background: "#06C755" }}
        >
          💬 {!compact && "LINE"}
        </button>

        {/* Facebook */}
        <button
          onClick={() => handlePlatformShare("facebook")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-white text-sm font-bold transition-all hover:scale-105 active:scale-95"
          style={{ background: "#1877F2" }}
        >
          📘 {!compact && "Facebook"}
        </button>

        {/* Native Web Share (Mobile) */}
        {typeof navigator !== "undefined" && "share" in navigator && (
          <button
            onClick={handleNativeShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-bold transition-all hover:bg-slate-200 hover:scale-105"
          >
            <Share2 className="w-4 h-4" /> แชร์
          </button>
        )}

        {/* Copy Link */}
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-bold transition-all hover:scale-105 ${
            copied ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          {copied ? <><Check className="w-4 h-4" /> คัดลอกแล้ว!</> : <><Link2 className="w-4 h-4" /> คัดลอก</>}
        </button>

        {/* More platforms */}
        {morePlatforms.length > 0 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-1 px-3 py-2 rounded-full bg-slate-100 text-slate-500 text-sm hover:bg-slate-200 transition-all"
          >
            ••• {!compact && "เพิ่มเติม"}
          </button>
        )}
      </div>

      {/* More platforms dropdown */}
      {showAll && (
        <div className="absolute top-12 left-0 g-dropdown w-52 p-2 animate-slide-down z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 mb-1">
            <span className="text-xs font-bold text-slate-500">แชร์ผ่าน</span>
            <button onClick={() => setShowAll(false)}><X className="w-3.5 h-3.5 text-slate-400" /></button>
          </div>
          {morePlatforms.map(p => (
            <button
              key={p.id}
              onClick={() => { handlePlatformShare(p.id); setShowAll(false); }}
              className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-primary/5 transition-colors"
            >
              <span className="text-lg">{p.emoji}</span>
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
