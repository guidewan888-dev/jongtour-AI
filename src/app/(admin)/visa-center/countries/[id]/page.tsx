import React from "react";
import Link from "next/link";

const tabs = ["ข้อมูลทั่วไป","ประเภทวีซ่า","เอกสาร","ราคา Tier","สถานทูต","FAQ","SEO","ประวัติ"];

export default function VisaCountryEditPage({ params }:{ params:{ id:string } }) {
  return (
    <div className="space-y-6">
      <div><div className="text-sm text-slate-400 mb-1"><Link href="/visa-center/countries" className="hover:text-primary">← Country CMS</Link></div><h1 className="text-xl font-bold text-slate-900">✏️ แก้ไข: {params.id}</h1></div>
      <div className="flex gap-1 overflow-x-auto">{tabs.map(t=>(<button key={t} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 shrink-0">{t}</button>))}</div>
      <div className="g-card p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-xs text-slate-500">ชื่อ (TH)</label><input className="g-input mt-1 w-full" defaultValue={params.id} /></div>
          <div><label className="text-xs text-slate-500">ชื่อ (EN)</label><input className="g-input mt-1 w-full" /></div>
          <div><label className="text-xs text-slate-500">Slug</label><input className="g-input mt-1 w-full" defaultValue={params.id} /></div>
          <div><label className="text-xs text-slate-500">Emoji Flag</label><input className="g-input mt-1 w-full" defaultValue="🌍" /></div>
          <div><label className="text-xs text-slate-500">ภูมิภาค</label><select className="g-input mt-1 w-full"><option>เอเชีย</option><option>ยุโรป/เชงเก้น</option><option>อเมริกา</option><option>ตะวันออกกลาง</option></select></div>
          <div><label className="text-xs text-slate-500">สถานะ</label><select className="g-input mt-1 w-full"><option>เปิดใช้</option><option>ปิด</option></select></div>
        </div>
        <div><label className="text-xs text-slate-500">Free Visa Note</label><input className="g-input mt-1 w-full" placeholder="เช่น คนไทยเข้าฟรี 15 วัน" /></div>
        <div><label className="text-xs text-slate-500">ค่าธรรมเนียมสถานทูต</label><input className="g-input mt-1 w-full" placeholder="เช่น $185" /></div>
        <div><label className="text-xs text-slate-500">Approval Rate (%)</label><input className="g-input mt-1 w-full" placeholder="95" /></div>
        <div className="flex gap-2"><button className="btn-primary">บันทึก</button><button className="btn-outline">ยกเลิก</button></div>
      </div>
    </div>
  );
}
