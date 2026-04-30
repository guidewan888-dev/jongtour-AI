"use client";

import { useState } from "react";
import { RefreshCcw, CheckCircle2, AlertTriangle, AlertCircle, Clock, Database, Globe, Zap, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

export default function ApiSyncStatusPage() {
  const [isSyncingGo365, setIsSyncingGo365] = useState(false);
  const [lastSyncGo365, setLastSyncGo365] = useState("วันนี้ 08:00 น.");
  const [go365Count, setGo365Count] = useState(1420);

  const [isSyncingZego, setIsSyncingZego] = useState(false);
  const [lastSyncZego, setLastSyncZego] = useState("วันนี้ 08:05 น.");
  const [zegoCount, setZegoCount] = useState(1);

  const handleForceSync = async () => {
    setIsSyncingGo365(true);
    try {
      const res = await fetch('/api/sync/go365', { method: 'POST' });
      const data = await res.json();
      if (data.data?.added) {
        setGo365Count(prev => prev + data.data.added);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncingGo365(false);
      const now = new Date();
      setLastSyncGo365(`วันนี้ ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} น.`);
    }
  };

  const handleForceSyncZego = async () => {
    setIsSyncingZego(true);
    try {
      const res = await fetch('/api/sync/zego', { method: 'POST' });
      const data = await res.json();
      if (data.stats?.toursProcessed) {
        setZegoCount(data.stats.toursProcessed);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncingZego(false);
      const now = new Date();
      setLastSyncZego(`วันนี้ ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} น.`);
    }
  };

  const logs = [
    { id: 1, time: "วันนี้ 08:00 น.", system: "Go365 API", action: "Scheduled Sync (Daily)", status: "Success", details: "อัปเดตราคา 12 ทัวร์, เพิ่ม 5 ทัวร์ใหม่" },
    { id: 2, time: "เมื่อวาน 23:15 น.", system: "Kasikorn API", action: "Payment Verification", status: "Success", details: "ตรวจสอบยอดเงินเข้า BK-12345678 อัตโนมัติ" },
    { id: 3, time: "เมื่อวาน 08:00 น.", system: "Go365 API", action: "Scheduled Sync (Daily)", status: "Warning", details: "โหลดรูปภาพบางทัวร์ไม่สำเร็จ (Timeout)" },
    { id: 4, time: "05 ต.ค. 26 14:30 น.", system: "Zego API", action: "Connection Test", status: "Failed", details: "API Key หมดอายุ หรือถูกปฏิเสธการเข้าถึง" },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            สถานะ API Sync (System Connections)
          </h2>
          <p className="text-gray-500 mt-1">ตรวจสอบสถานะการเชื่อมต่อและอัปเดตข้อมูลทัวร์จากระบบภายนอก (Wholesale)</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-200">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-bold">All Systems Operational</span>
        </div>
      </div>

      {/* API Connections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Go365 Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-inner shadow-blue-800/50">
                G3
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-900">Go365 API</h3>
                <p className="text-sm text-gray-500">Primary Tour Provider</p>
              </div>
            </div>
            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border border-green-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> Online
            </div>
          </div>
          
          <div className="p-6 bg-gray-50/50">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5"><ArrowDownToLine className="w-4 h-4" /> ดึงทัวร์ล่าสุด</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{go365Count.toLocaleString()} <span className="text-xs font-normal text-gray-500">รายการ</span></p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5"><Clock className="w-4 h-4" /> อัปเดตล่าสุด</p>
                <p className="text-sm font-bold text-indigo-600 mt-2">{lastSyncGo365}</p>
              </div>
            </div>
            
            <button 
              onClick={handleForceSync}
              disabled={isSyncingGo365}
              className="w-full py-3 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isSyncingGo365 ? (
                <><RefreshCcw className="w-5 h-5 animate-spin" /> กำลังซิงค์ข้อมูล...</>
              ) : (
                <><RefreshCcw className="w-5 h-5" /> สั่งซิงค์ข้อมูลเดี๋ยวนี้ (Manual Sync)</>
              )}
            </button>
          </div>
        </div>

        {/* Zego Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-inner shadow-orange-700/50">
                ZG
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-900">Zego API</h3>
                <p className="text-sm text-gray-500">Secondary Provider</p>
              </div>
            </div>
            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border border-green-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> Online
            </div>
          </div>
          
          <div className="p-6 bg-gray-50/50">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5"><ArrowDownToLine className="w-4 h-4" /> ดึงทัวร์ล่าสุด</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{zegoCount.toLocaleString()} <span className="text-xs font-normal text-gray-500">รายการ</span></p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5"><Clock className="w-4 h-4" /> อัปเดตล่าสุด</p>
                <p className="text-sm font-bold text-indigo-600 mt-2">{lastSyncZego}</p>
              </div>
            </div>
            
            <button 
              onClick={handleForceSyncZego}
              disabled={isSyncingZego}
              className="w-full py-3 bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isSyncingZego ? (
                <><RefreshCcw className="w-5 h-5 animate-spin" /> กำลังซิงค์ข้อมูล...</>
              ) : (
                <><RefreshCcw className="w-5 h-5" /> สั่งซิงค์ข้อมูล Zego (Manual Sync)</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sync Logs Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-8">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" /> ประวัติการซิงค์ข้อมูล (Sync Logs)
          </h3>
          <button className="text-sm text-indigo-600 font-bold hover:underline">ส่งออก Log (.csv)</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
                <th className="p-4 font-bold">เวลา</th>
                <th className="p-4 font-bold">ระบบ (System)</th>
                <th className="p-4 font-bold">ประเภท (Action)</th>
                <th className="p-4 font-bold">สถานะ</th>
                <th className="p-4 font-bold">รายละเอียดเพิ่มเติม</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-500 flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {log.time}</td>
                  <td className="p-4 font-bold text-gray-800">{log.system}</td>
                  <td className="p-4 text-gray-600">{log.action}</td>
                  <td className="p-4">
                    {log.status === 'Success' && <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded text-xs font-bold border border-green-200">สำเร็จ</span>}
                    {log.status === 'Warning' && <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded text-xs font-bold border border-amber-200">เตือน</span>}
                    {log.status === 'Failed' && <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded text-xs font-bold border border-red-200">ล้มเหลว</span>}
                  </td>
                  <td className="p-4 text-gray-600">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
