import { LayoutTemplate, FileEdit, Image as ImageIcon, Send } from 'lucide-react';

export default function CMSManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">CMS Management (info.jongtour.com)</h1>
          <p className="text-sm text-gray-500">ระบบจัดการเนื้อหา บทความ แบนเนอร์ และหน้า Landing Page ของเว็บไซต์หลัก</p>
        </div>
        <a href="https://info.jongtour.com" target="_blank" className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-bold shadow-sm transition-colors flex items-center gap-2 text-sm">
          <ExternalLink size={16} /> View Live Site
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Module 1 */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
            <LayoutTemplate size={24} />
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Homepage & Banners</h2>
          <p className="text-sm text-gray-500 mb-4">จัดการแบนเนอร์หน้าแรก โปรโมชั่นเด่น และรูปภาพสไลด์</p>
          <button className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:text-blue-800">Manage Content <ArrowRight size={14}/></button>
        </div>

        {/* Module 2 */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
            <FileEdit size={24} />
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Blog & Travel Guides</h2>
          <p className="text-sm text-gray-500 mb-4">เขียนบทความท่องเที่ยว ข่าวสาร และเคล็ดลับ (เพื่อ SEO)</p>
          <button className="text-emerald-600 font-bold text-sm flex items-center gap-1 hover:text-emerald-800">Manage Articles <ArrowRight size={14}/></button>
        </div>

        {/* Module 3 */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
            <Send size={24} />
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Landing Pages</h2>
          <p className="text-sm text-gray-500 mb-4">สร้างหน้าแคมเปญโฆษณา (Lead Generation Form)</p>
          <button className="text-purple-600 font-bold text-sm flex items-center gap-1 hover:text-purple-800">Manage Pages <ArrowRight size={14}/></button>
        </div>

      </div>
    </div>
  );
}
// Note: Missing imports fix
import { ExternalLink, ArrowRight } from 'lucide-react';
