"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Search, User, MapPin, Users, Calendar, CreditCard, Save, CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateBookingManualPage() {
  const router = useRouter();
  
  const [isSearchingUser, setIsSearchingUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [paxCount, setPaxCount] = useState(1);
  const [selectedTourId, setSelectedTourId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Mock Tours
  const tours = [
    { id: "T001", title: "ทัวร์ญี่ปุ่น โตเกียว ฟูจิ (6D4N)", price: 45900, date: "15-20 พ.ย. 2026", available: 12 },
    { id: "T002", title: "ทัวร์ยุโรปตะวันออก (8D5N)", price: 159000, date: "10-17 ธ.ค. 2026", available: 4 },
    { id: "T003", title: "ทัวร์เกาหลี โซล (5D3N)", price: 25900, date: "05-09 ม.ค. 2027", available: 20 },
  ];

  const handleSearchUser = () => {
    setIsSearchingUser(true);
    setTimeout(() => {
      if (searchQuery.includes("สมชาย") || searchQuery.includes("081")) {
        setSelectedUser({ name: "คุณสมชาย ใจดี", phone: "081-234-5678", email: "somchai@email.com", isVip: true });
      } else {
        setSelectedUser({ name: "ลูกค้าใหม่", phone: searchQuery, email: "-", isNew: true });
      }
      setIsSearchingUser(false);
    }, 1000);
  };

  const handleCreate = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/admin");
      }, 2000);
    }, 1500);
  };

  const selectedTour = tours.find(t => t.id === selectedTourId);
  const totalPrice = selectedTour ? selectedTour.price * paxCount : 0;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/bookings" className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">สร้างการจองใหม่ (Manual Booking)</h2>
          <p className="text-gray-500 mt-1">ทำรายการจองให้ลูกค้าผ่านช่องทาง Line / โทรศัพท์</p>
        </div>
      </div>

      {isSuccess ? (
        <div className="bg-white rounded-2xl border border-green-200 shadow-sm p-12 text-center animate-fade-in-up">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">สร้างการจองสำเร็จ!</h2>
          <p className="text-gray-500 mb-2">ระบบได้ส่งลิงก์ชำระเงินและรายละเอียดการจองไปให้ลูกค้าเรียบร้อยแล้ว</p>
          <p className="text-sm text-gray-400">กำลังพากลับหน้าหลัก...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section 1: Customer */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" /> ข้อมูลลูกค้า (ผู้จองหลัก)
            </h3>
            
            {!selectedUser ? (
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="ค้นหาจากเบอร์โทรศัพท์ หรือ ชื่อ..." 
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchUser()}
                  />
                </div>
                <button 
                  onClick={handleSearchUser}
                  disabled={isSearchingUser || !searchQuery}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2 min-w-[120px] justify-center"
                >
                  {isSearchingUser ? <Loader2 className="w-5 h-5 animate-spin" /> : "ค้นหา"}
                </button>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-gray-900 text-lg">{selectedUser.name}</p>
                    {selectedUser.isVip && <span className="bg-gradient-to-r from-amber-400 to-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">VIP Tier</span>}
                    {selectedUser.isNew && <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">ลูกค้ารายใหม่</span>}
                  </div>
                  <p className="text-sm text-gray-600">เบอร์โทร: {selectedUser.phone} | อีเมล: {selectedUser.email}</p>
                </div>
                <button 
                  onClick={() => { setSelectedUser(null); setSearchQuery(""); }}
                  className="text-sm font-bold text-blue-600 hover:underline"
                >
                  เปลี่ยนลูกค้า
                </button>
              </div>
            )}
          </div>

          {/* Section 2: Tour Selection */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 opacity-100 transition-opacity">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rose-500" /> เลือกโปรแกรมทัวร์
            </h3>
            <div className="space-y-3">
              {tours.map(tour => (
                <label 
                  key={tour.id}
                  className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                    selectedTourId === tour.id ? 'border-blue-500 bg-blue-50/30 ring-1 ring-blue-500' : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="tour_selection" 
                    className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 mr-4"
                    checked={selectedTourId === tour.id}
                    onChange={() => setSelectedTourId(tour.id)}
                  />
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-lg">{tour.title}</p>
                    <div className="flex gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {tour.date}</span>
                      <span className="flex items-center gap-1"><Users className="w-4 h-4" /> ว่าง {tour.available} ที่นั่ง</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-blue-600 text-lg">฿{tour.price.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">/ ท่าน</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Section 3: Pax & Price */}
          {selectedTourId && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 animate-fade-in-up">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-500" /> สรุปยอดและจำนวนผู้เดินทาง
              </h3>
              
              <div className="flex flex-col md:flex-row justify-between items-center bg-gray-50 p-6 rounded-xl border border-gray-100 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-2">จำนวนผู้เดินทางทั้งหมด (Pax)</p>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setPaxCount(Math.max(1, paxCount - 1))}
                      className="w-10 h-10 bg-white border border-gray-300 rounded-lg flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100"
                    >-</button>
                    <span className="text-2xl font-black w-8 text-center">{paxCount}</span>
                    <button 
                      onClick={() => setPaxCount(Math.min(selectedTour?.available || 99, paxCount + 1))}
                      className="w-10 h-10 bg-white border border-gray-300 rounded-lg flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100"
                    >+</button>
                  </div>
                </div>

                <div className="w-full md:w-px md:h-16 bg-gray-200 hidden md:block"></div>

                <div className="text-right w-full md:w-auto">
                  <p className="text-sm text-gray-500 mb-1">ยอดรวมทั้งสิ้น (Total Price)</p>
                  <p className="text-4xl font-black text-gray-900">฿{totalPrice.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex justify-end pt-4">
            <button 
              onClick={handleCreate}
              disabled={!selectedUser || !selectedTourId || isSubmitting}
              className="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors shadow-xl shadow-gray-900/20 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <><Loader2 className="w-6 h-6 animate-spin" /> กำลังบันทึกข้อมูล...</>
              ) : (
                <><Save className="w-6 h-6" /> สร้างรายการจองเดี๋ยวนี้</>
              )}
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
