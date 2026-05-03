import { Brain, Database, Search, Zap, ToggleLeft, ToggleRight } from 'lucide-react';

export default function AICenterPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">AI Control Center</h1>
          <p className="text-sm text-gray-500">ศูนย์ควบคุมโมเดล AI, Vector Search และการตั้งค่า Prompt พื้นฐาน</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Module 1: Semantic Search */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
              <Search size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Vector Search Engine</h2>
              <p className="text-xs text-gray-500">ควบคุมระบบค้นหาด้วยความหมาย</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                <p className="font-bold text-sm text-gray-800">Tour Semantic Search</p>
                <p className="text-xs text-gray-500">ใช้งานบน tour.jongtour.com</p>
              </div>
              <ToggleRight className="text-emerald-500" size={32} />
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                <p className="font-bold text-sm text-gray-800">Auto-generate Embeddings</p>
                <p className="text-xs text-gray-500">ทำงานอัตโนมัติหลังดึง API เสร็จ</p>
              </div>
              <ToggleRight className="text-emerald-500" size={32} />
            </div>
            <button className="w-full text-center text-sm font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 py-2 rounded-lg transition-colors">
              Rebuild Vector Index
            </button>
          </div>
        </div>

        {/* Module 2: Chatbot Prompt */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
              <Brain size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Sales AI Chatbot</h2>
              <p className="text-xs text-gray-500">ตั้งค่าพฤติกรรมของแชทบอท</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">System Prompt (Persona)</label>
              <textarea 
                className="w-full h-32 p-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none font-mono"
                defaultValue={"คุณคือ 'น้องจง' พนักงานขายทัวร์มืออาชีพของบริษัท Jongtour\nบุคลิก: ร่าเริง สุภาพ เป็นกันเอง\nหน้าที่: แนะนำทัวร์ที่เหมาะสมกับลูกค้าที่สุด และพยายามนำเสนอลิงก์การจอง"}
              ></textarea>
            </div>
            <button className="w-full text-center text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 py-2 rounded-lg transition-colors">
              Save Prompt
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
