"use client";
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Building2, KeyRound, Server, Edit, Plus } from 'lucide-react';

export default function SuppliersManagerPage() {
  const dummySuppliers = [
    { name: 'Zego', method: 'API', frequency: 'HOURLY', auth: 'BEARER Token', status: 'ACTIVE' },
    { name: 'Letgo', method: 'API', frequency: 'DAILY', auth: 'API_KEY', status: 'INACTIVE' },
    { name: 'GoHoliday', method: 'EMAIL', frequency: 'MANUAL', auth: 'None', status: 'ACTIVE' },
  ];

  const columns = [
    { 
      key: 'name', 
      title: 'ชื่อซัพพลายเออร์', 
      render: (val: string) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
            <span className="text-xs font-bold text-slate-300">{val.substring(0,2).toUpperCase()}</span>
          </div>
          <span className="font-bold text-white">{val}</span>
        </div>
      ) 
    },
    { key: 'method', title: 'ช่องทางเชื่อมต่อ', render: (val: string) => <span className="text-blue-400 font-mono">{val}</span> },
    { key: 'frequency', title: 'ความถี่ Sync' },
    { 
      key: 'auth', 
      title: 'ระบบยืนยันตัวตน',
      render: (val: string) => (
        <div className="flex items-center gap-1.5 text-slate-400">
          <KeyRound className="w-3.5 h-3.5" />
          {val}
        </div>
      )
    },
    { 
      key: 'status', 
      title: 'สถานะ',
      render: (val: string) => (
        <Badge variant={val === 'ACTIVE' ? 'success' : 'neutral'}>
          {val}
        </Badge>
      )
    },
    { 
      key: 'actions', 
      title: 'ตั้งค่า',
      render: () => <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">จัดการ API Key</Button>
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-500" />
            ซัพพลายเออร์ & API
          </h1>
          <p className="text-slate-400">จัดการรายชื่อ Wholesale คู่ค้า และตั้งค่ารหัส API Key สำหรับดึงข้อมูลอัตโนมัติ</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> เพิ่มซัพพลายเออร์
        </Button>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
        <DataTable columns={columns} data={dummySuppliers} className="bg-transparent border-slate-700" />
      </div>
    </div>
  );
}
