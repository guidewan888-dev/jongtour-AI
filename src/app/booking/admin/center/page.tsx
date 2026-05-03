"use client";
import { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Search, Filter, Download } from 'lucide-react';

export default function AllBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // In a real app, this would be a Server Action or fetch call to /api/bookings
  useEffect(() => {
    // Simulate DB fetch delay
    setTimeout(() => {
      setBookings([
        { id: 'BK-1001', ref: 'JT-2605-001', customer: 'สมชาย ใจดี', source: 'ONLINE', tour: 'ทัวร์ญี่ปุ่น โตเกียว ฟูจิ (5D3N)', price: '฿45,000', status: 'PENDING_PAYMENT', date: '2026-05-04' },
        { id: 'BK-1002', ref: 'JT-2605-002', customer: 'สมหญิง รักดี', source: 'MANUAL', tour: 'ทัวร์ยุโรปตะวันออก (8D5N)', price: '฿120,000', status: 'CONFIRMED', date: '2026-05-03' },
        { id: 'BK-1003', ref: 'JT-2605-003', customer: 'บริษัท เอบีซี จำกัด', source: 'AGENT', tour: 'ทัวร์สิงคโปร์ (3D2N)', price: '฿25,000', status: 'WAITING_WHOLESALE', date: '2026-05-02' },
        { id: 'BK-1004', ref: 'JT-2605-004', customer: 'มาริโอ้ เมาเร่อ', source: 'AI_CHATBOT', tour: 'ทัวร์เกาหลี โซล (4D2N)', price: '฿18,900', status: 'PAID', date: '2026-05-01' },
      ]);
      setIsLoading(false);
    }, 800);
  }, []);

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string, variant: "success" | "warning" | "error" | "info" | "neutral" }> = {
      'PENDING_PAYMENT': { label: 'รอชำระเงิน', variant: 'warning' },
      'WAITING_WHOLESALE': { label: 'รอ Wholesale', variant: 'warning' },
      'CONFIRMED': { label: 'ยืนยันแล้ว', variant: 'success' },
      'PAID': { label: 'ชำระเงินแล้ว', variant: 'info' },
      'CANCELLED': { label: 'ยกเลิก', variant: 'error' }
    };
    const s = map[status] || { label: status, variant: 'neutral' };
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  const getSourceBadge = (source: string) => {
    return <span className="text-xs px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-300 font-medium">{source}</span>;
  };

  const columns = [
    { key: 'ref', title: 'Booking Ref', render: (val: string) => <span className="font-mono font-bold text-white">{val}</span> },
    { key: 'customer', title: 'ลูกค้า', render: (val: string) => <span className="font-medium text-slate-200">{val}</span> },
    { key: 'source', title: 'ช่องทาง (Source)', render: (val: string) => getSourceBadge(val) },
    { key: 'tour', title: 'โปรแกรมทัวร์', render: (val: string) => <span className="text-sm truncate block max-w-xs">{val}</span> },
    { key: 'price', title: 'ยอดรวม', render: (val: string) => <span className="font-bold text-white">{val}</span> },
    { key: 'date', title: 'วันที่ทำรายการ', render: (val: string) => <span className="text-slate-400 text-sm">{val}</span> },
    { key: 'status', title: 'สถานะ', render: (val: string) => getStatusBadge(val) },
    { 
      key: 'actions', 
      title: 'จัดการ',
      render: () => <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">รายละเอียด</Button>
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">การจองทั้งหมด (All Bookings)</h1>
          <p className="text-slate-400">ดูและจัดการรายการจองทั้งหมดที่เข้ามาในระบบผ่านช่องทางต่างๆ</p>
        </div>
        <Button variant="outline" className="border-slate-700 text-slate-300">
          <Download className="w-4 h-4 mr-2" /> Export Excel
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input 
            placeholder="ค้นหาด้วย Booking Ref, ชื่อลูกค้า, อีเมล..." 
            className="pl-10 bg-slate-900 border-slate-700 text-white focus-visible:ring-blue-500/50"
          />
        </div>
        <select className="bg-slate-900 border border-slate-700 text-white rounded-xl px-4 outline-none focus:ring-2 focus:ring-blue-500">
          <option>ทุกสถานะ</option>
          <option>รอชำระเงิน</option>
          <option>รอ Wholesale ยืนยัน</option>
          <option>ยืนยันแล้ว</option>
          <option>ชำระเงินแล้ว</option>
        </select>
        <select className="bg-slate-900 border border-slate-700 text-white rounded-xl px-4 outline-none focus:ring-2 focus:ring-blue-500">
          <option>ทุกช่องทาง (Source)</option>
          <option>Online (Website)</option>
          <option>Manual (Sales)</option>
          <option>Agent (B2B)</option>
          <option>AI Chatbot</option>
        </select>
        <Button variant="outline" className="border-slate-700 text-slate-300 px-3">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <DataTable columns={columns} data={bookings} className="bg-transparent border-slate-700" />
        )}
      </div>
    </div>
  );
}
