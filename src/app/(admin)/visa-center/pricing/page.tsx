import React from "react";
import { DollarSign, Edit, Plus, Tag } from "lucide-react";

const tiers = ["PLUS","ADVANCE","EXCLUSIVE","VIP"];
const countries = [
  { flag:"🇯🇵", name:"ญี่ปุ่น", plus:1500, adv:3000, excl:5500, vip:10000 },
  { flag:"🇨🇳", name:"จีน", plus:2000, adv:4000, excl:6500, vip:12000 },
  { flag:"🇪🇺", name:"เชงเก้น", plus:3500, adv:5500, excl:8500, vip:15000 },
  { flag:"🇬🇧", name:"อังกฤษ", plus:4000, adv:6000, excl:9000, vip:16000 },
  { flag:"🇺🇸", name:"อเมริกา", plus:5500, adv:8000, excl:12000, vip:20000 },
  { flag:"🇦🇺", name:"ออสเตรเลีย", plus:3500, adv:5500, excl:8500, vip:15000 },
  { flag:"🇨🇦", name:"แคนาดา", plus:4500, adv:7000, excl:10000, vip:18000 },
];
const addons = [
  { name:"แปลเอกสาร", price:800, unit:"ฉบับ" }, { name:"ตั๋ว Dummy", price:500, unit:"คน" },
  { name:"โรงแรม Dummy", price:300, unit:"คืน" }, { name:"ประกันเดินทาง", price:1200, unit:"คน" },
  { name:"Cover Letter", price:1500, unit:"ฉบับ" }, { name:"Itinerary", price:1000, unit:"ฉบับ" },
];
const tabs = ["Tier Matrix", "Add-ons", "Bundles", "Promotions"];

export default function VisaPricingAdmin() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-slate-900">💰 Pricing Center</h1><p className="text-sm text-slate-500 mt-1">จัดการราคาวีซ่า Tier, Add-ons, Bundles, โปรโมชั่น</p></div><button className="btn-primary text-sm">+ เพิ่มราคา</button></div>
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">{tabs.map(t=>(<button key={t} className="px-4 py-1.5 rounded-lg text-sm font-medium bg-white text-slate-900 shadow-sm">{t}</button>))}</div>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm"><thead className="bg-slate-50 border-b"><tr><th className="text-left px-4 py-3">ประเทศ</th>{tiers.map(t=><th key={t} className="px-3 py-3 text-center">{t}</th>)}<th className="px-3 py-3"></th></tr></thead>
          <tbody className="divide-y divide-slate-50">{countries.map(c=>(<tr key={c.name} className="hover:bg-slate-50"><td className="px-4 py-3 font-medium">{c.flag} {c.name}</td><td className="px-3 py-3 text-center">฿{c.plus.toLocaleString()}</td><td className="px-3 py-3 text-center text-blue-600">฿{c.adv.toLocaleString()}</td><td className="px-3 py-3 text-center font-bold text-primary">฿{c.excl.toLocaleString()}</td><td className="px-3 py-3 text-center text-amber-600">฿{c.vip.toLocaleString()}</td><td className="px-3 py-3"><button className="text-primary text-xs font-bold hover:underline flex items-center gap-1"><Edit className="w-3 h-3"/>แก้ไข</button></td></tr>))}</tbody>
        </table>
      </div>
      <div><h3 className="font-bold text-sm mb-3">🔧 Add-ons</h3><div className="grid grid-cols-2 md:grid-cols-3 gap-3">{addons.map(a=>(<div key={a.name} className="g-card p-4 flex items-center justify-between"><div><div className="font-medium text-sm">{a.name}</div><div className="text-xs text-slate-400">/{a.unit}</div></div><div className="text-lg font-bold text-primary">฿{a.price.toLocaleString()}</div></div>))}</div></div>
    </div>
  );
}
