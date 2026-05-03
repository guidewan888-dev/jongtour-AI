import { Ticket, DollarSign, RefreshCcw, Users, Link as LinkIcon, AlertTriangle, FileWarning, ArrowUpRight, CheckCircle2, ChevronRight, XCircle, Search, Filter } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { Card, CardContent } from "@/components/ui-new/Card";
import { Badge } from "@/components/ui-new/Badge";
import { Button } from "@/components/ui-new/Button";
import { Input } from "@/components/ui-new/Input";

export default async function AdminDashboard() {
  const now = new Date();
  
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // ใช้ Supabase JS แทน Prisma เพื่อหลีกเลี่ยง Vercel IPv6 Panic
  const { data: bookingsData, error } = await supabase
    .from('bookings')
    .select(`
      *,
      customer:customers(*),
      departure:departures(
        *,
        tour:tours(*)
      ),
      travelers:booking_travelers(*),
      payments:payments(*)
    `)
    .order('createdAt', { ascending: false });

  if (error) {
    console.error("Supabase fetch error:", error);
  }

  // Fetch real sync logs
  const { data: syncLogsData } = await supabase
    .from('supplier_sync_logs')
    .select('*')
    .order('startedAt', { ascending: false })
    .limit(10);

  const liveBookings = bookingsData || [];

  const activeBookings = liveBookings
    .map((b: any) => {
      let statusText = "รอตรวจสอบ";
      let statusVariant = "default";
      let actionText = "ตรวจสอบ";
      let actionUrl = `/admin/bookings/${b.id}`;
      let isPrimary = false;
      let warning = "";

      // Missing Documents Check
      const missingDocsCount = b.travelers?.filter((t: any) => !t.passportFileUrl || !t.visaFileUrl).length || 0;

      switch(b.status) {
        case "PENDING":
          statusText = "รอชำระเงิน";
          statusVariant = "warning";
          actionText = "ติดตามลูกค้า";
          break;
        case "AWAITING_CONFIRMATION":
          statusText = "รอตรวจสลิป";
          statusVariant = "brand";
          actionText = "ตรวจสลิป";
          isPrimary = true;
          break;
        case "DEPOSIT_PAID":
          statusText = "จ่ายมัดจำแล้ว";
          statusVariant = "secondary";
          if (missingDocsCount > 0) warning = `ขาดเอกสาร ${missingDocsCount} ท่าน`;
          break;
        case "FULL_PAID":
          statusText = missingDocsCount > 0 ? "รอเอกสารวีซ่า" : "รอเดินทาง";
          statusVariant = missingDocsCount > 0 ? "destructive" : "success";
          actionText = missingDocsCount > 0 ? "ติดตามเอกสาร" : "จัดการโฮลเซลล์";
          actionUrl = missingDocsCount > 0 ? `/admin/bookings/${b.id}/follow-up` : `/admin/wholesale`;
          if (missingDocsCount > 0) warning = `ขาดพาสปอร์ต ${missingDocsCount} ท่าน`;
          break;
        case "CANCELLED":
          statusText = "ยกเลิกแล้ว";
          statusVariant = "destructive";
          break;
      }

      return {
        id: b.id,
        customer: b.customer ? `${b.customer.firstName} ${b.customer.lastName}` : "Unknown",
        customerPhone: b.customer?.phoneNumber || "-",
        tour: b.departure?.tour?.tourName || "Unknown Tour",
        amount: `${(b.totalPrice || 0).toLocaleString()} ฿`,
        statusText,
        statusVariant,
        actionUrl,
        actionText,
        isPrimary,
        warning,
        date: new Date(b.createdAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
      };
    });

  const pendingCount = liveBookings.filter((b: any) => b.status === 'AWAITING_CONFIRMATION').length;
  const newCustomersToday = liveBookings.filter((b: any) => new Date(b.createdAt) >= new Date(now.setHours(0,0,0,0))).length;
  const unpaidCount = liveBookings.filter((b: any) => b.status === 'PENDING').length;
  const unpaidAmount = liveBookings.filter((b: any) => b.status === 'PENDING').reduce((acc: any, curr: any) => acc + (curr.totalPrice || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-trust-900 tracking-tight">Dashboard Overview</h2>
          <p className="text-sm text-muted-foreground mt-1">สรุปข้อมูลการจองและสถานะการทำงานของระบบในวันนี้</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" className="bg-white gap-2">
              <Filter className="w-4 h-4" /> ตัวกรอง
           </Button>
           <Button variant="brand" className="gap-2 shadow-sm">
              <RefreshCcw className="w-4 h-4" /> โหลดข้อมูลล่าสุด
           </Button>
        </div>
      </div>

      {/* Stats Cards - Modular Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="รอตรวจสอบ (ตรวจสลิป)" 
          value={pendingCount.toString()} 
          trend="+2 วันนี้"
          icon={Ticket} 
          colorClass="text-primary bg-primary-100/50" 
        />
        <StatCard 
          title="ยอดรอชำระเงิน" 
          value={`฿${unpaidAmount.toLocaleString()}`} 
          trend={`${unpaidCount} bookings`}
          icon={DollarSign} 
          colorClass="text-amber-600 bg-amber-50" 
        />
        <StatCard 
          title="ลูกค้าใหม่ (วันนี้)" 
          value={newCustomersToday.toString()} 
          trend="+15% จากเมื่อวาน"
          icon={Users} 
          colorClass="text-emerald-600 bg-emerald-50" 
        />
        <StatCard 
          title="สถานะ API Sync ล่าสุด" 
          value={syncLogsData && syncLogsData.length > 0 ? (syncLogsData[0].status === 'SUCCESS' ? 'สำเร็จ' : syncLogsData[0].status === 'RUNNING' ? 'กำลังดึงข้อมูล' : 'ขัดข้อง') : "No Data"} 
          trend={syncLogsData && syncLogsData.length > 0 ? `${new Date(syncLogsData[0].startedAt).toLocaleTimeString('th-TH', { timeZone: 'Asia/Bangkok' })} น.` : "N/A"}
          icon={RefreshCcw} 
          colorClass={syncLogsData && syncLogsData.length > 0 ? (syncLogsData[0].status === 'SUCCESS' ? "text-emerald-600 bg-emerald-50" : syncLogsData[0].status === 'RUNNING' ? "text-primary bg-primary-50" : "text-destructive bg-destructive/10") : "text-muted-foreground bg-muted"} 
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Table: Bookings that need attention */}
        <Card className="lg:col-span-2 shadow-sm border-border flex flex-col h-[600px] overflow-hidden">
          <div className="p-5 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
            <div>
              <h3 className="text-base font-bold text-trust-900 flex items-center gap-2">รายการจองล่าสุด (Recent Bookings) <Badge variant="brand" className="h-5 px-1.5 text-[10px]">Live</Badge></h3>
            </div>
            <div className="relative w-full sm:w-64">
               <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
               <Input placeholder="ค้นหา รหัส, ชื่อลูกค้า..." className="pl-9 h-9 text-xs" />
            </div>
          </div>
          
          {/* Scrollable Table Area */}
          <div className="overflow-y-auto flex-1 custom-scrollbar bg-white">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="sticky top-0 bg-muted/80 backdrop-blur-md z-10 border-b border-border shadow-sm">
                <tr className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">
                  <th className="px-5 py-3">รหัสการจอง</th>
                  <th className="px-5 py-3">ข้อมูลทัวร์ / ลูกค้า</th>
                  <th className="px-5 py-3">สถานะ</th>
                  <th className="px-5 py-3 text-right">แอคชั่น</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {activeBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-5 py-4 align-top">
                      <div className="flex items-center gap-2 mb-1">
                         <span className="font-mono text-sm font-bold text-trust-900">{booking.id.replace('mock-', 'BK-').substring(0, 10)}</span>
                         <span className="text-[10px] text-muted-foreground bg-muted px-1.5 rounded">{booking.date}</span>
                      </div>
                      <p className="text-sm font-bold text-primary">{booking.amount}</p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="font-bold text-sm text-trust-900 line-clamp-1 mb-1">{booking.tour}</p>
                      <div className="flex items-center gap-2">
                         <UserCircle className="w-3.5 h-3.5 text-muted-foreground" />
                         <p className="text-xs text-muted-foreground font-medium">{booking.customer} • {booking.customerPhone}</p>
                      </div>
                      {booking.warning && (
                        <div className="flex items-center gap-1.5 mt-2 bg-amber-50 text-amber-700 px-2 py-1 rounded text-[11px] font-bold border border-amber-100 w-fit">
                          <AlertTriangle className="w-3 h-3" />
                          {booking.warning}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <Badge variant={booking.statusVariant as any} className="mt-1">{booking.statusText}</Badge>
                    </td>
                    <td className="px-5 py-4 align-top text-right">
                      <Button variant={booking.isPrimary ? "brand" : "outline"} size="sm" className="h-8 text-xs shadow-sm" asChild>
                         <Link href={booking.actionUrl}>{booking.actionText}</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-t border-border bg-muted/20 text-center">
             <Link href="/admin/bookings" className="text-xs font-bold text-primary hover:text-primary-600 flex items-center justify-center gap-1">ดูรายการทั้งหมด <ChevronRight className="w-3 h-3" /></Link>
          </div>
        </Card>

        {/* System Logs Timeline */}
        <Card className="shadow-sm border-border flex flex-col h-[600px] overflow-hidden">
          <div className="p-5 border-b border-border bg-white shrink-0">
             <h3 className="text-base font-bold text-trust-900 flex items-center gap-2">Wholesale API Logs</h3>
          </div>
          <div className="p-5 overflow-y-auto custom-scrollbar flex-1 bg-white">
            <div className="relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border before:to-transparent">
              {syncLogsData && syncLogsData.map((log: any, index: number) => {
                const supplierName = log.supplierId === 'SUP_LETGO' ? "Let's Go" : log.supplierId === 'SUP_TOURFACTORY' ? "Tour Factory" : log.supplierId === 'SUP_CHECKIN' ? "Check In" : log.supplierId;
                
                let icon = <RefreshCcw className="w-3 h-3" />;
                let dotColor = "bg-muted text-muted-foreground border-border";
                let logText = "";
                
                if (log.status === 'SUCCESS') {
                  icon = <CheckCircle2 className="w-3.5 h-3.5" />;
                  dotColor = "bg-emerald-100 text-emerald-600 border-emerald-200";
                  logText = `อัปเดตทัวร์สำเร็จ ${log.recordsAdded || 0} รายการ`;
                } else if (log.status === 'RUNNING') {
                  icon = <RefreshCcw className="w-3.5 h-3.5 animate-spin" />;
                  dotColor = "bg-primary-100 text-primary border-primary/30";
                  logText = "กำลังเชื่อมต่อ API...";
                } else {
                  icon = <XCircle className="w-3.5 h-3.5" />;
                  dotColor = "bg-destructive/10 text-destructive border-destructive/20";
                  logText = `เชื่อมต่อล้มเหลว: ${log.errorMessage || 'Timeout'}`;
                }

                return (
                  <div key={log.id} className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group mb-6 last:mb-0">
                    {/* Icon Dot */}
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 bg-white shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 md:left-1/2 -translate-x-1/2 z-10 ${dotColor}`}>
                       {icon}
                    </div>
                    {/* Content Card */}
                    <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] ml-10 md:ml-0">
                       <div className="bg-muted/30 border border-border rounded-lg p-3 shadow-sm group-hover:border-primary/30 transition-colors">
                          <div className="flex justify-between items-start mb-1">
                             <span className="text-xs font-bold text-trust-900">{supplierName}</span>
                             <span className="text-[10px] text-muted-foreground">{new Date(log.startedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.</span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-snug">{logText}</p>
                       </div>
                    </div>
                  </div>
                );
              })}
              {(!syncLogsData || syncLogsData.length === 0) && (
                 <div className="text-center py-8">
                    <p className="text-muted-foreground text-sm">ยังไม่มีข้อมูลการซิงค์ API</p>
                 </div>
              )}
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}

function StatCard({ title, value, trend, icon: Icon, colorClass }: { title: string, value: string, trend: string, icon: any, colorClass: string }) {
  return (
    <Card className="shadow-sm border-border overflow-hidden group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
           <div>
             <p className="text-muted-foreground text-xs font-bold mb-1 uppercase tracking-wider">{title}</p>
             <h4 className="text-2xl font-black text-trust-900 mb-2 tracking-tight">{value}</h4>
             <p className="text-xs font-medium text-muted-foreground flex items-center gap-1"><ArrowUpRight className="w-3 h-3 text-emerald-500" /> {trend}</p>
           </div>
           <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${colorClass}`}>
             <Icon className="w-5 h-5" />
           </div>
        </div>
      </CardContent>
    </Card>
  );
}
