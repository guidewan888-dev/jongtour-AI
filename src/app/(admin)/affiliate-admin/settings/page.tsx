import React from "react";
import { Settings } from "lucide-react";

export default function AffiliateSettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div><h1 className="text-2xl font-bold text-slate-900">⚙️ Affiliate Settings</h1><p className="text-sm text-slate-500 mt-1">ตั้งค่าระบบ Affiliate ทั้งหมด</p></div>
      <div className="g-card p-5 space-y-4">
        <h3 className="font-bold text-sm">💰 Global Default Rates (Fallback)</h3>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="text-xs text-slate-500">Tour Commission %</label><input className="g-input mt-1 w-full" defaultValue="8"/></div>
          <div><label className="text-xs text-slate-500">Visa Commission %</label><input className="g-input mt-1 w-full" defaultValue="5"/></div>
          <div><label className="text-xs text-slate-500">Private Tour %</label><input className="g-input mt-1 w-full" defaultValue="10"/></div>
        </div>
      </div>
      <div className="g-card p-5 space-y-4">
        <h3 className="font-bold text-sm">🍪 Cookie & Attribution</h3>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-slate-500">Cookie Duration (วัน)</label><input type="number" className="g-input mt-1 w-full" defaultValue="30"/></div>
          <div><label className="text-xs text-slate-500">Attribution Model</label><select className="g-input mt-1 w-full"><option>Last Click</option><option>First Click</option><option>Linear</option></select></div>
        </div>
      </div>
      <div className="g-card p-5 space-y-3">
        <h3 className="font-bold text-sm">📋 Approval Workflow</h3>
        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" className="rounded" defaultChecked/> Commission ต้อง manual approve ก่อนจ่าย</label>
          <label className="flex items-center gap-2"><input type="checkbox" className="rounded" defaultChecked/> KYC ต้อง approve ก่อน activate</label>
          <label className="flex items-center gap-2"><input type="checkbox" className="rounded"/> Auto-approve commission &lt;฿5,000</label>
          <label className="flex items-center gap-2"><input type="checkbox" className="rounded" defaultChecked/> Holding period 14 วัน (refund protection)</label>
        </div>
      </div>
      <div className="g-card p-5 space-y-3">
        <h3 className="font-bold text-sm">🏦 Payout Settings</h3>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-slate-500">Min Payout</label><input className="g-input mt-1 w-full" defaultValue="1000"/></div>
          <div><label className="text-xs text-slate-500">Payout Schedule</label><select className="g-input mt-1 w-full"><option>Monthly (ทุกวันที่ 15)</option><option>Bi-weekly</option><option>Weekly</option></select></div>
          <div><label className="text-xs text-slate-500">WHT Rate %</label><input className="g-input mt-1 w-full" defaultValue="3"/></div>
          <div><label className="text-xs text-slate-500">AML Threshold (annual)</label><input className="g-input mt-1 w-full" defaultValue="2000000"/></div>
        </div>
      </div>
      <button className="btn-primary">บันทึกการตั้งค่า</button>
    </div>
  );
}
