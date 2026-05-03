import { MessageCircle, Phone, Mail, MoreHorizontal } from 'lucide-react';

export default function LeadsPipelinePage() {
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Leads Pipeline</h1>
          <p className="text-xs text-slate-500">จัดการลูกค้าผ่านระบบ Kanban</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200">
            Total Pipeline Value: ฿450,000
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-6 flex gap-6 items-start bg-slate-50">
        
        {/* Column: New Leads */}
        <div className="w-80 shrink-0 bg-slate-100 rounded-xl flex flex-col max-h-full">
          <div className="p-3 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-sm">New Leads <span className="text-slate-400 font-normal">(4)</span></h3>
            <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={16} /></button>
          </div>
          <div className="p-3 overflow-y-auto space-y-3">
            <LeadCard id="1" name="คุณวิภาวรรณ" source="Facebook" time="10 mins ago" intent="หาทัวร์ญี่ปุ่นดูหิมะ" icon={<MessageCircle size={12}/>} />
            <LeadCard id="2" name="คุณธนาธร" source="info.jongtour" time="1 hour ago" intent="กรอกฟอร์มขอใบเสนอราคา" icon={<Mail size={12}/>} />
          </div>
        </div>

        {/* Column: Contacted */}
        <div className="w-80 shrink-0 bg-slate-100 rounded-xl flex flex-col max-h-full">
          <div className="p-3 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-sm">Contacted <span className="text-slate-400 font-normal">(2)</span></h3>
            <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={16} /></button>
          </div>
          <div className="p-3 overflow-y-auto space-y-3">
            <LeadCard id="3" name="คุณสมชาย" source="Phone" time="Yesterday" intent="โทรสอบถามทัวร์ยุโรป" icon={<Phone size={12}/>} alert="ต้องโทรกลับวันนี้" />
          </div>
        </div>

        {/* Column: Quoted */}
        <div className="w-80 shrink-0 bg-slate-100 rounded-xl flex flex-col max-h-full">
          <div className="p-3 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-sm">Quoted <span className="text-slate-400 font-normal">(1)</span></h3>
            <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={16} /></button>
          </div>
          <div className="p-3 overflow-y-auto space-y-3">
            <LeadCard id="4" name="บจก. เอบีซี" source="Email" time="2 days ago" intent="รออนุมัติใบเสนอราคา 125,000 บาท" icon={<Mail size={12}/>} />
          </div>
        </div>

        {/* Column: Won/Closed */}
        <div className="w-80 shrink-0 bg-emerald-50 border border-emerald-100 rounded-xl flex flex-col max-h-full">
          <div className="p-3 border-b border-emerald-200 flex justify-between items-center">
            <h3 className="font-bold text-emerald-800 text-sm">Won (ปิดการขาย) <span className="text-emerald-600 font-normal">(12)</span></h3>
          </div>
          <div className="p-3 overflow-y-auto space-y-3 opacity-70">
            <LeadCard id="5" name="คุณเจนจิรา" source="Line" time="Last week" intent="โอนเงินแล้ว (BOK-89293)" icon={<MessageCircle size={12}/>} />
          </div>
        </div>

      </div>
    </div>
  );
}

function LeadCard({ id, name, source, time, intent, icon, alert }: { id: string, name: string, source: string, time: string, intent: string, icon: React.ReactNode, alert?: string }) {
  return (
    <a href={`/sale/leads/${id}`} className="block bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-slate-800 text-sm">{name}</h4>
        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
          {icon} {source}
        </span>
      </div>
      <p className="text-xs text-slate-600 mb-3">{intent}</p>
      
      {alert && (
        <div className="bg-rose-50 text-rose-600 text-[10px] font-bold px-2 py-1 rounded mb-2 w-max">
          {alert}
        </div>
      )}
      
      <div className="text-[10px] text-slate-400 font-medium">
        Added {time}
      </div>
    </a>
  );
}
