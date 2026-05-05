import React from "react";
import Link from "next/link";
import { User, Shield, BarChart3, DollarSign, Settings, FileText, AlertTriangle } from "lucide-react";

const tabs = ["โปรไฟล์","Commission","Statistics","Overrides","KYC","Activity Log"];

export default function AffiliateDetailPage({ params }:{ params:{ id:string } }) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between"><div><div className="text-sm text-slate-400 mb-1"><Link href="/affiliate-admin/affiliates" className="hover:text-primary">← Affiliates</Link></div><h1 className="text-xl font-bold text-slate-900">👤 JoyTravels <span className="text-sm font-normal text-slate-400">({params.id})</span></h1><div className="flex items-center gap-2 mt-1"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-pink-700">Influencer</span><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">Gold</span><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"/>Active</div></div><div className="flex gap-2"><button className="btn-outline text-sm">Suspend</button><button className="btn-primary text-sm">Save Changes</button></div></div>

      <div className="flex gap-1 overflow-x-auto">{tabs.map(t=>(<button key={t} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 shrink-0">{t}</button>))}</div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="g-card p-5 space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2"><User className="w-4 h-4 text-blue-500"/>ข้อมูลทั่วไป</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-slate-500">ชื่อ/บริษัท</label><input className="g-input mt-1 w-full" defaultValue="JoyTravels"/></div>
              <div><label className="text-xs text-slate-500">ประเภท</label><select className="g-input mt-1 w-full"><option>Influencer</option><option>Agent B2B</option><option>Affiliate Link</option><option>Pro-staff</option><option>Sub-agent</option></select></div>
              <div><label className="text-xs text-slate-500">Email</label><input className="g-input mt-1 w-full" defaultValue="joy@travels.com"/></div>
              <div><label className="text-xs text-slate-500">โทร</label><input className="g-input mt-1 w-full" defaultValue="081-234-5678"/></div>
              <div><label className="text-xs text-slate-500">Coupon Code</label><input className="g-input mt-1 w-full font-mono" defaultValue="JOYTRAVELS"/></div>
              <div><label className="text-xs text-slate-500">Referral Link</label><input className="g-input mt-1 w-full font-mono text-xs" defaultValue="jongtour.com/?ref=joytravels" readOnly/></div>
            </div>
          </div>

          <div className="g-card p-5"><h3 className="font-bold text-sm mb-3 flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary"/>Commission Override</h3>
            <div className="bg-amber-50 p-3 rounded-xl text-sm text-amber-800 mb-3">⚠️ Override จะ override ทุก rule — Priority 1 (สูงสุด)</div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-xs text-slate-500">Tour Rate</label><input className="g-input mt-1 w-full" defaultValue="20%"/></div>
              <div><label className="text-xs text-slate-500">Visa Rate</label><input className="g-input mt-1 w-full" defaultValue="10%"/></div>
              <div><label className="text-xs text-slate-500">Private Tour Rate</label><input className="g-input mt-1 w-full" defaultValue="18%"/></div>
              <div><label className="text-xs text-slate-500">Cap/เดือน</label><input className="g-input mt-1 w-full" placeholder="ไม่จำกัด"/></div>
              <div><label className="text-xs text-slate-500">Min/booking</label><input className="g-input mt-1 w-full" placeholder="฿100"/></div>
              <div><label className="text-xs text-slate-500">Max/booking</label><input className="g-input mt-1 w-full" placeholder="฿20,000"/></div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="g-card p-5"><h3 className="font-bold text-sm mb-3"><BarChart3 className="w-4 h-4 inline text-emerald-500 mr-1"/>Stats</h3>
            <div className="space-y-2 text-sm">{[{l:"Total Revenue",v:"฿480,000"},{l:"Total Commission",v:"฿72,000"},{l:"Bookings",v:"48"},{l:"Avg Booking",v:"฿10,000"},{l:"Conversion Rate",v:"2.1%"},{l:"Active Since",v:"15 ม.ค. 2569"}].map(s=>(<div key={s.l} className="flex justify-between"><span className="text-slate-500">{s.l}</span><span className="font-bold">{s.v}</span></div>))}</div>
          </div>
          <div className="g-card p-5"><h3 className="font-bold text-sm mb-3"><Shield className="w-4 h-4 inline text-blue-500 mr-1"/>KYC Status</h3>
            <div className="space-y-1.5 text-sm">{[{n:"บัตรประชาชน",s:true},{n:"สำเนาบัญชีธนาคาร",s:true},{n:"ทะเบียนธุรกิจ",s:false}].map(d=>(<div key={d.n} className="flex items-center gap-2"><span className={d.s?"text-emerald-500":"text-amber-500"}>{d.s?"✅":"⏳"}</span>{d.n}</div>))}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
