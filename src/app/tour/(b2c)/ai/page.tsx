import { Sparkles, Send } from 'lucide-react';

export default function AiSearchPage() {
  return (
    <div className="bg-white min-h-[calc(100vh-64px)] flex flex-col items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Sparkles size={32} className="text-indigo-600" />
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-4">Jongtour AI Assistant</h1>
          <p className="text-slate-500 text-lg">ไม่ต้องเสียเวลากรองเอง แค่พิมพ์บอกความต้องการ AI ของเราจะหาทัวร์ที่ใช่ที่สุดให้คุณ</p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm mb-8">
          <div className="space-y-4 mb-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0">
                <Sparkles size={16} />
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-sm text-slate-700 text-sm shadow-sm">
                สวัสดีครับ! ผมคือ Jongtour AI คุณอยากไปเที่ยวประเทศไหน เดินทางเมื่อไหร่ หรือมีงบประมาณเท่าไหร่ พิมพ์บอกผมได้เลยครับ
              </div>
            </div>
            
            <div className="flex gap-4 flex-row-reverse">
              <div className="w-8 h-8 rounded-full bg-slate-300 shrink-0"></div>
              <div className="bg-orange-100 text-orange-900 p-4 rounded-2xl rounded-tr-sm text-sm">
                อยากหาทัวร์ไปยุโรปช่วงปีใหม่ พาพ่อแม่ที่อายุเยอะไปได้ ไม่เดินเหนื่อยมาก งบประมาณคนละไม่เกิน 80,000 บาท
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0">
                <Sparkles size={16} />
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-sm text-slate-700 text-sm shadow-sm w-full">
                <p className="mb-4">ผมพบ 2 โปรแกรมที่เหมาะสมกับการพาผู้ใหญ่ไปยุโรปช่วงปีใหม่และอยู่ในงบประมาณครับ:</p>
                
                {/* Mockup Tour Card in Chat */}
                <div className="flex border border-slate-100 rounded-xl overflow-hidden mb-3 hover:border-indigo-300 cursor-pointer transition-colors">
                  <div className="w-24 bg-slate-200"></div>
                  <div className="p-3 flex-1">
                    <p className="font-bold text-slate-800 text-sm">สวิตเซอร์แลนด์ นั่งรถไฟ Glacier Express 7D4N</p>
                    <p className="text-xs text-slate-500 mt-1">วันที่ 28 ธ.ค. - 3 ม.ค. | ราคา 75,900 บาท</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="relative">
            <input 
              type="text" 
              placeholder="พิมพ์ความต้องการของคุณที่นี่..." 
              className="w-full pl-6 pr-14 py-4 bg-white border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl shadow-sm outline-none transition-all"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
              <Send size={18} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          <span className="text-xs font-semibold text-slate-500 mr-2 self-center">ลองพิมพ์:</span>
          <button className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-full text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors">หาทัวร์ญี่ปุ่นดูหิมะเดือนมกราคม</button>
          <button className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-full text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors">ทัวร์เกาหลีราคาไม่เกินสองหมื่น</button>
        </div>
      </div>
    </div>
  );
}
