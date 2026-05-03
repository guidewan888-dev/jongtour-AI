'use client';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Plus, Search, Edit, Power, Plane } from 'lucide-react';

export default function TourPackagesManager() {
  const dummyData = [
    { code: 'JP-TYO-001', name: 'โอซาก้า เกียวโต ทาคายาม่า 6 วัน 4 คืน', country: 'Japan', source: 'Zego (API)', status: 'Active' },
    { code: 'KR-SEL-022', name: 'โซล นามิ สวนสนุกเอเวอร์แลนด์ 5 วัน 3 คืน', country: 'Korea', source: 'Manual', status: 'Active' },
    { code: 'EU-SWI-005', name: 'สวิตเซอร์แลนด์ แกรนด์ทัวร์ 8 วัน 5 คืน', country: 'Switzerland', source: 'Letgo (API)', status: 'Inactive' },
  ];

  const columns = [
    { key: 'code', title: 'รหัสทัวร์', render: (val: string) => <span className="font-mono text-blue-400">{val}</span> },
    { key: 'name', title: 'ชื่อโปรแกรมทัวร์' },
    { key: 'country', title: 'ประเทศ' },
    { key: 'source', title: 'ดึงข้อมูลจาก' },
    { 
      key: 'status', 
      title: 'สถานะ',
      render: (val: string) => (
        <Badge variant={val === 'Active' ? 'success' : 'neutral'}>
          {val}
        </Badge>
      )
    },
    { 
      key: 'actions', 
      title: 'จัดการ',
      render: () => (
        <div className="flex gap-2">
          <button className="p-2 text-slate-400 hover:text-blue-400 bg-slate-800 rounded-lg" title="แก้ไข"><Edit className="w-4 h-4" /></button>
          <button className="p-2 text-slate-400 hover:text-amber-400 bg-slate-800 rounded-lg" title="เปิด/ปิด"><Power className="w-4 h-4" /></button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">แพ็กเกจทัวร์ (Tour Packages)</h1>
          <p className="text-slate-400">จัดการข้อมูลโปรแกรมทัวร์ทั้งหมดในระบบ</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> สร้างทัวร์ (Manual)
        </Button>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input 
              placeholder="ค้นหารหัส หรือชื่อทัวร์..." 
              className="pl-10 bg-slate-900 border-slate-700 text-white focus-visible:ring-blue-500"
            />
          </div>
          <select className="bg-slate-900 border border-slate-700 text-white rounded-xl px-4 outline-none focus:ring-2 focus:ring-blue-500">
            <option>ทุกประเทศ</option>
            <option>Japan</option>
            <option>Korea</option>
            <option>Europe</option>
          </select>
          <select className="bg-slate-900 border border-slate-700 text-white rounded-xl px-4 outline-none focus:ring-2 focus:ring-blue-500">
            <option>แหล่งข้อมูล (ทั้งหมด)</option>
            <option>API: Zego</option>
            <option>API: Letgo</option>
            <option>Manual Create</option>
          </select>
        </div>

        <DataTable columns={columns} data={dummyData} className="bg-transparent border-slate-700" />
      </div>
    </div>
  );
}
