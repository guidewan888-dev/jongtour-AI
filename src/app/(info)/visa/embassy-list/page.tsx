import Link from "next/link";
import { MapPin, Phone, Clock, Globe, ExternalLink } from "lucide-react";

const embassies = [
  { country: "🇯🇵 ญี่ปุ่น", name: "สถานเอกอัครราชทูตญี่ปุ่น", type: "Embassy", addr: "177 ถ.วิทยุ ลุมพินี กรุงเทพฯ 10330", tel: "02-207-8500", hrs: "จ-ศ 08:30-11:30", web: "https://www.th.emb-japan.go.jp", booking: "ยื่น VFS" },
  { country: "🇺🇸 อเมริกา", name: "สถานเอกอัครราชทูตสหรัฐฯ", type: "Embassy", addr: "95 ถ.วิทยุ ลุมพินี กรุงเทพฯ 10330", tel: "02-205-4000", hrs: "จ-ศ 07:00-15:00", web: "https://th.usembassy.gov", booking: "นัดหมายสัมภาษณ์" },
  { country: "🇬🇧 อังกฤษ", name: "VFS Global UK", type: "VFS", addr: "อาคาร Trendy ชั้น 28 สุขุมวิท 13", tel: "02-118-7100", hrs: "จ-ศ 08:00-15:00", web: "https://www.vfsglobal.co.uk", booking: "จองออนไลน์" },
  { country: "🇪🇺 เชงเก้น (ฝรั่งเศส)", name: "TLS Contact France", type: "TLS", addr: "อาคาร Sathorn Square ชั้น 12", tel: "02-838-6789", hrs: "จ-ศ 08:00-16:00", web: "https://fr.tlscontact.com", booking: "จองออนไลน์" },
  { country: "🇨🇳 จีน", name: "สถานเอกอัครราชทูตจีน", type: "Embassy", addr: "57 ถ.รัชดาภิเษก ห้วยขวาง กรุงเทพฯ", tel: "02-245-7032", hrs: "จ-ศ 09:00-11:30", web: "http://www.chinaembassy.or.th", booking: "ยื่นตรง" },
  { country: "🇦🇺 ออสเตรเลีย", name: "VFS Global Australia", type: "VFS", addr: "อาคาร Trendy ชั้น 28 สุขุมวิท 13", tel: "02-118-7100", hrs: "จ-ศ 08:00-15:00", web: "https://www.vfsglobal.com", booking: "จองออนไลน์" },
];

export default function EmbassyListPage() {
  return (<>
    <section className="bg-white border-b py-8"><div className="g-container"><h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><MapPin className="w-6 h-6 text-primary" /> รายชื่อสถานทูต & VFS</h1><p className="text-slate-500 text-sm mt-1">ข้อมูลสถานที่ยื่นวีซ่าในประเทศไทย</p></div></section>
    <section className="g-section"><div className="g-container space-y-4">
      {embassies.map(e => (
        <div key={e.name} className="bg-white p-5 rounded-2xl border border-slate-200 hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-3"><div><h3 className="font-bold text-slate-900">{e.country}</h3><div className="text-sm text-slate-600">{e.name}</div></div><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${e.type === "Embassy" ? "bg-blue-100 text-blue-700" : e.type === "VFS" ? "bg-purple-100 text-purple-700" : "bg-emerald-100 text-emerald-700"}`}>{e.type}</span></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-500">
            <div className="flex items-start gap-2"><MapPin className="w-4 h-4 shrink-0 mt-0.5" />{e.addr}</div>
            <div className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0" />{e.tel}</div>
            <div className="flex items-center gap-2"><Clock className="w-4 h-4 shrink-0" />{e.hrs}</div>
            <div className="flex items-center gap-2"><Globe className="w-4 h-4 shrink-0" /><a href={e.web} target="_blank" className="text-primary hover:underline truncate">{e.web.replace("https://","")}</a></div>
          </div>
        </div>
      ))}
    </div></section>
  </>);
}
