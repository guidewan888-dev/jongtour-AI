import Link from "next/link";

export default function BookingTicketPage() {
  return (<>
    <section className="bg-gradient-to-r from-sky-600 to-cyan-500 text-white py-12"><div className="g-container"><div className="text-3xl mb-2">✈️</div><h1 className="text-3xl font-bold">จองตั๋วเครื่องบิน Dummy</h1><p className="text-sky-100 mt-2">ตั๋วเครื่องบินสำหรับยื่นวีซ่า สามารถยกเลิกได้ ไม่ต้องจ่ายเต็มราคา</p></div></section>
    <section className="g-section bg-white"><div className="g-container-narrow space-y-6">
      <div className="g-card p-6 text-center"><div className="text-3xl font-black text-primary">฿500<span className="text-sm text-slate-400 font-normal">/คน</span></div><p className="text-sm text-slate-500 mt-1">ใช้ได้ทุกสถานทูต · ส่งภายใน 1 ชม.</p></div>
      <div className="g-card p-6"><h3 className="font-bold mb-3">✅ ข้อดี</h3><ul className="space-y-2 text-sm text-slate-600">{["ใบจองจริงจากสายการบิน", "ยกเลิกได้ฟรี หลังได้วีซ่า", "ไม่ต้องจ่ายค่าตั๋วเต็มราคา", "มี PNR code ตรวจสอบได้", "ใช้ยื่นวีซ่าได้ทุกประเทศ"].map(f => <li key={f}>✓ {f}</li>)}</ul></div>
      <div className="text-center"><Link href="/visa/apply" className="btn-primary">จองตั๋ว Dummy →</Link></div>
    </div></section>
  </>);
}
