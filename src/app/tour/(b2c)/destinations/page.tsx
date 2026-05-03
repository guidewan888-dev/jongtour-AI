export default function DestinationsPage() {
  const destinations = [
    { name: "ญี่ปุ่น (Japan)", tours: 450, region: "Asia" },
    { name: "เกาหลีใต้ (South Korea)", tours: 320, region: "Asia" },
    { name: "ไต้หวัน (Taiwan)", tours: 150, region: "Asia" },
    { name: "สวิตเซอร์แลนด์ (Switzerland)", tours: 85, region: "Europe" },
    { name: "อิตาลี (Italy)", tours: 60, region: "Europe" },
    { name: "จีน (China)", tours: 210, region: "Asia" },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-4">จุดหมายปลายทางยอดนิยม</h1>
          <p className="text-slate-500 text-lg">เลือกประเทศที่คุณอยากไป แล้วดูแพ็กเกจทัวร์ทั้งหมดที่เรามี</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {destinations.map((dest, i) => (
            <a key={i} href={`/tour/search?country=${dest.name}`} className="group relative rounded-2xl overflow-hidden aspect-[4/3] block">
              {/* Background Mockup */}
              <div className="absolute inset-0 bg-slate-300 group-hover:scale-110 transition-transform duration-700"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
              
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <span className="text-xs font-bold text-white/70 tracking-widest uppercase mb-1">{dest.region}</span>
                <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-orange-400 transition-colors">{dest.name}</h3>
                <p className="text-sm font-medium text-slate-300">{dest.tours} โปรแกรมทัวร์</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
