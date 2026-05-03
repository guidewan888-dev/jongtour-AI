import Link from 'next/link';

export default function DestinationGuidePage() {
  const regions = [
    {
      name: "เอเชียตะวันออก (East Asia)",
      description: "สัมผัสวัฒนธรรมและเทคโนโลยีล้ำสมัย อากาศเย็นสบายตลอดปี",
      destinations: [
        { name: "ญี่ปุ่น (Japan)", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=600&auto=format&fit=crop" },
        { name: "เกาหลีใต้ (South Korea)", image: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?q=80&w=600&auto=format&fit=crop" },
        { name: "ไต้หวัน (Taiwan)", image: "https://images.unsplash.com/photo-1558231948-4384bf7f0cc0?q=80&w=600&auto=format&fit=crop" },
        { name: "จีน (China)", image: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=600&auto=format&fit=crop" }
      ]
    },
    {
      name: "ยุโรป (Europe)",
      description: "ดินแดนแห่งสถาปัตยกรรม โรแมนติก และประวัติศาสตร์อันยาวนาน",
      destinations: [
        { name: "สวิตเซอร์แลนด์ (Switzerland)", image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=600&auto=format&fit=crop" },
        { name: "อิตาลี (Italy)", image: "https://images.unsplash.com/photo-1516483638261-f40af5ff3586?q=80&w=600&auto=format&fit=crop" },
        { name: "ฝรั่งเศส (France)", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=600&auto=format&fit=crop" }
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">คู่มือสถานที่ท่องเที่ยว</h1>
        <p className="text-xl text-slate-600">เจาะลึกข้อมูลแต่ละประเทศ เพื่อให้คุณตัดสินใจเลือกทริปต่อไปได้ง่ายขึ้น</p>
      </div>

      <div className="space-y-20">
        {regions.map((region, idx) => (
          <section key={idx}>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">{region.name}</h2>
              <p className="text-slate-500">{region.description}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {region.destinations.map((dest, i) => (
                <Link key={i} href={`https://tour.jongtour.com?country=${encodeURIComponent(dest.name)}`} className="group">
                  <div className="relative h-64 rounded-2xl overflow-hidden shadow-sm mb-4">
                    <img 
                      src={dest.image} 
                      alt={dest.name} 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4">
                      <h3 className="text-xl font-bold text-white">{dest.name}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-blue-600 font-semibold group-hover:underline">ดูแพ็กเกจทัวร์ทั้งหมด &rarr;</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
