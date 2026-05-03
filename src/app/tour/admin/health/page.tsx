"use client";
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Activity, Play, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

export default function LinkHealthPage() {
  const dummyHealthStats = {
    totalChecked: 15420,
    healthy: 15305,
    broken: 115,
    lastRun: 'วันนี้, 04:00 น.'
  };

  const dummyIssues = [
    { url: '/tour/jp-tyo-old', error: '404 Not Found', severity: 'High', source: 'Zego API (Tour Deleted)', status: 'Auto-Redirected' },
    { url: '/destinations/russia', error: 'No Active Tours', severity: 'Medium', source: 'Internal SEO Page', status: 'Needs Review' },
    { url: '/tour/eu-swi-005', error: 'Supplier ID Missing', severity: 'Critical', source: 'Letgo API', status: 'Unresolved' },
  ];

  const columns = [
    { key: 'url', title: 'หน้า URL ที่มีปัญหา', render: (val: string) => <a href={val} className="text-blue-400 hover:underline">{val}</a> },
    { 
      key: 'error', 
      title: 'สาเหตุ (Error)',
      render: (val: string) => (
        <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
          <XCircle className="w-4 h-4" /> {val}
        </span>
      )
    },
    { key: 'source', title: 'แหล่งที่มา' },
    { 
      key: 'severity', 
      title: 'ระดับความรุนแรง',
      render: (val: string) => (
        <Badge variant={val === 'Critical' ? 'error' : val === 'High' ? 'warning' : 'info'}>
          {val}
        </Badge>
      )
    },
    { 
      key: 'status', 
      title: 'การแก้ไข',
      render: (val: string) => (
        <Badge variant={val === 'Auto-Redirected' ? 'success' : 'warning'}>
          {val}
        </Badge>
      )
    },
    { 
      key: 'actions', 
      title: 'จัดการ',
      render: (val: any, row: any) => (
        <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
          {row.status === 'Auto-Redirected' ? 'ดู Log' : 'ตั้งค่า Redirect'}
        </Button>
      )
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Activity className="w-8 h-8 text-rose-500" />
            Link Health Monitor
          </h1>
          <p className="text-slate-400">ระบบสแกนและแก้ไขลิงก์เสีย (404) อัตโนมัติ เพื่อรักษาคะแนน SEO ของเว็บไซต์</p>
        </div>
        <Button className="bg-rose-600 hover:bg-rose-700 text-white">
          <Play className="w-4 h-4 mr-2" /> เริ่มสแกนเว็บตอนนี้
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-white">{dummyHealthStats.totalChecked.toLocaleString()}</p>
            <p className="text-sm text-slate-400 mt-1">ลิงก์ทั้งหมดที่ตรวจสอบแล้ว</p>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-emerald-400 text-sm font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full">99.2% Health Score</span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-emerald-400">{dummyHealthStats.healthy.toLocaleString()}</p>
            <p className="text-sm text-slate-400 mt-1">ลิงก์ที่ทำงานปกติ (Healthy)</p>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-rose-500/20 rounded-xl border border-rose-500/20">
              <AlertTriangle className="w-6 h-6 text-rose-400" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-rose-400">{dummyHealthStats.broken}</p>
            <p className="text-sm text-slate-400 mt-1">ลิงก์เสียที่ต้องแก้ไข (Broken Links)</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">รายงานลิงก์ที่มีปัญหาล่าสุด</h3>
          <p className="text-sm text-slate-500">สแกนครั้งล่าสุด: {dummyHealthStats.lastRun}</p>
        </div>
        <DataTable columns={columns} data={dummyIssues} className="bg-transparent border-slate-700" />
      </div>
    </div>
  );
}
