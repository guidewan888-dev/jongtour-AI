import { Badge } from '@/components/ui/Badge';

export default function PromotionsPage() {
  const promos = [
    {
      title: "ลดไฟลุก ทัวร์ญี่ปุ่นลดสูงสุด 5,000.-",
      desc: "เฉพาะโปรแกรมที่ร่วมรายการ เดินทางเดือน ตุลาคม - ธันวาคม",
      tag: "HOT",
      date: "หมดเขต: 31 ต.ค. 2026",
      image: "https://images.unsplash.com/photo-1542051812891-b9b3ad80c265?q=80&w=800&auto=format&fit=crop",
      color: "error" as const
    },
    {
      title: "โปรบัตรเครดิต KTC รับเครดิตเงินคืน 12%",
      desc: "เมื่อรูดซื้อทัวร์ยุโรปผ่านบัตรเครดิต KTC ทุกประเภท (ยกเว้นบัตรกดเงินสด)",
      tag: "Credit Card",
      date: "หมดเขต: 31 ธ.ค. 2026",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=800&auto=format&fit=crop",
      color: "info" as const
    },
    {
      title: "จองล่วงหน้า (Early Bird) ลดเลย 2,000.-",
      desc: "เมื่อจองและมัดจำล่วงหน้าก่อนเดินทางอย่างน้อย 90 วัน",
      tag: "Early Bird",
      date: "ไม่มีวันหมดเขต",
      image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop",
      color: "success" as const
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">โปรโมชั่นและแคมเปญ</h1>
        <p className="text-xl text-slate-600">รวบรวมดีลเด็ดและสิทธิพิเศษจากพาร์ทเนอร์ เพื่อให้คุณจองทัวร์ได้คุ้มค่าที่สุด</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {promos.map((p, i) => (
          <div key={i} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-shadow group cursor-pointer">
            <div className="h-48 overflow-hidden relative">
              <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-4 left-4">
                <Badge variant={p.color} pulse={p.color === 'error'}>{p.tag}</Badge>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">{p.title}</h3>
              <p className="text-slate-600 text-sm mb-6 line-clamp-2">{p.desc}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-500">{p.date}</span>
                <span className="text-sm font-bold text-blue-600 group-hover:underline">ดูรายละเอียด</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
