"use client";
import * as React from 'react';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Ticket, Search, Plus, Gift, Percent, Calendar } from 'lucide-react';

export default function PromotionsManagerPage() {
  const [activeTab, setActiveTab] = React.useState<'coupons' | 'campaigns'>('coupons');

  const dummyCoupons = [
    { code: 'JONGTOUR2026', type: 'Fixed', discount: '฿1,000', minSpend: '฿30,000', usage: '45/100', status: 'Active' },
    { code: 'EARLYBIRD500', type: 'Fixed', discount: '฿500', minSpend: '฿15,000', usage: '89/∞', status: 'Active' },
    { code: 'JAPAN10', type: 'Percent', discount: '10%', minSpend: '฿0', usage: '500/500', status: 'Expired' },
  ];

  const dummyCampaigns = [
    { name: 'Early Bird ต้อนรับปีใหม่', type: 'จองล่วงหน้า 90 วัน', discount: 'ลด ฿1,500/ที่นั่ง', applyTo: 'ทุกทัวร์', status: 'Active' },
    { name: 'ยิ่งเที่ยวยิ่งคุ้ม', type: 'จองเป็นกลุ่ม 4 คน+', discount: 'ลดเพิ่ม ฿500/ที่นั่ง', applyTo: 'เฉพาะโซนยุโรป', status: 'Active' },
  ];

  const couponColumns = [
    { key: 'code', title: 'รหัสโค้ด', render: (val: string) => <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">{val}</span> },
    { key: 'type', title: 'ประเภท' },
    { key: 'discount', title: 'ส่วนลด', render: (val: string) => <span className="text-white font-semibold">{val}</span> },
    { key: 'minSpend', title: 'ขั้นต่ำ' },
    { key: 'usage', title: 'สิทธิ์ที่ใช้' },
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

  const campaignColumns = [
    { key: 'name', title: 'ชื่อแคมเปญ', render: (val: string) => <span className="font-semibold text-white">{val}</span> },
    { key: 'type', title: 'เงื่อนไข' },
    { key: 'discount', title: 'ส่วนลดอัตโนมัติ', render: (val: string) => <span className="text-emerald-400 font-semibold">{val}</span> },
    { key: 'applyTo', title: 'ใช้กับ' },
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
            <Ticket className="w-8 h-8 text-amber-500" />
            คูปอง & โปรโมชั่น
          </h1>
          <p className="text-slate-400">ระบบสร้างโค้ดส่วนลดและแคมเปญกระตุ้นยอดขายทัวร์</p>
        </div>
        <Button className="bg-amber-600 hover:bg-amber-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> สร้างโปรโมชั่นใหม่
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setActiveTab('coupons')}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border transition-all ${
            activeTab === 'coupons' 
              ? 'bg-amber-500/10 border-amber-500/50 text-amber-400' 
              : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Percent className="w-5 h-5" />
          <span className="font-bold">คูปองส่วนลด (Promo Codes)</span>
        </button>
        <button 
          onClick={() => setActiveTab('campaigns')}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border transition-all ${
            activeTab === 'campaigns' 
              ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
              : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Gift className="w-5 h-5" />
          <span className="font-bold">แคมเปญอัตโนมัติ (Auto-Campaigns)</span>
        </button>
      </div>

      {activeTab === 'coupons' && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input 
                placeholder="ค้นหารหัสคูปอง..." 
                className="pl-10 bg-slate-900 border-slate-700 text-white focus-visible:ring-amber-500/50"
              />
            </div>
            <select className="bg-slate-900 border border-slate-700 text-white rounded-xl px-4 outline-none focus:ring-2 focus:ring-amber-500">
              <option>ทุกสถานะ</option>
              <option>Active</option>
              <option>Expired</option>
            </select>
          </div>
          <DataTable columns={couponColumns} data={dummyCoupons} className="bg-transparent border-slate-700" />
        </div>
      )}

      {activeTab === 'campaigns' && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input 
                placeholder="ค้นหาชื่อแคมเปญ..." 
                className="pl-10 bg-slate-900 border-slate-700 text-white focus-visible:ring-emerald-500/50"
              />
            </div>
          </div>
          <DataTable columns={campaignColumns} data={dummyCampaigns} className="bg-transparent border-slate-700" />
        </div>
      )}
    </div>
  );
}
