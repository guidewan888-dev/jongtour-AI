"use client";

import { useState, useEffect } from "react";
import { RefreshCcw, CheckCircle2, AlertTriangle, AlertCircle, Clock, Database, Globe, Zap, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

export default function ApiSyncStatusPage() {
  const [isSyncingTourFactory, setIsSyncingTourFactory] = useState(false);
  const [lastSyncTourFactory, setLastSyncTourFactory] = useState("-");
  const [tourFactoryCount, setTourFactoryCount] = useState(0);

  const [isSyncingZego, setIsSyncingZego] = useState(false);
  const [lastSyncZego, setLastSyncZego] = useState("-");
  const [zegoCount, setZegoCount] = useState(0);

  const [isSyncingCheckIn, setIsSyncingCheckIn] = useState(false);
  const [lastSyncCheckIn, setLastSyncCheckIn] = useState("-");
  const [checkInCount, setCheckInCount] = useState(0);


  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // Settings states
  const [autoSyncSettings, setAutoSyncSettings] = useState({
    SUP_LETGO: true,
    SUP_TOURFACTORY: true,
    SUP_CHECKIN: true,
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/sync');
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
        
        // Update stats from logs
        const zegoLog = data.logs.find((l: any) => l.supplierId === 'SUP_LETGO' && l.status === 'SUCCESS');
        if (zegoLog) {
          const dateStr = zegoLog.createdAt.endsWith('Z') ? zegoLog.createdAt : `${zegoLog.createdAt}Z`;
          const date = new Date(dateStr);
          setLastSyncZego(`${date.toLocaleDateString('th-TH')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} น.`);
          setZegoCount(zegoLog.recordsAdded || 0);
        }

        const tfLog = data.logs.find((l: any) => l.supplierId === 'SUP_TOURFACTORY' && l.status === 'SUCCESS');
        if (tfLog) {
          const dateStr = tfLog.createdAt.endsWith('Z') ? tfLog.createdAt : `${tfLog.createdAt}Z`;
          const date = new Date(dateStr);
          setLastSyncTourFactory(`${date.toLocaleDateString('th-TH')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} น.`);
          setTourFactoryCount(tfLog.recordsAdded || 0);
        }

        const checkinLog = data.logs.find((l: any) => l.supplierId === 'SUP_CHECKIN' && l.status === 'SUCCESS');
        if (checkinLog) {
          const dateStr = checkinLog.createdAt.endsWith('Z') ? checkinLog.createdAt : `${checkinLog.createdAt}Z`;
          const date = new Date(dateStr);
          setLastSyncCheckIn(`${date.toLocaleDateString('th-TH')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} น.`);
          setCheckInCount(checkinLog.recordsAdded || 0);
        }
      }
    } catch (error) {
      console.error("Failed to fetch logs", error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/sync/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        setAutoSyncSettings(data.settings);
      }
    } catch (error) {
      console.error("Failed to fetch settings", error);
    }
  };

  const toggleAutoSync = async (supplierId: string, currentStatus: boolean) => {
    setIsSavingSettings(true);
    const newStatus = !currentStatus;
    
    // Optimistic update
    setAutoSyncSettings(prev => ({ ...prev, [supplierId]: newStatus }));
    
    try {
      const res = await fetch('/api/admin/sync/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplierId, isActive: newStatus })
      });
      const data = await res.json();
      if (!data.success) {
        // Revert on failure
        setAutoSyncSettings(prev => ({ ...prev, [supplierId]: currentStatus }));
        alert("Failed to save setting: " + data.message);
      }
    } catch (e) {
      // Revert on error
      setAutoSyncSettings(prev => ({ ...prev, [supplierId]: currentStatus }));
      alert("Network error while saving settings");
    } finally {
      setIsSavingSettings(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchSettings();
  }, []);

  const handleForceSyncTourFactory = async () => {
    setIsSyncingTourFactory(true);
    try {
      const res = await fetch('/api/admin/sync', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplierId: 'SUP_TOURFACTORY' }) 
      });
      const data = await res.json();
      if (data.success) {
        await fetchLogs();
      } else {
        alert("Sync failed: " + data.message);
      }
    } catch (e) {
      console.error(e);
      alert("Network error during sync");
    } finally {
      setIsSyncingTourFactory(false);
    }
  };

  const handleForceSyncZego = async () => {
    setIsSyncingZego(true);
    try {
      const res = await fetch('/api/admin/sync', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplierId: 'SUP_LETGO' }) 
      });
      const data = await res.json();
      if (data.success) {
        // Refresh logs to see the new entry
        await fetchLogs();
      } else {
        alert("Sync failed: " + data.message);
      }
    } catch (e) {
      console.error(e);
      alert("Network error during sync");
    } finally {
      setIsSyncingZego(false);
    }
  };

  const handleForceSyncCheckIn = async () => {
    setIsSyncingCheckIn(true);
    try {
      const res = await fetch('/api/admin/sync', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplierId: 'SUP_CHECKIN' }) 
      });
      const data = await res.json();
      if (data.success) {
        await fetchLogs();
      } else {
        alert("Sync failed: " + data.message);
      }
    } catch (e) {
      console.error(e);
      alert("Network error during sync");
    } finally {
      setIsSyncingCheckIn(false);
    }
  };


  const formatDate = (dateString: string) => {
    const dStr = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
    const d = new Date(dStr);
    return `${d.toLocaleDateString('th-TH')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} น.`;
  };

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
        
        {/* TourFactory Card */}
        <div className="bg-white rounded-2xl border border-rose-200 shadow-md overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>
          <div className="p-6 border-b border-gray-100 flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-rose-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-inner shadow-rose-800/50">
                TF
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-900">Tour Factory API</h3>
                <p className="text-sm text-gray-500">Active API Adapter</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border border-green-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> Online
              </div>
              <button 
                onClick={() => toggleAutoSync('SUP_TOURFACTORY', autoSyncSettings.SUP_TOURFACTORY)}
                disabled={isSavingSettings}
                className={`text-xs px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors ${
                  autoSyncSettings.SUP_TOURFACTORY 
                    ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' 
                    : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${autoSyncSettings.SUP_TOURFACTORY ? 'bg-rose-500 animate-pulse' : 'bg-gray-400'}`}></div>
                {autoSyncSettings.SUP_TOURFACTORY ? 'Auto-Sync: ON (ทุกชม.)' : 'Auto-Sync: OFF (หยุดชั่วคราว)'}
              </button>
            </div>
          </div>
          
          <div className="p-6 bg-rose-50/30">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl border border-rose-100 shadow-sm">
                <p className="text-xs text-rose-500 font-bold flex items-center gap-1.5"><ArrowDownToLine className="w-4 h-4" /> ซิงค์ล่าสุด (Tours)</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{tourFactoryCount.toLocaleString()} <span className="text-xs font-normal text-gray-500">รายการ</span></p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-rose-100 shadow-sm">
                <p className="text-xs text-rose-500 font-bold flex items-center gap-1.5"><Clock className="w-4 h-4" /> เวลาอัปเดตล่าสุด</p>
                <p className="text-sm font-bold text-rose-700 mt-2">{lastSyncTourFactory}</p>
              </div>
            </div>
            
            <button 
              onClick={handleForceSyncTourFactory}
              disabled={isSyncingTourFactory}
              className="w-full py-3 bg-rose-600 text-white hover:bg-rose-700 border border-rose-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-70 shadow-sm"
            >
              {isSyncingTourFactory ? (
                <><RefreshCcw className="w-5 h-5 animate-spin" /> กำลังดูดข้อมูลจาก Tour Factory...</>
              ) : (
                <><RefreshCcw className="w-5 h-5" /> สั่งซิงค์ข้อมูล (Manual Sync)</>
              )}
            </button>
          </div>
        </div>

        {/* Zego Card */}
        <div className="bg-white rounded-2xl border border-indigo-200 shadow-md overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
          <div className="p-6 border-b border-gray-100 flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-inner shadow-indigo-800/50">
                LG
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-900">Let's Go / Zego</h3>
                <p className="text-sm text-gray-500">Active API Adapter</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border border-green-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> Online
              </div>
              <button 
                onClick={() => toggleAutoSync('SUP_LETGO', autoSyncSettings.SUP_LETGO)}
                disabled={isSavingSettings}
                className={`text-xs px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors ${
                  autoSyncSettings.SUP_LETGO 
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' 
                    : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${autoSyncSettings.SUP_LETGO ? 'bg-indigo-500 animate-pulse' : 'bg-gray-400'}`}></div>
                {autoSyncSettings.SUP_LETGO ? 'Auto-Sync: ON (ทุกชม.)' : 'Auto-Sync: OFF (หยุดชั่วคราว)'}
              </button>
            </div>
          </div>
          
          <div className="p-6 bg-indigo-50/30">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                <p className="text-xs text-indigo-500 font-bold flex items-center gap-1.5"><ArrowDownToLine className="w-4 h-4" /> ซิงค์ล่าสุด (Tours)</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{zegoCount.toLocaleString()} <span className="text-xs font-normal text-gray-500">รายการ</span></p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                <p className="text-xs text-indigo-500 font-bold flex items-center gap-1.5"><Clock className="w-4 h-4" /> เวลาอัปเดตล่าสุด</p>
                <p className="text-sm font-bold text-indigo-700 mt-2">{lastSyncZego}</p>
              </div>
            </div>
            
            <button 
              onClick={handleForceSyncZego}
              disabled={isSyncingZego}
              className="w-full py-3 bg-indigo-600 text-white hover:bg-indigo-700 border border-indigo-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-70 shadow-sm"
            >
              {isSyncingZego ? (
                <><RefreshCcw className="w-5 h-5 animate-spin" /> กำลังดูดข้อมูลจาก Let's Go...</>
              ) : (
                <><RefreshCcw className="w-5 h-5" /> สั่งซิงค์ข้อมูล (Manual Sync)</>
              )}
            </button>
          </div>
        </div>

        {/* CheckIn Card */}
        <div className="bg-white rounded-2xl border border-teal-200 shadow-md overflow-hidden relative mt-6 lg:mt-0">
          <div className="absolute top-0 left-0 w-full h-1 bg-teal-500"></div>
          <div className="p-6 border-b border-gray-100 flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-teal-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-inner shadow-teal-800/50">
                CI
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-900">Check In Group</h3>
                <p className="text-sm text-gray-500">Active API Adapter</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border border-green-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> Online
              </div>
              <button 
                onClick={() => toggleAutoSync('SUP_CHECKIN', autoSyncSettings.SUP_CHECKIN)}
                disabled={isSavingSettings}
                className={`text-xs px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors ${
                  autoSyncSettings.SUP_CHECKIN 
                    ? 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100' 
                    : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${autoSyncSettings.SUP_CHECKIN ? 'bg-teal-500 animate-pulse' : 'bg-gray-400'}`}></div>
                {autoSyncSettings.SUP_CHECKIN ? 'Auto-Sync: ON (ทุกชม.)' : 'Auto-Sync: OFF (หยุดชั่วคราว)'}
              </button>
            </div>
          </div>
          
          <div className="p-6 bg-teal-50/30">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl border border-teal-100 shadow-sm">
                <p className="text-xs text-teal-500 font-bold flex items-center gap-1.5"><ArrowDownToLine className="w-4 h-4" /> ซิงค์ล่าสุด (Tours)</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{checkInCount.toLocaleString()} <span className="text-xs font-normal text-gray-500">รายการ</span></p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-teal-100 shadow-sm">
                <p className="text-xs text-teal-500 font-bold flex items-center gap-1.5"><Clock className="w-4 h-4" /> เวลาอัปเดตล่าสุด</p>
                <p className="text-sm font-bold text-teal-700 mt-2">{lastSyncCheckIn}</p>
              </div>
            </div>
            
            <button 
              onClick={handleForceSyncCheckIn}
              disabled={isSyncingCheckIn}
              className="w-full py-3 bg-teal-600 text-white hover:bg-teal-700 border border-teal-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-70 shadow-sm"
            >
              {isSyncingCheckIn ? (
                <><RefreshCcw className="w-5 h-5 animate-spin" /> กำลังดูดข้อมูลจาก Check In...</>
              ) : (
                <><RefreshCcw className="w-5 h-5" /> สั่งซิงค์ข้อมูล (Manual Sync)</>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Sync Logs Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-8">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" /> ประวัติการซิงค์ข้อมูล (Real-time Database Logs)
          </h3>
          <button 
            onClick={fetchLogs} 
            className="text-sm text-indigo-600 font-bold hover:underline flex items-center gap-1"
          >
            <RefreshCcw className="w-3 h-3" /> รีเฟรช
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
                <th className="p-4 font-bold">เวลา</th>
                <th className="p-4 font-bold">Supplier ID</th>
                <th className="p-4 font-bold">ประเภท (Action)</th>
                <th className="p-4 font-bold">สถานะ</th>
                <th className="p-4 font-bold">รายละเอียดเพิ่มเติม</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loadingLogs ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">กำลังโหลดประวัติ...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">ยังไม่มีประวัติการซิงค์</td>
                </tr>
              ) : logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-500 flex items-center gap-2 whitespace-nowrap"><Clock className="w-3.5 h-3.5" /> {formatDate(log.createdAt)}</td>
                  <td className="p-4 font-bold text-gray-800">{log.supplierId}</td>
                  <td className="p-4 text-gray-600">{log.type}</td>
                  <td className="p-4">
                    {log.status === 'SUCCESS' && <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded text-xs font-bold border border-green-200">สำเร็จ</span>}
                    {log.status === 'RETRYING' && <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded text-xs font-bold border border-amber-200">กำลังลองใหม่</span>}
                    {log.status === 'FAILED' && <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded text-xs font-bold border border-red-200">ล้มเหลว</span>}
                    {log.status === 'RUNNING' && <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded text-xs font-bold border border-blue-200 animate-pulse">กำลังซิงค์</span>}
                  </td>
                  <td className="p-4 text-gray-600">
                    {log.status === 'SUCCESS' ? `อัปเดตทัวร์สำเร็จ ${log.recordsAdded} รายการ` : (log.errorMessage || '-')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
