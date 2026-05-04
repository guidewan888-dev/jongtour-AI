import { Plus, Settings, Key, Code } from 'lucide-react';

export default function SupplierMasterPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 mb-1">Supplier Master Config</h1>
          <p className="text-slate-500 text-xs">จัดการข้อมูล Wholesale (Supplier ID คือหัวใจหลักของระบบ)</p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded flex items-center gap-2 transition-colors">
          <Plus size={14} /> Add New Supplier
        </button>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-black text-slate-500 border-b border-slate-800 font-mono">
            <tr>
              <th className="px-5 py-3 font-medium">SUPPLIER_ID (UUID)</th>
              <th className="px-5 py-3 font-medium">COMPANY NAME</th>
              <th className="px-5 py-3 font-medium">ALIAS (System)</th>
              <th className="px-5 py-3 font-medium">CONNECTION TYPE</th>
              <th className="px-5 py-3 font-medium">STATUS</th>
              <th className="px-5 py-3 font-medium text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
            {/* Sup 1 */}
            <tr className="hover:bg-slate-900">
              <td className="px-5 py-4 text-slate-500">5f8a9b21-4c1d-48e2-9b0d-1c2a3f4e5d6b</td>
              <td className="px-5 py-4 font-bold text-white font-sans">Let's Go Group Co., Ltd.</td>
              <td className="px-5 py-4 text-emerald-400">letgo_group</td>
              <td className="px-5 py-4">
                <span className="flex items-center gap-1"><Code size={12}/> REST_API_V2</span>
              </td>
              <td className="px-5 py-4"><span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded text-[10px]">ACTIVE</span></td>
              <td className="px-5 py-4 text-right">
                <div className="flex justify-end gap-3">
                  <button className="text-slate-400 hover:text-white" title="API Credentials"><Key size={14}/></button>
                  <button className="text-slate-400 hover:text-white" title="Settings"><Settings size={14}/></button>
                </div>
              </td>
            </tr>
            {/* Sup 2 */}
            <tr className="hover:bg-slate-900">
              <td className="px-5 py-4 text-slate-500">8a1c4d92-2b3f-4e5a-8d7c-6b5a4f3e2d1c</td>
              <td className="px-5 py-4 font-bold text-white font-sans">Go 365 Tours Thailand</td>
              <td className="px-5 py-4 text-emerald-400">go365_tours</td>
              <td className="px-5 py-4">
                <span className="flex items-center gap-1"><Code size={12}/> REST_API_V1</span>
              </td>
              <td className="px-5 py-4"><span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded text-[10px]">ACTIVE</span></td>
              <td className="px-5 py-4 text-right">
                <div className="flex justify-end gap-3">
                  <button className="text-slate-400 hover:text-white" title="API Credentials"><Key size={14}/></button>
                  <button className="text-slate-400 hover:text-white" title="Settings"><Settings size={14}/></button>
                </div>
              </td>
            </tr>
            {/* Sup 3 */}
            <tr className="hover:bg-slate-900 opacity-60">
              <td className="px-5 py-4 text-slate-500">1c5d8a22-3e4f-5b6c-7d8e-9a0b1c2d3e4f</td>
              <td className="px-5 py-4 font-bold text-white font-sans">Siam Orchard Group</td>
              <td className="px-5 py-4 text-emerald-400">siam_orchard</td>
              <td className="px-5 py-4">
                <span className="flex items-center gap-1 text-orange-400">PDF_OCR_ONLY</span>
              </td>
              <td className="px-5 py-4"><span className="px-2 py-1 bg-slate-500/10 text-slate-400 rounded text-[10px]">MANUAL</span></td>
              <td className="px-5 py-4 text-right">
                <div className="flex justify-end gap-3">
                  <button className="text-slate-400 hover:text-white disabled" title="No API Key needed"><Key size={14}/></button>
                  <button className="text-slate-400 hover:text-white" title="Settings"><Settings size={14}/></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
