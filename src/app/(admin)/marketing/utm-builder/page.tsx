"use client";
import React, { useState, useMemo } from "react";
import { Link2, Copy, Check, QrCode, Download, X } from "lucide-react";

const SOURCES = ["facebook", "instagram", "line", "google", "tiktok", "youtube", "twitter", "email", "sms"];
const MEDIUMS = ["cpc", "paid_social", "social", "email", "display", "video", "organic", "referral"];

export default function UTMBuilderPage() {
  const [baseUrl, setBaseUrl] = useState("https://jongtour.com/tour/");
  const [source, setSource] = useState("");
  const [medium, setMedium] = useState("");
  const [campaign, setCampaign] = useState("");
  const [content, setContent] = useState("");
  const [term, setTerm] = useState("");
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const generatedUrl = useMemo(() => {
    const url = new URL(baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`);
    if (source) url.searchParams.set("utm_source", source);
    if (medium) url.searchParams.set("utm_medium", medium);
    if (campaign) url.searchParams.set("utm_campaign", campaign);
    if (content) url.searchParams.set("utm_content", content);
    if (term) url.searchParams.set("utm_term", term);
    return url.toString();
  }, [baseUrl, source, medium, campaign, content, term]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">🔗 UTM Builder</h1>
        <p className="text-sm text-slate-500 mt-1">สร้าง URL + UTM parameters สำหรับ campaign tracking</p>
      </div>

      <div className="g-card p-6 space-y-5">
        {/* Destination URL */}
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Destination URL</label>
          <input
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            className="g-input w-full"
            placeholder="https://jongtour.com/tour/hokkaido-5d4n"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Source */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              Source <span className="text-primary">*</span>
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="g-input w-full"
            >
              <option value="">-- เลือก --</option>
              {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Medium */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              Medium <span className="text-primary">*</span>
            </label>
            <select
              value={medium}
              onChange={(e) => setMedium(e.target.value)}
              className="g-input w-full"
            >
              <option value="">-- เลือก --</option>
              {MEDIUMS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* Campaign */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Campaign Name</label>
            <input
              value={campaign}
              onChange={(e) => setCampaign(e.target.value.toLowerCase().replace(/\s/g, "_"))}
              className="g-input w-full"
              placeholder="hokkaido_q1_2026"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Content (variant)</label>
            <input
              value={content}
              onChange={(e) => setContent(e.target.value.toLowerCase().replace(/\s/g, "_"))}
              className="g-input w-full"
              placeholder="video_15s_a"
            />
          </div>

          {/* Term (paid only) */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Term (paid search only)</label>
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="g-input w-full"
              placeholder="ทัวร์ฮอกไกโด"
            />
          </div>
        </div>
      </div>

      {/* Generated URL */}
      <div className="g-card p-5 bg-slate-50">
        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Generated URL</label>
        <div className="bg-white border border-slate-200 rounded-xl p-3 text-sm text-slate-700 break-all font-mono">
          {generatedUrl}
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              copied
                ? "bg-emerald-100 text-emerald-700"
                : "bg-primary text-white hover:bg-primary-hover"
            }`}
          >
            {copied ? <><Check className="w-4 h-4" /> คัดลอกแล้ว!</> : <><Copy className="w-4 h-4" /> คัดลอก URL</>}
          </button>
          <button
            onClick={() => setShowQR(!showQR)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <QrCode className="w-4 h-4" /> QR Code
          </button>
        </div>
      </div>

      {/* QR Code (simple SVG placeholder) */}
      {showQR && (
        <div className="g-card p-6 text-center">
          <div className="inline-block p-4 bg-white border-2 border-slate-200 rounded-2xl">
            <div className="w-48 h-48 bg-slate-100 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <QrCode className="w-16 h-16 text-primary mx-auto mb-2" />
                <p className="text-xs text-slate-400">QR จะแสดงเมื่อ<br />เชื่อมต่อ qrcode library</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">สแกน QR code เพื่อเปิดลิงก์</p>
        </div>
      )}

      {/* Naming Convention Rules */}
      <div className="g-card p-5">
        <h3 className="font-bold text-sm text-slate-700 mb-3">📝 Naming Convention Rules</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="flex items-start gap-2 p-2 bg-emerald-50 rounded-lg">
            <span className="text-emerald-500 font-bold">✅</span>
            <span className="text-emerald-700">ใช้ lowercase ทั้งหมด</span>
          </div>
          <div className="flex items-start gap-2 p-2 bg-emerald-50 rounded-lg">
            <span className="text-emerald-500 font-bold">✅</span>
            <span className="text-emerald-700">ใช้ underscore (_) คั่นคำ</span>
          </div>
          <div className="flex items-start gap-2 p-2 bg-red-50 rounded-lg">
            <span className="text-red-500 font-bold">❌</span>
            <span className="text-red-700">อย่าใช้ Space หรือ Capital</span>
          </div>
          <div className="flex items-start gap-2 p-2 bg-red-50 rounded-lg">
            <span className="text-red-500 font-bold">❌</span>
            <span className="text-red-700">อย่าใช้ตัวย่อ เช่น fb, ig</span>
          </div>
        </div>
      </div>
    </div>
  );
}
