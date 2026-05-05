"use client";
import React, { useState } from "react";
import { Link2, Copy, Check, Trash2, Plus, ExternalLink, BarChart3 } from "lucide-react";

type ShortLink = {
  id: string; shortcode: string; destination: string;
  utm_source?: string; utm_campaign?: string;
  clicks: number; created: string;
};

const mockLinks: ShortLink[] = [
  { id: "1", shortcode: "hokkaido-spring", destination: "https://jongtour.com/tour/hokkaido-5d4n-premium", utm_source: "facebook", utm_campaign: "hokkaido_q1_2026", clicks: 1247, created: "3 วัน" },
  { id: "2", shortcode: "japan-deal", destination: "https://jongtour.com/deals/flash-sale", utm_source: "line", utm_campaign: "flash_sale_jan", clicks: 856, created: "1 สัปดาห์" },
  { id: "3", shortcode: "visa-usa", destination: "https://jongtour.com/visa/usa", utm_source: "google", utm_campaign: "visa_q1", clicks: 432, created: "2 สัปดาห์" },
  { id: "4", shortcode: "nook-ref", destination: "https://jongtour.com/search?ref=NOOK25", utm_source: "instagram", utm_campaign: "influencer_nook", clicks: 2103, created: "1 เดือน" },
];

export default function ShortLinksPage() {
  const [links] = useState(mockLinks);
  const [copied, setCopied] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const domain = "jt.lol";

  const handleCopy = async (shortcode: string) => {
    await navigator.clipboard.writeText(`https://${domain}/${shortcode}`);
    setCopied(shortcode);
    setTimeout(() => setCopied(null), 2000);
  };

  const totalClicks = links.reduce((s, l) => s + l.clicks, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🔗 Short Links</h1>
          <p className="text-sm text-slate-500 mt-1">{links.length} ลิงก์ · {totalClicks.toLocaleString()} clicks ทั้งหมด</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" /> สร้างลิงก์ใหม่
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-primary/5 p-4 rounded-2xl text-center">
          <div className="text-2xl font-black text-primary">{links.length}</div>
          <div className="text-xs text-primary/70">Active Links</div>
        </div>
        <div className="bg-emerald-50 p-4 rounded-2xl text-center">
          <div className="text-2xl font-black text-emerald-700">{totalClicks.toLocaleString()}</div>
          <div className="text-xs text-emerald-600">Total Clicks</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-2xl text-center">
          <div className="text-2xl font-black text-blue-700">{Math.round(totalClicks / links.length)}</div>
          <div className="text-xs text-blue-600">Avg Clicks/Link</div>
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="g-card p-5 border-2 border-primary/20 space-y-3 animate-slide-down">
          <h3 className="font-bold text-sm">สร้าง Short Link ใหม่</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="g-input" placeholder="Shortcode (e.g. hokkaido-spring)" />
            <input className="g-input" placeholder="Destination URL" />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-hover transition-colors">สร้าง</button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-slate-100 text-slate-500 rounded-lg text-sm hover:bg-slate-200 transition-colors">ยกเลิก</button>
          </div>
        </div>
      )}

      {/* Links table */}
      <div className="space-y-3 stagger-children">
        {links.map((link) => (
          <div key={link.id} className="g-card p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-primary shrink-0" />
                <span className="font-mono text-sm font-bold text-primary">{domain}/{link.shortcode}</span>
                <button onClick={() => handleCopy(link.shortcode)} className="p-1 rounded hover:bg-slate-100 transition-colors">
                  {copied === link.shortcode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                </button>
              </div>
              <div className="text-xs text-slate-400 mt-1 truncate flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                {link.destination}
              </div>
              <div className="flex gap-2 mt-1.5">
                {link.utm_source && (
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold">{link.utm_source}</span>
                )}
                {link.utm_campaign && (
                  <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-[10px] font-bold">{link.utm_campaign}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm font-bold text-slate-700">
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
                  {link.clicks.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400">{link.created}ที่แล้ว</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
