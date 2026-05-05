import Link from "next/link";

export default function HotelBookingPage() {
  return (<>
    <section className="bg-gradient-to-r from-purple-600 to-pink-500 text-white py-12"><div className="g-container"><div className="text-3xl mb-2">🏨</div><h1 className="text-3xl font-bold">จองโรงแรม Dummy</h1><p className="text-purple-100 mt-2">ใบจองโรงแรมสำหรับยื่นวีซ่า ยกเลิกได้ฟรีหลังได้วีซ่า</p></div></section>
    <section className="g-section bg-white"><div className="g-container-narrow space-y-6">
      <div className="g-card p-6 text-center"><div className="text-3xl font-black text-primary">฿300<span className="text-sm text-slate-400 font-normal">/คืน</span></div><p className="text-sm text-slate-500 mt-1">ใบจองจริง · ยกเลิกฟรี · ส่งภายใน 2 ชม.</p></div>
      <div className="g-card p-6"><h3 className="font-bold mb-3">✅ รายละเอียด</h3><ul className="space-y-2 text-sm text-slate-600">{["ใบจองโรงแรมจริงจากระบบ Booking", "มี Confirmation Number ตรวจสอบได้", "ครอบคลุมทุกเมืองทั่วโลก", "ยกเลิกได้ฟรี 100% หลังได้วีซ่า", "ส่งทางอีเมลภายใน 2 ชม."].map(f => <li key={f}>✓ {f}</li>)}</ul></div>
      <div className="text-center"><Link href="/visa/apply" className="btn-primary">จองโรงแรม Dummy →</Link></div>
    </div></section>
  </>);
}
