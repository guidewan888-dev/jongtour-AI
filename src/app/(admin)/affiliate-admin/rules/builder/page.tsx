import React from "react";
import Link from "next/link";

export default function RulesBuilderPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div><div className="text-sm text-slate-400 mb-1"><Link href="/affiliate-admin/rules" className="hover:text-primary">← Rules</Link></div><h1 className="text-xl font-bold text-slate-900">🏗️ Rules Builder</h1></div>
      <div className="g-card p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-xs text-slate-500 font-bold">Rule Name *</label><input className="g-input mt-1 w-full" placeholder="เช่น Songkran Asia Boost"/></div>
          <div><label className="text-xs text-slate-500 font-bold">Priority Level *</label><select className="g-input mt-1 w-full"><option>P1 — Per-Affiliate Override</option><option>P2 — Campaign Override</option><option>P3 — Per-Product Rate</option><option>P4 — Tier Bonus</option><option>P5 — Affiliate Type Default</option><option>P6 — System Global Default</option></select></div>
        </div>
      </div>
      <div className="g-card p-5 space-y-4">
        <h3 className="font-bold text-sm text-blue-700">👤 WHO — ใครได้รับ</h3>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-slate-500">Affiliate Type</label><select className="g-input mt-1 w-full"><option>ทุกประเภท</option><option>Agent B2B</option><option>Affiliate Link</option><option>Influencer</option><option>Pro-staff</option><option>Sub-agent</option></select></div>
          <div><label className="text-xs text-slate-500">Tier</label><select className="g-input mt-1 w-full"><option>ทุก Tier</option><option>Bronze</option><option>Silver</option><option>Gold</option><option>Platinum</option></select></div>
          <div className="col-span-2"><label className="text-xs text-slate-500">เฉพาะ Affiliate (ถ้าเลือก)</label><input className="g-input mt-1 w-full" placeholder="ค้นหา affiliate..."/></div>
        </div>
      </div>
      <div className="g-card p-5 space-y-4">
        <h3 className="font-bold text-sm text-purple-700">📦 WHAT — สินค้าอะไร</h3>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-slate-500">Product Type</label><select className="g-input mt-1 w-full"><option>ทุกสินค้า</option><option>Tour</option><option>Visa</option><option>Private Group Tour</option></select></div>
          <div><label className="text-xs text-slate-500">Product Category</label><select className="g-input mt-1 w-full"><option>ทุก Category</option><option>Asia</option><option>Europe</option><option>Japan</option><option>Schengen</option></select></div>
          <div className="col-span-2"><label className="text-xs text-slate-500">เฉพาะ Product (ถ้าเลือก)</label><input className="g-input mt-1 w-full" placeholder="ค้นหา tour/visa..."/></div>
        </div>
      </div>
      <div className="g-card p-5 space-y-4">
        <h3 className="font-bold text-sm text-emerald-700">💰 HOW — คิดยังไง</h3>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="text-xs text-slate-500">Rate Type</label><select className="g-input mt-1 w-full"><option>% คงที่</option><option>Flat amount</option><option>Tiered ตามจำนวน</option><option>Tiered ตามรายได้</option><option>Hybrid (% + flat)</option></select></div>
          <div><label className="text-xs text-slate-500">Rate Value</label><input className="g-input mt-1 w-full" placeholder="เช่น 15 หรือ 500"/></div>
          <div><label className="text-xs text-slate-500">Mode</label><select className="g-input mt-1 w-full"><option>Replace (แทนที่)</option><option>Add (+bonus)</option></select></div>
          <div><label className="text-xs text-slate-500">Min/booking</label><input className="g-input mt-1 w-full" placeholder="฿100"/></div>
          <div><label className="text-xs text-slate-500">Max/booking (Cap)</label><input className="g-input mt-1 w-full" placeholder="฿20,000"/></div>
          <div><label className="text-xs text-slate-500">Cap/เดือน</label><input className="g-input mt-1 w-full" placeholder="ไม่จำกัด"/></div>
        </div>
      </div>
      <div className="g-card p-5 space-y-4">
        <h3 className="font-bold text-sm text-amber-700">📅 WHEN — ช่วงเวลา</h3>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-slate-500">วันเริ่ม</label><input type="date" className="g-input mt-1 w-full"/></div>
          <div><label className="text-xs text-slate-500">วันสิ้นสุด (ว่าง = ไม่สิ้นสุด)</label><input type="date" className="g-input mt-1 w-full"/></div>
        </div>
      </div>
      <div className="g-card p-5 space-y-4">
        <h3 className="font-bold text-sm text-pink-700">🎯 BONUS — เงื่อนไขพิเศษ</h3>
        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" className="rounded"/><span>Milestone Bonus: ถ้าขายครบ ___ รายการ ให้ bonus ฿___</span></label>
          <label className="flex items-center gap-2"><input type="checkbox" className="rounded"/><span>Sliding Scale: เพิ่ม +___% ทุก ___ bookings</span></label>
        </div>
      </div>
      <div className="flex gap-2"><button className="btn-primary">💾 Save & Activate</button><button className="btn-outline">Save as Draft</button><Link href="/affiliate-admin/rules/calculator" className="btn-outline">🧮 Test Calculator</Link></div>
    </div>
  );
}
