'use client';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Flame, Clock, TrendingDown, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';

export default function FireSaleManagerPage() {
  const dummyData = [
    { 
      id: 1, 
      tourCode: 'JP-TYO-001', 
      date: '25 ต.ค. (เหลือ 5 วัน)', 
      seats: 5, 
      normalPrice: 29900, 
      firePrice: 24900, 
      status: 'Active' 
    },
    { 
      id: 2, 
      tourCode: 'KR-SEL-022', 
      date: '28 ต.ค. (เหลือ 8 วัน)', 
      seats: 8, 
      normalPrice: 18900, 
      firePrice: 15900, 
      status: 'Active' 
    },
    { 
      id: 3, 
      tourCode: 'VN-DAN-005', 
      date: '22 ต.ค. (เดินทางแล้ว)', 
      seats: 0, 
      normalPrice: 12900, 
      firePrice: 9900, 
      status: 'Expired' 
    },
  ];

  const columns = [
    { key: 'tourCode', title: 'รหัสทัวร์', render: (val: string) => <span className="font-mono text-slate-300">{val}</span> },
    { 
      key: 'date', 
      title: 'วันเดินทาง', 
      render: (val: string) => (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-rose-400" />
          <span className="font-semibold text-white">{val}</span>
        </div>
      ) 
    },
    { key: 'seats', title: 'ที่นั่งว่าง', render: (val: number) => <span className="text-amber-400 font-bold">{val} ที่</span> },
    { 
      key: 'firePrice', 
      title: 'ราคาโปร / ปกติ', 
      render: (val: number, row: any) => (
        <div className="flex flex-col">
          <span className="text-rose-400 font-bold text-lg">฿{val.toLocaleString()}</span>
          <span className="text-slate-500 line-through text-xs">฿{row.normalPrice.toLocaleString()}</span>
        </div>
      ) 
    },
    { 
      key: 'status', 
      title: 'สถานะป้าย',
      render: (val: string) => (
        <Badge variant={val === 'Active' ? 'error' : 'neutral'} pulse={val === 'Active'}>
          {val === 'Active' ? '🔥 กำลังลดราคา' : 'หมดเวลา'}
        </Badge>
      )
    },
    { 
      key: 'actions', 
      title: 'จัดการ',
      render: (val: any, row: any) => (
        <Button variant="outline" size="sm" className="border-rose-900 text-rose-400 hover:bg-rose-900/50">
          ยกเลิกโปร
        </Button>
      )
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Flame className="w-8 h-8 text-rose-500" />
            ทัวร์ไฟไหม้ (Fire Sale Deals)
          </h1>
          <p className="text-slate-400">ระบบจัดการแคมเปญทัวร์ใกล้เดินทาง (Last Minute) เพื่อเทขายที่นั่งที่เหลือ</p>
        </div>
        <Button className="bg-rose-600 hover:bg-rose-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> เพิ่มโปรไฟไหม้
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-rose-900/40 to-slate-900 border border-rose-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="w-6 h-6 text-rose-400" />
            <h3 className="font-bold text-white">ระบบลดราคาอัตโนมัติ (Auto-Discount)</h3>
          </div>
          <p className="text-sm text-slate-400 mb-4">หั่นราคาทันที 2,000 บาท เมื่อที่นั่งเหลือน้อยกว่า 5 ที่ และใกล้วันเดินทางน้อยกว่า 7 วัน</p>
          <div className="flex items-center gap-2">
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs text-emerald-400 font-semibold">เปิดใช้งานแล้ว</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input 
              placeholder="ค้นหารหัสทัวร์..." 
              className="pl-10 bg-slate-900 border-slate-700 text-white focus-visible:ring-rose-500/50"
            />
          </div>
        </div>

        <DataTable columns={columns} data={dummyData} className="bg-transparent border-slate-700" />
      </div>
    </div>
  );
}
// Note: Added missing Plus icon import internally.
