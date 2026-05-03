"use client";
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Tags, Image as ImageIcon, MapPin, Plus } from 'lucide-react';

export default function TagsManagerPage() {
  const dummyDestinations = [
    { country: 'Japan', code: 'JP', toursCount: 450, hasCover: true, status: 'Active' },
    { country: 'Korea', code: 'KR', toursCount: 210, hasCover: true, status: 'Active' },
    { country: 'Switzerland', code: 'CH', toursCount: 85, hasCover: false, status: 'Active' },
  ];

  const destColumns = [
    { 
      key: 'country', 
      title: 'ประเทศ (Country)', 
      render: (val: string, row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-6 bg-slate-700 rounded overflow-hidden flex items-center justify-center text-[10px] text-slate-400 border border-slate-600">
            {row.code}
          </div>
          <span className="font-bold text-white">{val}</span>
        </div>
      ) 
    },
    { key: 'toursCount', title: 'จำนวนโปรแกรมทัวร์', render: (val: number) => <span className="text-blue-400 font-semibold">{val} โปรแกรม</span> },
    { 
      key: 'hasCover', 
      title: 'รูปหน้าปก',
      render: (val: boolean) => (
        <span className={`flex items-center gap-1.5 text-xs font-semibold ${val ? 'text-emerald-400' : 'text-slate-500'}`}>
          <ImageIcon className="w-4 h-4" /> {val ? 'อัปโหลดแล้ว' : 'ยังไม่มีรูป'}
        </span>
      )
    },
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
      render: () => <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">อัปโหลดรูป</Button>
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Tags className="w-8 h-8 text-purple-500" />
            หมวดหมู่ & แท็ก (Destinations)
          </h1>
          <p className="text-slate-400">จัดการข้อมูลประเทศ เมือง และอัปโหลดรูปภาพหน้าปกสำหรับหน้าค้นหา</p>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-400" />
            จัดการประเทศ (Countries)
          </h3>
          <Button size="sm" className="bg-slate-700 hover:bg-slate-600 text-white">
            <Plus className="w-4 h-4 mr-2" /> เพิ่มประเทศใหม่
          </Button>
        </div>
        <DataTable columns={destColumns} data={dummyDestinations} className="bg-transparent border-slate-700" />
      </div>

      <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Tags className="w-5 h-5 text-purple-400" />
            ระบบคีย์เวิร์ด และธีม (Themes & Search Tags)
          </h3>
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="w-4 h-4 mr-2" /> สร้างแท็กใหม่
          </Button>
        </div>
        <div className="flex flex-wrap gap-3">
          <span className="px-3 py-1.5 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg text-sm flex items-center gap-2">
            🌸 ซากุระบาน <button className="text-slate-500 hover:text-rose-400">×</button>
          </span>
          <span className="px-3 py-1.5 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg text-sm flex items-center gap-2">
            ⛄ ลานสกี <button className="text-slate-500 hover:text-rose-400">×</button>
          </span>
          <span className="px-3 py-1.5 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg text-sm flex items-center gap-2">
            🏰 ยุโรปตะวันออก <button className="text-slate-500 hover:text-rose-400">×</button>
          </span>
          <span className="px-3 py-1.5 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg text-sm flex items-center gap-2">
            ⛩️ ไหว้พระขอพร <button className="text-slate-500 hover:text-rose-400">×</button>
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-4">แท็กเหล่านี้จะถูกนำไปแสดงเป็นปุ่มให้ลูกค้ากดค้นหาเร็วๆ ในหน้าแรกของทัวร์</p>
      </div>
    </div>
  );
}
