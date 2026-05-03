import Link from "next/link";
import { Settings, Globe, CreditCard, Bell, Building, DollarSign, Mail, MessageCircle, Sliders } from "lucide-react";

export const dynamic = 'force-dynamic';

export default function AdminSettingsHubPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const activeTab = searchParams.tab || "company";

  const tabs = [
    { id: "company", name: "Company Profile", icon: Building },
    { id: "payment", name: "Payment Gateway", icon: CreditCard },
    { id: "notification", name: "Notification", icon: Bell },
    { id: "tax", name: "Tax", icon: DollarSign },
    { id: "currency", name: "Currency", icon: Globe },
    { id: "email", name: "Email Template", icon: Mail },
    { id: "line-whatsapp", name: "LINE / WhatsApp", icon: MessageCircle },
    { id: "system", name: "System Config", icon: Sliders },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">ตั้งค่าระบบ (System Settings)</h2>
          <p className="text-gray-500">จัดการข้อมูลบริษัท ช่องทางชำระเงิน การแจ้งเตือน และการตั้งค่าพื้นฐานอื่นๆ</p>
        </div>
        <button className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-colors">
          บันทึกการตั้งค่า
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px]">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-100 overflow-x-auto custom-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <Link 
                key={tab.id}
                href={`?tab=${tab.id}`}
                scroll={false}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap
                  ${isActive ? 'border-orange-500 text-orange-600 bg-orange-50/50' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'}
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </Link>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="p-8">
          {activeTab === 'company' ? (
            <div className="max-w-2xl space-y-6">
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">ข้อมูลบริษัท (Company Profile)</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">ชื่อบริษัท (Company Name)</label>
                  <input type="text" defaultValue="บริษัท จงทัวร์ จำกัด" className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-orange-500" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">ที่อยู่ (Address)</label>
                  <textarea defaultValue="123 ถนนสุขุมวิท แขวงคลองเตยเหนือ เขตวัฒนา กรุงเทพฯ 10110" className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-orange-500 h-24 resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">เลขประจำตัวผู้เสียภาษี (Tax ID)</label>
                    <input type="text" defaultValue="01055xxxxxxxx" className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">เบอร์โทรศัพท์ (Phone)</label>
                    <input type="text" defaultValue="02-123-4567" className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-orange-500" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center text-gray-500 h-[400px]">
              {tabs.find(t => t.id === activeTab)?.icon({ className: "w-16 h-16 text-gray-200 mb-4" })}
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                ตั้งค่า: {tabs.find(t => t.id === activeTab)?.name}
              </h3>
              <p className="max-w-md text-sm">
                โมดูลการตั้งค่า {tabs.find(t => t.id === activeTab)?.name}
                <br/><br/>อยู่ระหว่างเตรียมระบบเชื่อมต่อ API
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
