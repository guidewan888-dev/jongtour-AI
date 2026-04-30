import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Search, Bell, Settings, ExternalLink, Mail, MailOpen } from "lucide-react";

export default async function MessagesPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Mock messages
  const messages = [
    {
      id: 1,
      sender: "ระบบจองทัวร์ Jongtour",
      avatar: "🤖",
      subject: "ยืนยันการรับชำระเงินมัดจำ (รหัสการจอง: AB7654321)",
      preview: "ทางเราได้รับยอดเงินมัดจำจำนวน 10,000 บาท ของท่านเรียบร้อยแล้ว กรุณาชำระส่วนที่เหลือก่อนวันเดินทาง 20 วัน...",
      date: "10:30 น.",
      isRead: false,
      tag: "การเงิน"
    },
    {
      id: 2,
      sender: "ฝ่ายบริการลูกค้า",
      avatar: "👩‍💼",
      subject: "ใบนัดหมายเตรียมตัวเดินทาง ทัวร์ยุโรปตะวันออก",
      preview: "สวัสดีค่ะ ใบนัดหมายและคู่มือเตรียมตัวเดินทางสำหรับทัวร์ยุโรปตะวันออกของท่านพร้อมแล้ว สามารถดาวน์โหลดได้ที่...",
      date: "เมื่อวาน",
      isRead: false,
      tag: "เอกสาร"
    },
    {
      id: 3,
      sender: "ระบบแจ้งเตือน",
      avatar: "🔔",
      subject: "ขอบคุณที่ร่วมเดินทางกับเรา (ทัวร์เกาหลี)",
      preview: "หวังว่าท่านจะได้รับความประทับใจจากการเดินทาง อย่าลืมเข้าไปรีวิวเพื่อรับ 100 เหรียญ Jongtour Coins นะคะ...",
      date: "12 ต.ค.",
      isRead: true,
      tag: "ระบบ"
    },
    {
      id: 4,
      sender: "Jongtour Promotion",
      avatar: "🎉",
      subject: "พิเศษสำหรับ VIP Silver! ส่วนลด 5% ทริปต่อไป",
      preview: "มอบของขวัญพิเศษสำหรับสมาชิกระดับ Silver เพียงกรอกโค้ด SILVER5 รับส่วนลดทันที...",
      date: "05 ต.ค.",
      isRead: true,
      tag: "โปรโมชั่น"
    }
  ];

  return (
    <div className="flex flex-col h-full min-h-[80vh]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ข้อความจากทัวร์</h1>
          <p className="text-sm text-gray-500 mt-1">อัปเดตสถานะการจองและข่าวสารต่างๆ ({messages.filter(m => !m.isRead).length} ข้อความใหม่)</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex-1 flex flex-col">
        {/* Inbox Header */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="ค้นหาข้อความ..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#5392f9] focus:ring-1 focus:ring-[#5392f9]"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-[#5392f9] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              ทั้งหมด
            </button>
            <button className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              ยังไม่อ่าน
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`group flex items-start gap-4 p-4 border-b border-gray-100 hover:bg-blue-50/30 transition-colors cursor-pointer ${!msg.isRead ? 'bg-white' : 'bg-gray-50/50'}`}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 bg-gray-100 shadow-inner">
                {msg.avatar}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-sm ${!msg.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                      {msg.sender}
                    </span>
                    {!msg.isRead && <span className="w-2 h-2 rounded-full bg-[#5392f9]"></span>}
                  </div>
                  <span className={`text-xs whitespace-nowrap ${!msg.isRead ? 'text-[#5392f9] font-bold' : 'text-gray-400'}`}>
                    {msg.date}
                  </span>
                </div>
                
                <h4 className={`text-sm truncate mb-1 ${!msg.isRead ? 'font-bold text-gray-800' : 'font-medium text-gray-600'}`}>
                  {msg.subject}
                </h4>
                
                <p className="text-xs text-gray-500 truncate line-clamp-1">
                  {msg.preview}
                </p>
              </div>

              {/* Tag & Actions */}
              <div className="hidden md:flex flex-col items-end gap-2 shrink-0">
                <span className="px-2.5 py-1 text-[10px] font-bold bg-gray-100 text-gray-600 rounded-md">
                  {msg.tag}
                </span>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button className="p-1.5 text-gray-400 hover:text-[#5392f9] hover:bg-blue-100 rounded-md transition-colors" title="ทำเครื่องหมายว่าอ่านแล้ว">
                    {msg.isRead ? <Mail className="w-4 h-4" /> : <MailOpen className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 text-center">
          <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
            <Bell className="w-3.5 h-3.5" /> แจ้งเตือนทั้งหมดอัปเดตล่าสุดเมื่อสักครู่นี้
          </p>
        </div>
      </div>
    </div>
  );
}
