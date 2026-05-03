"use client";
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { UserCircle, Mail, Phone, MessageCircle, FileText, Download, Calendar, MapPin, Tag } from 'lucide-react';

export default function CustomerDetailPage() {
  const customerHistory = [
    { ref: 'JT-2605-001', tour: 'ทัวร์ญี่ปุ่น โตเกียว ฟูจิ', date: '2026-05-04', status: 'PAID', price: '฿45,000' },
    { ref: 'JT-2512-114', tour: 'ทัวร์ยุโรปตะวันออก', date: '2025-12-10', status: 'COMPLETED', price: '฿120,000' },
    { ref: 'JT-2508-052', tour: 'ทัวร์สิงคโปร์', date: '2025-08-05', status: 'COMPLETED', price: '฿25,000' },
  ];

  const columns = [
    { key: 'ref', title: 'Booking Ref', render: (val: string) => <span className="font-mono font-bold text-white">{val}</span> },
    { key: 'tour', title: 'โปรแกรมทัวร์ที่เคยไป' },
    { key: 'date', title: 'วันที่ทำรายการ' },
    { key: 'price', title: 'ยอดสุทธิ' },
    { 
      key: 'status', 
      title: 'สถานะ',
      render: (val: string) => (
        <Badge variant={val === 'COMPLETED' ? 'neutral' : 'info'}>{val}</Badge>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <UserCircle className="w-8 h-8 text-purple-500" />
            ข้อมูลลูกค้า (Customer Detail)
          </h1>
          <p className="text-slate-400">มุมมองประวัติแบบ 360 องศา ทั้งการเดินทาง เอกสาร และการสนทนา</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-700 text-slate-300">
            <MessageCircle className="w-4 h-4 mr-2" /> ทัก LINE ลูกค้า
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            สร้างออเดอร์ให้ลูกค้ารายนี้
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 lg:col-span-1 space-y-6">
          <div className="text-center pb-6 border-b border-slate-700">
            <div className="w-24 h-24 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span className="text-3xl font-black text-white">สม</span>
            </div>
            <h2 className="text-2xl font-bold text-white">คุณสมชาย ใจดี</h2>
            <p className="text-slate-400 mt-1">รหัสลูกค้า: CUST-9901</p>
            <div className="flex justify-center gap-2 mt-4">
              <Badge variant="warning">VIP Customer</Badge>
              <Badge variant="neutral">Japan Lover</Badge>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-300">
              <Phone className="w-4 h-4 text-slate-500" />
              <span>089-123-4567</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <Mail className="w-4 h-4 text-slate-500" />
              <span>somchai@example.com</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <MessageCircle className="w-4 h-4 text-[#00B900]" />
              <span>LINE: somchai.j</span>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-700">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">สถิติการเดินทาง (Travel Stats)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                <p className="text-slate-500 text-xs font-bold mb-1">ยอดใช้จ่ายรวม</p>
                <p className="text-xl font-black text-emerald-400">฿190,000</p>
              </div>
              <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                <p className="text-slate-500 text-xs font-bold mb-1">เที่ยวกับเรา</p>
                <p className="text-xl font-black text-blue-400">3 ทริป</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Tabs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Documents Vault */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                คลังเอกสารพาสปอร์ต (Passport Vault)
              </h3>
              <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">อัปโหลดไฟล์เพิ่ม</Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="border border-slate-700 bg-slate-900 rounded-xl p-4 flex flex-col items-center justify-center gap-3 group relative overflow-hidden">
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700"><Download className="w-4 h-4 mr-2" /> โหลด</Button>
                </div>
                <div className="w-16 h-12 bg-slate-800 rounded border border-slate-700 flex items-center justify-center">
                  <span className="text-xs text-slate-500">JPG</span>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-white truncate w-32">Passport_Somchai.jpg</p>
                  <p className="text-xs text-slate-500 mt-1">Exp: 15 Oct 2028</p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking History */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                ประวัติการซื้อทัวร์ (Booking History)
              </h3>
            </div>
            <DataTable columns={columns} data={customerHistory} className="bg-transparent border-slate-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
