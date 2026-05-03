import Link from "next/link";
import { FileText, Image as ImageIcon, Map, HelpCircle, LayoutTemplate, Send, Search, Link as LinkIcon, MapPin, ExternalLink } from "lucide-react";

export const dynamic = 'force-dynamic';

export default function AdminCMSPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const activeTab = searchParams.tab || "pages";

  const tabs = [
    { id: "pages", name: "Pages", icon: FileText },
    { id: "blog", name: "Blog", icon: FileText },
    { id: "destination-guide", name: "Destination Guide", icon: Map },
    { id: "faq", name: "FAQ", icon: HelpCircle },
    { id: "banners", name: "Banners", icon: ImageIcon },
    { id: "landing-pages", name: "Landing Pages", icon: Send },
    { id: "seo", name: "SEO", icon: Search },
    { id: "redirects", name: "Redirects", icon: LinkIcon },
    { id: "sitemap", name: "Sitemap", icon: MapPin },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">จัดการเนื้อหา (CMS)</h2>
          <p className="text-gray-500">ระบบจัดการเนื้อหา บทความ และหน้าเว็บไซต์สำหรับ info.jongtour.com</p>
        </div>
        <a href="https://info.jongtour.com" target="_blank" className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl font-bold shadow-sm transition-colors flex items-center gap-2 text-sm">
          <ExternalLink size={16} /> View Live Site
        </a>
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

        {/* Filters */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder={`ค้นหาใน ${tabs.find(t => t.id === activeTab)?.name}...`} 
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 bg-white" 
            />
          </div>
          <button className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">
            + เพิ่มรายการใหม่
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-8 flex flex-col items-center justify-center text-center text-gray-500 h-[400px]">
          {tabs.find(t => t.id === activeTab)?.icon({ className: "w-16 h-16 text-gray-200 mb-4" })}
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            โมดูล: {tabs.find(t => t.id === activeTab)?.name}
          </h3>
          <p className="max-w-md text-sm">
            ระบบสำหรับจัดการข้อมูล Content Management System สำหรับนำไปแสดงบนหน้าเว็บไซต์หลัก
          </p>
        </div>
      </div>
    </div>
  );
}
