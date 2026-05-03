'use client';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';

export default function BlogManagerPage() {
  const dummyData = [
    { id: 1, title: '10 ที่เที่ยวญี่ปุ่นฤดูใบไม้เปลี่ยนสี 2026', category: 'Travel Guide', status: 'Published', views: 12500, date: '2026-05-01' },
    { id: 2, title: 'เตรียมตัวขอเชงเก้นวีซ่า อัปเดตล่าสุด', category: 'Tips', status: 'Published', views: 8300, date: '2026-04-28' },
    { id: 3, title: 'รีวิวทัวร์สวิส นั่งรถไฟ Glacier Express', category: 'Review', status: 'Draft', views: 0, date: '2026-05-03' },
  ];

  const columns = [
    { key: 'title', title: 'ชื่อบทความ' },
    { key: 'category', title: 'หมวดหมู่' },
    { 
      key: 'status', 
      title: 'สถานะ',
      render: (val: string) => (
        <Badge variant={val === 'Published' ? 'success' : 'warning'}>
          {val}
        </Badge>
      )
    },
    { key: 'views', title: 'ยอดเข้าชม', render: (val: number) => val.toLocaleString() },
    { key: 'date', title: 'วันที่สร้าง' },
    { 
      key: 'actions', 
      title: 'จัดการ',
      render: () => (
        <div className="flex gap-2">
          <button className="p-2 text-slate-400 hover:text-blue-400 bg-slate-800 rounded-lg"><Edit className="w-4 h-4" /></button>
          <button className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800 rounded-lg"><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">จัดการบทความ (Blog)</h1>
          <p className="text-slate-400">สร้าง แก้ไข และลบบทความสำหรับหน้า Travel Guide และ Blog</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> เขียนบทความใหม่
        </Button>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input 
              placeholder="ค้นหาชื่อบทความ..." 
              className="pl-10 bg-slate-900 border-slate-700 text-white focus-visible:ring-blue-500"
            />
          </div>
          <select className="bg-slate-900 border border-slate-700 text-white rounded-xl px-4 outline-none focus:ring-2 focus:ring-blue-500">
            <option>ทุกหมวดหมู่</option>
            <option>Travel Guide</option>
            <option>Review</option>
            <option>Tips</option>
          </select>
        </div>

        <DataTable columns={columns} data={dummyData} className="bg-transparent border-slate-700" />
      </div>
    </div>
  );
}
