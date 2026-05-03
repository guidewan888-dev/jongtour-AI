import Link from "next/link";
import { DollarSign, FileText, Download, Upload, TrendingUp, CreditCard, ArrowRight, ArrowUpRight, ArrowDownRight, Search, FileCheck } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function AdminFinancePage({
  searchParams,
}: {
  searchParams: { tab?: string; q?: string };
}) {
  const activeTab = searchParams.tab || "payments";
  const searchQuery = searchParams.q || "";

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const tabs = [
    { id: "payments", name: "Payments" },
    { id: "invoices", name: "Invoices" },
    { id: "receipts", name: "Receipts" },
    { id: "refunds", name: "Refunds" },
    { id: "supplier-payables", name: "Supplier Payables" },
    { id: "agent-receivables", name: "Agent Receivables" },
    { id: "profit-report", name: "Profit Report" },
  ];

  let activeData: any = null;
  let totalIncome = 0;
  let totalPayables = 0;
  let grossProfit = 0;

  // 1. Fetch Finance Overview (All COMPLETED Payments IN)
  const { data: allPayments } = await supabase
    .from('payments')
    .select('amount, status')
    .eq('status', 'COMPLETED');
    
  totalIncome = allPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;
  // Estimate Wholesale Outflow (Usually 70-80% of Income) - Just an estimation since we don't have payables out yet
  totalPayables = totalIncome * 0.75;
  grossProfit = totalIncome - totalPayables;

  // 2. Fetch specific tab data
  if (activeTab === "payments") {
    const { data: paymentsData } = await supabase
      .from('payments')
      .select(`
        *,
        booking:bookings(bookingRef, customer:customers(firstName, lastName))
      `)
      .order('createdAt', { ascending: false })
      .limit(50);
    activeData = paymentsData;
  } else if (activeTab === "invoices") {
    const { data: invoicesData } = await supabase
      .from('invoices')
      .select(`
        *,
        booking:bookings(bookingRef, customer:customers(firstName, lastName))
      `)
      .order('createdAt', { ascending: false })
      .limit(50);
    activeData = invoicesData;
  }

  // Handle Search Filtering
  if (searchQuery && activeData) {
    const q = searchQuery.toLowerCase();
    if (activeTab === "payments") {
      activeData = activeData.filter((p: any) => 
        p.paymentRef?.toLowerCase().includes(q) || 
        p.booking?.bookingRef?.toLowerCase().includes(q) ||
        p.booking?.customer?.firstName?.toLowerCase().includes(q)
      );
    } else if (activeTab === "invoices") {
      activeData = activeData.filter((i: any) => 
        i.invoiceNo?.toLowerCase().includes(q) || 
        i.booking?.bookingRef?.toLowerCase().includes(q)
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">การเงิน & เอกสาร (Finance & Documents)</h2>
          <p className="text-gray-500">จัดการรายรับ-รายจ่าย ตรวจสลิป ใบแจ้งหนี้ และใบเสร็จรับเงิน</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold text-sm hover:bg-gray-50 shadow-sm">
            <Upload className="w-4 h-4" /> อัปโหลด Statement
          </button>
          <button className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-gray-800 shadow-sm">
            <FileText className="w-4 h-4" /> ออกใบกำกับภาษี
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto custom-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Link 
              key={tab.id}
              href={`?tab=${tab.id}`}
              scroll={false}
              className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap
                ${isActive ? 'border-orange-500 text-orange-600 bg-orange-50/50' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'}
              `}
            >
              {tab.name}
            </Link>
          );
        })}
      </div>

      {/* Finance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">All Time</span>
          </div>
          <p className="text-sm font-bold text-green-800">รายรับรวม (เงินเข้า)</p>
          <h3 className="text-3xl font-black text-green-900 mt-1">฿{totalIncome.toLocaleString()}</h3>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-2xl border border-red-100">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">จ่าย Wholesale</span>
          </div>
          <p className="text-sm font-bold text-red-800">รายจ่ายรวม (ประเมิน)</p>
          <h3 className="text-3xl font-black text-red-900 mt-1">฿{totalPayables.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">ประมาณการ</span>
          </div>
          <p className="text-sm font-bold text-blue-800">กำไรเบื้องต้น (Gross Profit)</p>
          <h3 className="text-3xl font-black text-blue-900 mt-1">฿{grossProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <form className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="font-bold text-gray-800">ข้อมูล: {tabs.find(t => t.id === activeTab)?.name}</h3>
          <div className="flex gap-2 w-full md:w-auto">
            <input type="hidden" name="tab" value={activeTab} />
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" name="q" defaultValue={searchQuery} placeholder="ค้นหาเลขอ้างอิง, รหัสจอง..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <button type="submit" className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-100 border border-gray-200 transition-colors">ค้นหา</button>
          </div>
        </form>

        <div className="overflow-x-auto min-h-[400px]">
          {activeTab === "payments" ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
                  <th className="p-4 font-bold">Transaction ID</th>
                  <th className="p-4 font-bold">วัน-เวลา</th>
                  <th className="p-4 font-bold">รหัสจอง / คู่ค้า</th>
                  <th className="p-4 font-bold">ช่องทาง</th>
                  <th className="p-4 font-bold text-right">จำนวนเงิน</th>
                  <th className="p-4 font-bold">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {activeData && activeData.length > 0 ? activeData.map((t: any) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-mono text-gray-600 text-xs">{t.paymentRef}</td>
                    <td className="p-4 text-gray-500">{new Date(t.createdAt).toLocaleString('th-TH')}</td>
                    <td className="p-4">
                      <p className="font-bold text-indigo-600">{t.booking?.bookingRef}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{t.booking?.customer?.firstName} {t.booking?.customer?.lastName}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <CreditCard className="w-4 h-4 text-gray-400" /> {t.paymentMethod}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-right text-green-600">
                      +฿{t.amount.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                        t.status === 'COMPLETED' ? 'bg-green-50 text-green-600' :
                        t.status === 'PENDING' ? 'bg-orange-50 text-orange-600' :
                        'bg-red-50 text-red-600'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">ไม่พบรายการชำระเงิน</td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : activeTab === "invoices" ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
                  <th className="p-4 font-bold">Invoice No.</th>
                  <th className="p-4 font-bold">วันที่ออก</th>
                  <th className="p-4 font-bold">รหัสจอง / คู่ค้า</th>
                  <th className="p-4 font-bold text-right">ยอดรวม</th>
                  <th className="p-4 font-bold">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {activeData && activeData.length > 0 ? activeData.map((i: any) => (
                  <tr key={i.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-mono text-gray-600 text-xs font-bold">{i.invoiceNo}</td>
                    <td className="p-4 text-gray-500">{new Date(i.issueDate).toLocaleDateString('th-TH')}</td>
                    <td className="p-4">
                      <p className="font-bold text-indigo-600">{i.booking?.bookingRef}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{i.booking?.customer?.firstName} {i.booking?.customer?.lastName}</p>
                    </td>
                    <td className="p-4 font-bold text-right text-gray-800">
                      ฿{i.totalAmount.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                        i.status === 'PAID' ? 'bg-green-50 text-green-600' :
                        i.status === 'PARTIAL' ? 'bg-blue-50 text-blue-600' :
                        'bg-red-50 text-red-600'
                      }`}>
                        {i.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">ไม่พบใบแจ้งหนี้</td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <div className="flex items-center justify-center h-full pt-20">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-700">อยู่ระหว่างเตรียมระบบเชื่อมต่อ Database</h3>
                <p className="text-sm text-gray-500 mt-2">กำลังพัฒนาการดึงข้อมูลสำหรับ {tabs.find(t => t.id === activeTab)?.name}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
