import { BarChart3, PieChart, TrendingUp, Download } from 'lucide-react';

export default function ConsolidatedReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Consolidated Reports</h1>
          <p className="text-sm text-gray-500">รายงานสรุปผลประกอบการดึงข้อมูลจากทุก Subdomain (Booking, Agent, Sale)</p>
        </div>
        <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-bold shadow-sm transition-colors flex items-center gap-2 text-sm">
          <Download size={16} /> Export Master Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1 */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <BarChart3 className="text-orange-500" size={20} /> Revenue by Channel
            </h2>
            <select className="text-sm border border-gray-200 rounded px-2 py-1 outline-none">
              <option>This Month</option>
              <option>Last Month</option>
            </select>
          </div>
          <div className="h-64 flex items-end gap-4 px-4 pb-4">
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-blue-500 rounded-t-sm h-[40%]"></div>
              <span className="text-xs text-gray-500 font-bold">B2C (Booking)</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-emerald-500 rounded-t-sm h-[80%]"></div>
              <span className="text-xs text-gray-500 font-bold">B2B (Agent)</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-purple-500 rounded-t-sm h-[60%]"></div>
              <span className="text-xs text-gray-500 font-bold">Telesales</span>
            </div>
          </div>
        </div>

        {/* Chart 2 */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="text-orange-500" size={20} /> Top Destinations
            </h2>
            <select className="text-sm border border-gray-200 rounded px-2 py-1 outline-none">
              <option>This Year</option>
            </select>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-bold text-gray-700">Japan (Hokkaido, Tokyo)</span>
                <span className="font-bold text-gray-900">45%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-bold text-gray-700">Europe (Swiss, Italy)</span>
                <span className="font-bold text-gray-900">30%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-orange-400 h-2 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-bold text-gray-700">Vietnam (Danang)</span>
                <span className="font-bold text-gray-900">15%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-orange-300 h-2 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
