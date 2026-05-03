'use client';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Search, Calendar, Users, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/Input';

export default function DeparturesManager() {
  const dummyData = [
    { id: 1, tourCode: 'JP-TYO-001', date: '25 ต.ค. - 30 ต.ค. 2026', seats: 30, available: 5, price: 29900, status: 'เปิดรับ' },
    { id: 2, tourCode: 'JP-TYO-001', date: '01 พ.ย. - 06 พ.ย. 2026', seats: 30, available: 30, price: 32900, status: 'เปิดรับ' },
    { id: 3, tourCode: 'KR-SEL-022', date: '10 พ.ย. - 14 พ.ย. 2026', seats: 25, available: 0, price: 18900, status: 'เต็ม' },
  ];

  const columns = [
    { key: 'tourCode', title: 'รหัสทัวร์', render: (val: string) => <span className="font-mono text-slate-300">{val}</span> },
    { key: 'date', title: 'วันเดินทาง', render: (val: string) => <span className="font-semibold text-white">{val}</span> },
    { 
      key: 'available', 
      title: 'ที่นั่งว่าง', 
      render: (val: number, row: any) => (
        <span className={val === 0 ? "text-rose-400 font-bold" : val < 10 ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
          {val} / {row.seats}
        </span>
      ) 
    },
    { key: 'price', title: 'ราคาผู้ใหญ่', render: (val: number) => `฿${val.toLocaleString()}` },
    { 
      key: 'status', 
      title: 'สถานะ',
      render: (val: string) => (
        <Badge variant={val === 'เปิดรับ' ? 'success' : 'error'}>
          {val}
        </Badge>
      )
    },
    { 
      key: 'actions', 
      title: 'จัดการ',
      render: () => (
        <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">แก้ไขราคา/ที่นั่ง</Button>
      )
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">รอบเดินทาง & ราคา (Departures)</h1>
          <p className="text-slate-400">ควบคุมจำนวนที่นั่งว่าง และปรับราคาขายแต่ละพีเรียด</p>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input 
              placeholder="ค้นหารหัสทัวร์..." 
              className="pl-10 bg-slate-900 border-slate-700 text-white focus-visible:ring-blue-500"
            />
          </div>
          <div className="relative max-w-xs">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input 
              type="month"
              className="pl-10 bg-slate-900 border-slate-700 text-white focus-visible:ring-blue-500"
            />
          </div>
          <select className="bg-slate-900 border border-slate-700 text-white rounded-xl px-4 outline-none focus:ring-2 focus:ring-blue-500">
            <option>สถานะทั้งหมด</option>
            <option>เปิดรับ (Available)</option>
            <option>ใกล้เต็ม (Low Stock)</option>
            <option>เต็ม (Full)</option>
          </select>
        </div>

        <DataTable columns={columns} data={dummyData} className="bg-transparent border-slate-700" />
      </div>
    </div>
  );
}
