import React from "react";
import Link from "next/link";

export default function AffiliateNewPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div><div className="text-sm text-slate-400 mb-1"><Link href="/affiliate-admin/affiliates" className="hover:text-primary">← Affiliates</Link></div><h1 className="text-xl font-bold text-slate-900">➕ Onboard Affiliate ใหม่</h1></div>
      <div className="g-card p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-xs text-slate-500 font-medium">ประเภท Affiliate *</label><select className="g-input mt-1 w-full"><option>Influencer</option><option>Agent B2B</option><option>Affiliate Link</option><option>Pro-staff</option><option>Sub-agent</option></select></div>
          <div><label className="text-xs text-slate-500 font-medium">Parent Affiliate (ถ้าเป็น Sub-agent)</label><select className="g-input mt-1 w-full"><option>— ไม่มี —</option><option>AF-002 TravelMore Co.</option></select></div>
          <div><label className="text-xs text-slate-500 font-medium">ชื่อ/ชื่อบริษัท *</label><input className="g-input mt-1 w-full"/></div>
          <div><label className="text-xs text-slate-500 font-medium">Contact Person</label><input className="g-input mt-1 w-full"/></div>
          <div><label className="text-xs text-slate-500 font-medium">Email *</label><input type="email" className="g-input mt-1 w-full"/></div>
          <div><label className="text-xs text-slate-500 font-medium">เบอร์โทร *</label><input className="g-input mt-1 w-full"/></div>
          <div><label className="text-xs text-slate-500 font-medium">Coupon Code</label><input className="g-input mt-1 w-full font-mono" placeholder="AUTO-GENERATE"/></div>
          <div><label className="text-xs text-slate-500 font-medium">Commission Rate (Override)</label><input className="g-input mt-1 w-full" placeholder="ใช้ค่า default ตามประเภท"/></div>
        </div>
        <div><label className="text-xs text-slate-500 font-medium">หมายเหตุ</label><textarea className="g-input mt-1 w-full h-16" placeholder="บันทึกภายใน..."/></div>
        <div className="border-t pt-4 space-y-2">
          <h3 className="font-bold text-sm">📄 KYC Documents</h3>
          <div className="grid grid-cols-2 gap-3">{["บัตรประชาชน/หนังสือเดินทาง","สำเนาบัญชีธนาคาร","ทะเบียนธุรกิจ (ถ้ามี)","หนังสือมอบอำนาจ (ถ้ามี)"].map(d=>(<div key={d}><label className="text-xs text-slate-500">{d}</label><input type="file" className="g-input mt-1 w-full text-xs"/></div>))}</div>
        </div>
        <div className="flex gap-2"><button className="btn-primary">สร้าง Affiliate</button><Link href="/affiliate-admin/affiliates" className="btn-outline">ยกเลิก</Link></div>
      </div>
    </div>
  );
}
