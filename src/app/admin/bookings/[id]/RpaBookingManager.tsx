"use client";

import { useState } from "react";
import { Bot, ChevronRight, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface RpaBookingManagerProps {
  bookingId: string;
  supplierId: string;
  currentSessions: any[];
}

export default function RpaBookingManager({ bookingId, supplierId, currentSessions }: RpaBookingManagerProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  // Get the most recent session
  const latestSession = currentSessions && currentSessions.length > 0 
    ? [...currentSessions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
    : null;

  const handleStartBot = async () => {
    if (!confirm("คุณต้องการสั่งให้บอทเริ่มทำการจองออเดอร์นี้ในระบบ Wholesale ใช่หรือไม่?")) return;
    
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/rpa/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, supplierId })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Unknown error");
      }
      
      alert("สั่งการบอทสำเร็จ! กรุณารอสักครู่แล้วรีเฟรชหน้าต่างนี้ หรือไปที่หน้า RPA Dashboard");
      // Force refresh the page to get the new session state
      window.location.reload();
    } catch (err: any) {
      alert("เกิดข้อผิดพลาด: " + err.message);
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WAITING_ADMIN_APPROVAL': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'SUBMITTED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'FAILED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-100 to-transparent opacity-50 rounded-bl-full"></div>
      
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Bot className="w-5 h-5 text-purple-600" /> Wholesale RPA Automation
      </h3>
      
      {!latestSession ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            ระบบสามารถดึงข้อมูลผู้เดินทางและไปกรอกฟอร์มจองทัวร์ในเว็บของ Wholesale ให้คุณได้อัตโนมัติ
          </p>
          <button 
            onClick={handleStartBot}
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? "กำลังสั่งการ..." : "🚀 ส่งจองด้วยบอทอัตโนมัติ"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className={`p-3 rounded-xl border ${getStatusColor(latestSession.status)}`}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold uppercase tracking-wider opacity-70">สถานะล่าสุด</span>
              <span className="text-xs opacity-70">{new Date(latestSession.createdAt).toLocaleString('th-TH')}</span>
            </div>
            <p className="font-bold flex items-center gap-2">
              {latestSession.status === 'COMPLETED' ? <CheckCircle2 className="w-4 h-4" /> : 
               latestSession.status === 'FAILED' ? <AlertTriangle className="w-4 h-4" /> : null}
              {latestSession.status.replace(/_/g, ' ')}
            </p>
            {latestSession.status === 'FAILED' && latestSession.errorMessage && (
              <p className="text-xs mt-2 opacity-80 line-clamp-2" title={latestSession.errorMessage}>
                {latestSession.errorMessage}
              </p>
            )}
          </div>
          
          <div className="flex flex-col gap-2">
            {latestSession.status === 'WAITING_ADMIN_APPROVAL' && (
              <Link 
                href="/admin/rpa" 
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2.5 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 text-sm"
              >
                ดูรูป Screenshot และกด Approve
              </Link>
            )}
            
            {(latestSession.status === 'COMPLETED' || latestSession.status === 'FAILED') && (
              <button 
                onClick={handleStartBot}
                disabled={isLoading}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-medium py-2 rounded-xl transition-colors text-sm"
              >
                {isLoading ? "กำลังสั่งการ..." : "🔄 ลองสั่งบอททำงานใหม่อีกครั้ง"}
              </button>
            )}
            
            <Link 
              href="/admin/rpa" 
              className="text-xs text-center text-purple-600 hover:text-purple-800 flex items-center justify-center gap-1 mt-2 font-medium"
            >
              ไปที่หน้า Dashboard รวมบอท <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
