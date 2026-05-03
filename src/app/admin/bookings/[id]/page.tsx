import Link from "next/link";
import { ChevronLeft, Calendar, Users, MapPin, CreditCard, Clock, FileText, CheckCircle2, Download, AlertCircle, Plane, Briefcase, ExternalLink, Copy, AlertTriangle, Phone, Mail, FileSignature, Receipt, History } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { updateBookingStatus } from "@/actions/admin-booking";
import RpaBookingManager from "./RpaBookingManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui-new/Card";
import { Badge } from "@/components/ui-new/Badge";
import { Button } from "@/components/ui-new/Button";
import { Input } from "@/components/ui-new/Input";

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

  const statusMap: Record<string, { label: string, variant: "default" | "brand" | "secondary" | "destructive" | "success" | "warning" | "outline" }> = {
    "PENDING": { label: "รอชำระเงิน", variant: "warning" },
    "AWAITING_CONFIRMATION": { label: "รอตรวจสลิป", variant: "brand" },
    "DEPOSIT_PAID": { label: "มัดจำแล้ว", variant: "secondary" },
    "FULL_PAID": { label: "ชำระเต็มจำนวน", variant: "success" },
    "CONFIRMED": { label: "ยืนยันแล้ว", variant: "success" },
    "COMPLETED": { label: "เดินทางเสร็จสิ้น", variant: "default" },
    "CANCELLED": { label: "ยกเลิก", variant: "destructive" }
  };

  const currentStatus = statusMap[booking.status] || { label: booking.status, variant: "default" };

  return (
    <div className="max-w-7xl mx-auto pb-16">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="shrink-0">
             <Link href="/admin/bookings"><ChevronLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
               <h2 className="text-2xl font-black text-trust-900 tracking-tight">
                 Booking Details
               </h2>
               <Badge variant={currentStatus.variant}>{currentStatus.label}</Badge>
            </div>
            <p className="text-muted-foreground text-sm flex items-center gap-2">
               Ref: <span className="font-mono font-bold text-trust-800">{booking.bookingRef}</span> 
               <span className="text-border">•</span> 
               Created: {new Date(booking.createdAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        
        {/* Top Action Buttons */}
        <div className="flex gap-2">
          {booking.status === 'AWAITING_CONFIRMATION' && (
            <form action={updateBookingStatus}>
              <input type="hidden" name="bookingId" value={booking.id} />
              <input type="hidden" name="status" value="DEPOSIT_PAID" />
              <Button type="submit" variant="brand" className="gap-2 shadow-sm">
                <CheckCircle2 className="w-4 h-4" /> อนุมัติสลิปโอนเงิน
              </Button>
            </form>
          )}
          {booking.status === 'PENDING' && (
             <form action={updateBookingStatus}>
             <input type="hidden" name="bookingId" value={booking.id} />
             <input type="hidden" name="status" value="CANCELLED" />
             <Button type="submit" variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/20 shadow-none border-0">
               ยกเลิกการจอง
             </Button>
           </form>
          )}
          <Button variant="outline" className="gap-2">
             <FileSignature className="w-4 h-4" /> สร้าง Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Main Info */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* 1. Tour Card */}
          <Card className="shadow-sm border-border">
            <CardHeader className="pb-3 border-b border-border bg-muted/20">
               <CardTitle className="text-base flex items-center gap-2"><Plane className="w-5 h-5 text-primary" /> ข้อมูลแพ็กเกจทัวร์ (Tour Info)</CardTitle>
            </CardHeader>
            <CardContent className="p-5 flex flex-col md:flex-row gap-5">
               <div className="w-24 h-24 bg-primary-50 rounded-xl shrink-0 flex items-center justify-center border border-primary-100">
                  <Plane className="w-8 h-8 text-primary" />
               </div>
               <div className="flex-1 space-y-3">
                  <div>
                     <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Package Name</p>
                     <p className="font-bold text-lg text-trust-900 leading-tight">{booking.tour?.tourName}</p>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                     <div>
                        <p className="text-[10px] text-muted-foreground uppercase">Departure Date</p>
                        <p className="text-sm font-bold text-trust-800 flex items-center gap-1.5 mt-0.5"><Calendar className="w-3.5 h-3.5 text-primary" /> {booking.departure?.startDate ? new Date(booking.departure.startDate).toLocaleDateString('th-TH', { dateStyle: 'medium' }) : "N/A"}</p>
                     </div>
                     <div>
                        <p className="text-[10px] text-muted-foreground uppercase">Total Pax</p>
                        <p className="text-sm font-bold text-trust-800 flex items-center gap-1.5 mt-0.5"><Users className="w-3.5 h-3.5 text-primary" /> {booking.travelers?.length || 0} ท่าน</p>
                     </div>
                  </div>
               </div>
            </CardContent>
          </Card>

          {/* 2. Customer Card */}
          <Card className="shadow-sm border-border">
            <CardHeader className="pb-3 border-b border-border bg-muted/20">
               <CardTitle className="text-base flex items-center gap-2"><Users className="w-5 h-5 text-emerald-500" /> ข้อมูลผู้จอง (Customer Contact)</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                     <p className="text-[10px] text-muted-foreground uppercase mb-1">Customer Name</p>
                     <p className="font-bold text-trust-900">{booking.customer?.firstName} {booking.customer?.lastName}</p>
                  </div>
                  <div>
                     <p className="text-[10px] text-muted-foreground uppercase mb-1">Phone Number</p>
                     <p className="font-bold text-trust-900 flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-muted-foreground" /> {booking.customer?.phone || "-"}</p>
                  </div>
                  <div>
                     <p className="text-[10px] text-muted-foreground uppercase mb-1">Email</p>
                     <p className="font-bold text-trust-900 flex items-center gap-2 truncate"><Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> {booking.customer?.email || "-"}</p>
                  </div>
               </div>
            </CardContent>
          </Card>

          {/* 3. Travelers List Card */}
          <Card className="shadow-sm border-border">
            <CardHeader className="pb-3 border-b border-border bg-muted/20 flex flex-row items-center justify-between">
               <CardTitle className="text-base flex items-center gap-2"><FileText className="w-5 h-5 text-indigo-500" /> รายชื่อผู้เดินทาง (Traveler Details)</CardTitle>
               <Button variant="outline" size="sm" className="h-7 text-xs">แก้ไขข้อมูล</Button>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-border">
                  {!booking.travelers || booking.travelers.length === 0 ? (
                     <div className="p-6 text-center text-muted-foreground text-sm">ยังไม่ได้กรอกรายชื่อผู้เดินทาง</div>
                  ) : booking.travelers.map((t:any, idx:number) => {
                     const isMissingDoc = !t.passportFileUrl;
                     return (
                        <div key={t.id} className="p-4 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-muted/10 transition-colors">
                           <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-trust-500 font-bold text-sm shrink-0">{idx+1}</div>
                              <div>
                                 <p className="font-bold text-trust-900">{t.title} {t.firstName} {t.lastName}</p>
                                 <p className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">{t.paxType}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-4 md:text-right pl-12 md:pl-0">
                              <div>
                                 <p className="text-[10px] text-muted-foreground uppercase">Passport No.</p>
                                 <p className="font-mono text-sm font-bold text-trust-800">{t.passportNo || "-"}</p>
                              </div>
                              {isMissingDoc ? (
                                 <Badge variant="destructive" className="bg-destructive/10 text-destructive border-0">รอเอกสาร</Badge>
                              ) : (
                                 <Badge variant="success" className="bg-emerald-100 text-emerald-700 border-0">ครบถ้วน</Badge>
                              )}
                           </div>
                        </div>
                     );
                  })}
               </div>
            </CardContent>
          </Card>
          
          {/* 4. Internal Communication / Notes Timeline */}
          <Card className="shadow-sm border-border bg-muted/10">
            <CardHeader className="pb-3 border-b border-border bg-white">
               <CardTitle className="text-base flex items-center gap-2"><History className="w-5 h-5 text-trust-600" /> Communication & Internal Notes</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
               <div className="space-y-4">
                  {/* Mock Note 1 */}
                  <div className="flex gap-3">
                     <div className="w-8 h-8 rounded-full bg-primary-100 text-primary font-bold flex items-center justify-center text-xs shrink-0">SA</div>
                     <div className="bg-white border border-border p-3 rounded-tr-xl rounded-b-xl rounded-tl-sm shadow-sm flex-1">
                        <div className="flex justify-between items-start mb-1">
                           <p className="text-xs font-bold text-trust-900">Sale Admin</p>
                           <p className="text-[10px] text-muted-foreground">Today 10:30</p>
                        </div>
                        <p className="text-sm text-trust-800">ลูกค้ารอแจ้งชื่อผู้เดินทางเพิ่มเติมพรุ่งนี้เช้าครับ</p>
                     </div>
                  </div>
                  {/* Add Note Input */}
                  <div className="flex gap-3 mt-4">
                     <div className="w-8 h-8 rounded-full bg-trust-800 text-white font-bold flex items-center justify-center text-xs shrink-0">ME</div>
                     <div className="flex-1 flex gap-2">
                        <Input placeholder="เพิ่มบันทึกภายในสำหรับทีม..." className="bg-white text-sm" />
                        <Button variant="outline">บันทึก</Button>
                     </div>
                  </div>
               </div>
            </CardContent>
          </Card>

        </div>

        {/* RIGHT COLUMN: Action Panels (Payment & Wholesale) */}
        <div className="space-y-6">
          
          {/* Prominent Wholesale Booking Panel */}
          <Card className="border-primary ring-1 ring-primary/20 shadow-md bg-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2"></div>
            <CardHeader className="pb-4 border-b border-border relative z-10 bg-primary/5">
               <CardTitle className="text-lg flex items-center gap-2"><Briefcase className="w-5 h-5 text-primary" /> Wholesale Panel</CardTitle>
               <p className="text-xs text-muted-foreground mt-1">จัดการที่นั่งกับผู้จัดทัวร์ต้นทาง</p>
            </CardHeader>
            <CardContent className="p-5 space-y-5 relative z-10">
               <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-muted-foreground">Supplier:</span>
                     <Badge variant="outline" className="font-bold bg-white">{booking.supplierId?.replace('SUP_', '') || "N/A"}</Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-muted-foreground">Ext. Status:</span>
                     {booking.externalRefs?.[0] ? <Badge variant="success">Confirmed</Badge> : <Badge variant="warning">Pending Booking</Badge>}
                  </div>
               </div>

               {/* Action Buttons */}
               <div className="space-y-2 pt-3 border-t border-border">
                  <Button variant="brand" className="w-full gap-2 justify-between" asChild>
                     <a href={`/wholesale/${booking.supplierId}`} target="_blank">
                        <span className="flex items-center gap-2"><ExternalLink className="w-4 h-4" /> Open Wholesale Portal</span>
                     </a>
                  </Button>
                  <Button variant="outline" className="w-full gap-2 justify-between bg-white hover:bg-muted">
                     <span className="flex items-center gap-2"><Copy className="w-4 h-4 text-trust-500" /> Copy Booking Summary</span>
                  </Button>
               </div>

               {/* External Ref Input */}
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
               }} className="pt-4 border-t border-border">
                 <label className="text-[10px] text-muted-foreground font-bold uppercase mb-2 block">Wholesale Booking Ref.</label>
                 <div className="flex gap-2">
                   <Input type="text" name="external_ref" defaultValue={booking.externalRefs?.[0]?.externalBookingId || ""} placeholder="e.g. PNR or System Ref" className="text-xs h-9 bg-white" />
                   <Button type="submit" size="sm" variant="secondary" className="h-9">Save</Button>
                 </div>
               </form>
               
               {/* Quick Status Mark */}
               <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 text-[10px] h-7 border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100">Mark Confirmed</Button>
                  <Button variant="outline" size="sm" className="flex-1 text-[10px] h-7 border-destructive/30 text-destructive bg-destructive/5 hover:bg-destructive/10">Mark Sold Out</Button>
               </div>
            </CardContent>
          </Card>

          {/* Payment Card */}
          <Card className="shadow-sm border-border">
            <CardHeader className="pb-3 border-b border-border bg-muted/20">
               <CardTitle className="text-base flex items-center gap-2"><Receipt className="w-5 h-5 text-amber-500" /> ข้อมูลการชำระเงิน (Payment)</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Grand Total</span>
                  <span className="font-bold text-trust-900">฿{booking.totalPrice?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Paid Amount</span>
                  <span className="font-bold text-emerald-600">฿{totalPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-border">
                  <span className="font-bold text-trust-900">Balance Due</span>
                  <span className="text-xl font-black text-destructive">฿{balance.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment History */}
              <div className="bg-muted/30 rounded-lg p-3 border border-border mb-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Payment History</p>
                {!booking.payments || booking.payments.length === 0 ? (
                   <p className="text-xs text-muted-foreground italic">No payment records yet.</p>
                ) : booking.payments.map((h:any, i:number) => (
                  <div key={i} className="flex justify-between items-start mb-2 last:mb-0 bg-white p-2 rounded border border-border/50 shadow-sm">
                    <div>
                      <p className="text-xs font-bold text-trust-900">฿{h.amount.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{h.paymentRef}</p>
                    </div>
                    <div className="text-right">
                       <Badge variant="success" className="h-4 px-1 text-[8px]">{h.status}</Badge>
                       <p className="text-[9px] text-muted-foreground mt-1">{new Date(h.createdAt).toLocaleDateString('th-TH')}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Manual Payment Action */}
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
                }} className="flex gap-2">
                  <Input type="number" name="amount" defaultValue={balance} className="h-9 text-xs" />
                  <Button type="submit" size="sm" variant="secondary" className="h-9 whitespace-nowrap bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
                    Add Payment
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Status Timeline Card */}
          <Card className="shadow-sm border-border bg-transparent shadow-none border-0">
             <CardHeader className="pb-2 px-0">
                <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider font-bold">System Status Timeline</CardTitle>
             </CardHeader>
             <CardContent className="px-0">
               <div className="space-y-4 border-l-2 border-border ml-2 pl-4 py-1">
                 <div className="relative">
                   <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-border rounded-full ring-4 ring-muted"></div>
                   <p className="text-xs font-bold text-trust-900">Booking Created</p>
                   <p className="text-[10px] text-muted-foreground">{new Date(booking.createdAt).toLocaleString('th-TH')}</p>
                 </div>
                 {booking.payments?.map((p: any, i: number) => (
                   <div key={`p-${i}`} className="relative">
                     <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-4 ring-muted"></div>
                     <p className="text-xs font-bold text-trust-900">Payment Received (฿{p.amount.toLocaleString()})</p>
                     <p className="text-[10px] text-muted-foreground">{new Date(p.createdAt).toLocaleString('th-TH')}</p>
                   </div>
                 ))}
                 {booking.externalRefs?.map((e: any, i: number) => (
                   <div key={`e-${i}`} className="relative">
                     <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-primary rounded-full ring-4 ring-muted"></div>
                     <p className="text-xs font-bold text-trust-900">Wholesale Ref Saved</p>
                     <p className="text-[10px] text-muted-foreground">{new Date(e.createdAt || booking.updatedAt).toLocaleString('th-TH')}</p>
                   </div>
                 ))}
               </div>
             </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
