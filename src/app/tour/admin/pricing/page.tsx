"use client";
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Calculator, Plus, ArrowRight } from 'lucide-react';

export default function PricingRulesPage() {
  const dummyRules = [
    { name: 'กำไรมาตรฐาน Zego (ทั่วโลก)', target: 'Zego API', type: 'บวกเพิ่ม (Flat)', value: '+ 500 บาท / ที่นั่ง', status: 'Active' },
    { name: 'กำไร Letgo ยุโรป', target: 'Letgo API (ทวีปยุโรป)', type: 'เปอร์เซ็นต์ (%)', value: '+ 5%', status: 'Active' },
    { name: 'โปรโมททัวร์เกาหลี', target: 'ทุก Wholesale (ประเทศเกาหลี)', type: 'บวกเพิ่ม (Flat)', value: '+ 200 บาท / ที่นั่ง', status: 'Inactive' },
  ];

  const columns = [
    { key: 'name', title: 'ชื่อกฎการตั้งราคา', render: (val: string) => <span className="font-bold text-white">{val}</span> },
    { key: 'target', title: 'ใช้งานกับเป้าหมาย', render: (val: string) => <span className="text-blue-400">{val}</span> },
    { key: 'type', title: 'ประเภทกำไร' },
    { key: 'value', title: 'สูตรคำนวณ', render: (val: string) => <span className="font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">{val}</span> },
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
      render: () => <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">แก้ไข</Button>
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Calculator className="w-8 h-8 text-emerald-500" />
            กฎการตั้งราคา (Pricing Rules)
          </h1>
          <p className="text-slate-400">กำหนดสูตรบวกกำไร (Markup) อัตโนมัติเวลาดึงข้อมูลทัวร์จากฐานข้อมูลซัพพลายเออร์</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> สร้างกฎตั้งราคา
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 flex flex-col justify-center">
          <h3 className="text-lg font-bold text-white mb-4">ตัวอย่างการทำงานของสูตร</h3>
          <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-slate-800">
            <div>
              <p className="text-xs text-slate-500 mb-1">ราคาต้นทุน (Net Price)</p>
              <p className="text-lg font-bold text-slate-300">20,000 ฿</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-600" />
            <div className="text-center">
              <Badge variant="success" className="mb-1 text-xs">กำไรมาตรฐาน Zego</Badge>
              <p className="text-sm font-bold text-emerald-400">+ 500 ฿</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-600" />
            <div className="text-right">
              <p className="text-xs text-blue-400 mb-1">ราคาขายหน้าเว็บ (Selling Price)</p>
              <p className="text-2xl font-black text-white">20,500 ฿</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
        <DataTable columns={columns} data={dummyRules} className="bg-transparent border-slate-700" />
      </div>
    </div>
  );
}
