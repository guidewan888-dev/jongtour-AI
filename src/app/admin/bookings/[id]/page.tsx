import Link from "next/link";
import { ChevronLeft, Calendar, Users, MapPin, CreditCard, Clock, FileText, CheckCircle2, Download, AlertCircle, Plane } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { updateBookingStatus } from "@/actions/admin-booking";
import RpaBookingManager from "./RpaBookingManager";

export const dynamic = 'force-dynamic';

export default async function BookingDetailsPage({ params }: { params: { id: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const { data: booking, error } = await supabase
    .from("bookings")
    .select(`
      *,
      customer:customers(*),
      tour:tours(tourName),
      departure:departures(startDate, endDate),
      travelers:booking_travelers(*),
      payments(*),
      rpaSessions:wholesale_rpa_sessions(*),
      externalRefs:booking_external_refs(*)
    `)
    .eq("id", params.id)
    .single();

  if (!booking) {
    notFound();
  }

  const totalPaid = booking.payments?.filter((p:any) => p.status === 'COMPLETED').reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
  const balance = booking.totalPrice - totalPaid;

  const statusMap: Record<string, string> = {
    "PENDING": "รอชำระเงิน",
    "AWAITING_CONFIRMATION": "รอตรวจสลิป",
    "CONFIRMED": "ยืนยันแล้ว",
    "COMPLETED": "เดินทางแล้ว",
    "CANCELLED": "ยกเลิก"
  };

  const badgeColors: Record<string, string> = {
    "PENDING": "bg-gray-100 text-gray-700 border-gray-200",
    "AWAITING_CONFIRMATION": "bg-amber-100 text-amber-700 border-amber-200",
    "CONFIRMED": "bg-green-100 text-green-700 border-green-200",
    "COMPLETED": "bg-blue-100 text-blue-700 border-blue-200",
    "CANCELLED": "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/bookings" className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              รายละเอียดการจอง
              <span className={`px-3 py-1 rounded-full text-sm font-bold border ${badgeColors[booking.status] || badgeColors['PENDING']}`}>
                {statusMap[booking.status] || booking.status}
              </span>
            </h2>
            <p className="text-gray-500 mt-1 font-mono tracking-wide">Ref: {booking.bookingRef}</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          {booking.status === 'AWAITING_CONFIRMATION' && (
            <form action={updateBookingStatus}>
              <input type="hidden" name="bookingId" value={booking.id} />
              <input type="hidden" name="status" value="CONFIRMED" />
              <button type="submit" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all">
                <CheckCircle2 className="w-5 h-5" /> อนุมัติสลิปโอนเงิน (Approve)
              </button>
            </form>
          )}
          {booking.status === 'PENDING' && (
             <form action={updateBookingStatus}>
             <input type="hidden" name="bookingId" value={booking.id} />
             <input type="hidden" name="status" value="CANCELLED" />
             <button type="submit" className="bg-red-100 text-red-600 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-red-200 transition-all">
               ยกเลิกการจอง
             </button>
           </form>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Info Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tour Package Info */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Plane className="w-5 h-5 text-indigo-500" /> ข้อมูลทัวร์ (Tour Package)
            </h3>
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-indigo-100 rounded-xl shrink-0 overflow-hidden flex items-center justify-center text-indigo-300">
                 <Plane className="w-8 h-8" />
              </div>
              <div className="flex-1 space-y-2">
                <p className="font-bold text-lg text-gray-800">{booking.tour?.tourName}</p>
                <p className="text-gray-600 flex items-center gap-2 text-sm"><Calendar className="w-4 h-4 text-gray-400" /> วันเดินทาง: <span className="font-bold">{booking.departure?.startDate ? new Date(booking.departure.startDate).toLocaleDateString('th-TH') : "N/A"}</span></p>
                <p className="text-gray-600 flex items-center gap-2 text-sm"><Users className="w-4 h-4 text-gray-400" /> ผู้เดินทางทั้งหมด: <span className="font-bold">{booking.travelers?.length || 0} ท่าน</span></p>
              </div>
            </div>
          </div>

          {/* Travelers List */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-500" /> รายชื่อผู้เดินทาง (Travelers)
              </h3>
            </div>
            
            <div className="space-y-3">
              {!booking.travelers || booking.travelers.length === 0 ? (
                 <p className="text-gray-500 text-sm">ยังไม่ได้กรอกรายชื่อผู้เดินทาง</p>
              ) : booking.travelers.map((t:any, idx:number) => (
                <div key={t.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 font-bold">{idx+1}</div>
                    <div>
                      <p className="font-bold text-gray-800">{t.title} {t.firstName} {t.lastName}</p>
                      <p className="text-xs text-gray-500">{t.paxType}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Passport No.</p>
                    <p className="font-mono text-sm font-bold text-gray-700">{t.passportNo || "-"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Wholesale Info */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
               <Plane className="w-5 h-5 text-orange-500" /> ข้อมูลผู้จัด (Supplier)
            </h3>
            <div className="space-y-3 text-sm">
               <p className="flex justify-between"><span className="text-gray-500">ประเภท:</span> <span className="font-bold text-gray-800">{booking.wholesaleType || "ไม่ระบุ"}</span></p>
               <p className="flex justify-between"><span className="text-gray-500">Supplier ID:</span> <span className="font-mono text-gray-800">{booking.supplierId || "N/A"}</span></p>
               {booking.supplierId && (
                 <a 
                   href={`/wholesale/${booking.supplierId}`}
                   target="_blank" 
                   rel="noreferrer"
                   className="mt-4 w-full bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold py-2 rounded-xl flex items-center justify-center gap-2 transition-colors border border-orange-200"
                 >
                   เปิดดูรายการทัวร์ต้นทาง
                 </a>
               )}

               {/* External Booking Ref Input */}
               <form action={async (formData) => {
                 "use server";
                 const ref = formData.get("external_ref") as string;
                 const { createClient } = require("@supabase/supabase-js");
                 const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
                 await sb.from("booking_external_refs").upsert({
                   bookingId: booking.id,
                   externalBookingId: ref,
                   platform: booking.wholesaleType || "MANUAL",
                   createdAt: new Date().toISOString()
                 }, { onConflict: 'bookingId' });
                 const { revalidatePath } = require("next/cache");
                 revalidatePath(`/admin/bookings/${booking.id}`);
               }} className="mt-4 border-t border-gray-100 pt-4">
                 <label className="text-xs text-gray-500 font-bold uppercase mb-2 block">หมายเลขการจองต้นทาง (External Ref)</label>
                 <div className="flex gap-2">
                   <input type="text" name="external_ref" defaultValue={booking.externalRefs?.[0]?.externalBookingId || ""} placeholder="เช่น PNR หรือ Ref จาก Wholesale" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500" />
                   <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800">
                     บันทึก
                   </button>
                 </div>
               </form>
            </div>
          </div>

          {/* RPA Control Panel */}
          {booking.supplierId && (
            <RpaBookingManager 
              bookingId={booking.id} 
              supplierId={booking.supplierId} 
              currentSessions={booking.rpaSessions || []} 
            />
          )}

          {/* Customer Info */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">ข้อมูลผู้ติดต่อหลัก</h3>
            <div className="space-y-3 text-sm">
              <p className="font-bold text-lg text-gray-800">{booking.customer?.firstName} {booking.customer?.lastName}</p>
              <p className="text-gray-600 flex items-center gap-2"><CreditCard className="w-4 h-4 text-gray-400" /> {booking.customer?.phone}</p>
              <p className="text-gray-600 flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> {booking.customer?.email}</p>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">สถานะการชำระเงิน</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">ยอดรวมทั้งสิ้น</span>
                <span className="font-bold text-gray-800">฿{booking.totalPrice?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">ชำระแล้ว</span>
                <span className="font-bold text-emerald-600">฿{totalPaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg pt-2 border-t border-gray-100">
                <span className="font-bold text-gray-800">ยอดค้างชำระ</span>
                <span className="font-black text-red-600">฿{balance.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">ประวัติการชำระเงิน</p>
              {!booking.payments || booking.payments.length === 0 ? (
                 <p className="text-xs text-gray-500">ยังไม่มีประวัติการชำระเงิน</p>
              ) : booking.payments.map((h:any, i:number) => (
                <div key={i} className="flex gap-3 mb-3 last:mb-0">
                  <div className="mt-1"><AlertCircle className="w-4 h-4 text-blue-500" /></div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">฿{h.amount.toLocaleString()} <span className="text-xs font-normal text-blue-600 bg-blue-100 px-2 py-0.5 rounded ml-1">{h.status}</span></p>
                    <p className="text-xs text-gray-500">{h.paymentMethod} • Ref: {h.paymentRef}</p>
                    <p className="text-xs text-gray-400">{new Date(h.createdAt).toLocaleString('th-TH')}</p>
                  </div>
                </div>
              ))}
            </div>

            {balance > 0 && (
              <form action={async (formData) => {
                "use server";
                const amount = parseFloat(formData.get("amount") as string);
                const { createClient } = require("@supabase/supabase-js");
                const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
                await sb.from("payments").insert({
                  bookingId: booking.id,
                  amount: amount,
                  status: "COMPLETED",
                  paymentMethod: "BANK_TRANSFER",
                  paymentRef: "MANUAL-" + Date.now()
                });
                const { revalidatePath } = require("next/cache");
                revalidatePath(`/admin/bookings/${booking.id}`);
              }} className="mt-4 border-t border-gray-100 pt-4 flex gap-2">
                <input type="number" name="amount" defaultValue={balance} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 whitespace-nowrap">
                  แจ้งชำระ (Manual)
                </button>
              </form>
            )}

            {booking.status === 'COMPLETED' && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <a 
                  href={`/api/admin/bookings/${booking.id}/voucher`} 
                  target="_blank"
                  className="w-full flex items-center justify-center gap-2 bg-purple-100 text-purple-700 hover:bg-purple-200 px-4 py-3 rounded-xl font-bold transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  สร้าง Voucher / ตั๋วเดินทาง
                </a>
              </div>
            )}
          </div>

          {/* Timeline / Logs */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mt-6">
            <h3 className="font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">ไทม์ไลน์สถานะ (Timeline)</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="mt-1"><div className="w-3 h-3 bg-blue-500 rounded-full"></div></div>
                <div>
                  <p className="text-sm font-bold text-gray-800">สร้าง Booking ใหม่</p>
                  <p className="text-xs text-gray-500">{new Date(booking.createdAt).toLocaleString('th-TH')}</p>
                </div>
              </div>
              {booking.payments?.map((p: any, i: number) => (
                <div key={`p-${i}`} className="flex gap-4">
                  <div className="mt-1"><div className="w-3 h-3 bg-emerald-500 rounded-full"></div></div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">ชำระเงิน {p.amount.toLocaleString()} บาท</p>
                    <p className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleString('th-TH')}</p>
                  </div>
                </div>
              ))}
              {booking.rpaSessions?.map((r: any, i: number) => (
                <div key={`r-${i}`} className="flex gap-4">
                  <div className="mt-1"><div className="w-3 h-3 bg-orange-500 rounded-full"></div></div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">ระบบ RPA ดำเนินการจอง</p>
                    <p className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleString('th-TH')}</p>
                  </div>
                </div>
              ))}
              {booking.externalRefs?.map((e: any, i: number) => (
                <div key={`e-${i}`} className="flex gap-4">
                  <div className="mt-1"><div className="w-3 h-3 bg-indigo-500 rounded-full"></div></div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">บันทึกรหัส Wholesale: {e.externalBookingId}</p>
                    <p className="text-xs text-gray-500">{new Date(e.createdAt || booking.updatedAt).toLocaleString('th-TH')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
