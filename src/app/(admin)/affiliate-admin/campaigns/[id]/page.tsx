import React from "react";
import Link from "next/link";

export default function CampaignDetailPage({ params }:{ params:{ id:string } }) {
  return (
    <div className="space-y-6 max-w-3xl">
      <div><div className="text-sm text-slate-400 mb-1"><Link href="/affiliate-admin/campaigns" className="hover:text-primary">← Campaigns</Link></div><h1 className="text-xl font-bold text-slate-900">🎪 Songkran Asia Boost <span className="text-sm text-slate-400">({params.id})</span></h1></div>
      <div className="g-card p-5 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-slate-500">ชื่อ Campaign</label><input className="g-input mt-1 w-full" defaultValue="Songkran Asia Boost"/></div>
          <div><label className="text-xs text-slate-500">Status</label><select className="g-input mt-1 w-full"><option>Active</option><option>Scheduled</option><option>Paused</option><option>Ended</option></select></div>
          <div><label className="text-xs text-slate-500">วันเริ่ม</label><input type="date" className="g-input mt-1 w-full"/></div>
          <div><label className="text-xs text-slate-500">วันสิ้นสุด</label><input type="date" className="g-input mt-1 w-full"/></div>
          <div><label className="text-xs text-slate-500">Bonus Rate</label><input className="g-input mt-1 w-full" defaultValue="+3%"/></div>
          <div><label className="text-xs text-slate-500">Rate Mode</label><select className="g-input mt-1 w-full"><option>Add (+bonus)</option><option>Replace</option></select></div>
          <div><label className="text-xs text-slate-500">Product Scope</label><select className="g-input mt-1 w-full"><option>ทัวร์เอเชีย</option><option>ทุกสินค้า</option><option>ทัวร์ยุโรป</option></select></div>
          <div><label className="text-xs text-slate-500">Affiliate Scope</label><select className="g-input mt-1 w-full"><option>ทุก Affiliate</option><option>เฉพาะ Influencer</option><option>เฉพาะ Gold+</option></select></div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">{[{l:"Revenue",v:"฿1.2M"},{l:"Commission",v:"฿48K"},{l:"Bookings",v:"42"}].map(s=>(<div key={s.l} className="g-card p-4 text-center"><div className="text-xl font-bold text-primary">{s.v}</div><div className="text-xs text-slate-500">{s.l}</div></div>))}</div>
      <div className="flex gap-2"><button className="btn-primary">บันทึก</button><button className="btn-outline">ยกเลิก</button></div>
    </div>
  );
}
