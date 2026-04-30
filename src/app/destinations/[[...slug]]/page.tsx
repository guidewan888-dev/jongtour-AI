import Link from "next/link";
import { PrismaClient } from "@prisma/client";
import { MapPin, Calendar, Star, ChevronRight, CheckCircle2, Clock } from "lucide-react";
import { destinationConfig, getDestinationData } from "@/lib/destinations";
import { notFound } from "next/navigation";

const prisma = new PrismaClient();

export default async function DestinationPage({ params }: { params: { slug?: string[] } }) {
  const slug = params?.slug || [];
  
  // 1. อ่านข้อมูลจาก config
  const { node, breadcrumbs } = getDestinationData(slug);

  // ถ้าเข้า /destinations เฉยๆ ให้โชว์ทวีป (Asia, Europe)
  if (slug.length === 0) {
    return <DestinationIndexPage />;
  }

  // ถ้าพิมพ์ slug มั่วแล้วหาใน config ไม่เจอ ให้โยน 404
  if (!node) {
    notFound();
  }

  // 2. ดึงข้อมูลจาก Database
  // ค้นหาทัวร์ที่มี destination ตรงกับ keyword หรือ title มีคำที่เกี่ยวข้อง
  const keywordConditions = node.keywords.map(kw => ({
    OR: [
      { destination: { contains: kw, mode: 'insensitive' as const } },
      { title: { contains: kw, mode: 'insensitive' as const } }
    ]
  }));

  const tours = await prisma.tour.findMany({
    where: {
      OR: keywordConditions
    },
    include: {
      departures: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main className="min-h-screen bg-[#f8f9fa] pb-20">
      
      {/* 1. Hero Banner */}
      <div className="relative h-[300px] md:h-[400px] w-full flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${node.coverImage})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent"></div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-10">
          <span className="text-orange-400 font-bold tracking-wider uppercase text-sm md:text-base mb-3 block">
            ปลายทางยอดฮิต
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">
            ทัวร์{node.name}
          </h1>
          <p className="text-base md:text-lg text-gray-200 max-w-2xl mx-auto font-medium">
            สัมผัสประสบการณ์การเดินทางสุดพิเศษสู่{node.name} ที่เราคัดสรรมาเพื่อคุณโดยเฉพาะ
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-6 relative z-20">
        
        {/* 2. Breadcrumbs */}
        <div className="bg-white px-6 py-4 rounded-xl shadow-sm mb-8 flex items-center gap-2 text-sm text-gray-500 overflow-x-auto whitespace-nowrap border border-gray-100">
          <Link href="/" className="hover:text-orange-600 font-medium transition-colors">หน้าหลัก</Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.url} className="flex items-center gap-2">
              <Link href={crumb.url} className="hover:text-orange-600 font-medium transition-colors">
                {crumb.name}
              </Link>
              {index < breadcrumbs.length - 1 && <ChevronRight className="w-4 h-4 text-gray-400" />}
            </div>
          ))}
        </div>

        {/* 3. Main Layout (Sidebar + Content) */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Sidebar (Agoda Style) */}
          <aside className="w-full lg:w-[280px] shrink-0 space-y-6">
            


            {/* Filter: Wholesale */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">โฮลเซลล์ (Wholesale)</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-10 h-10 border-2 border-transparent rounded overflow-hidden flex items-center justify-center bg-gray-50 group-hover:border-orange-500 transition-colors p-1">
                    <img src="/images/logos/letsgo-logo.png" alt="LET'S GO" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-sm font-bold text-gray-700 group-hover:text-orange-600 transition-colors">LET'S GO (Zego)</span>
                  <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{tours.filter(t => t.source === 'API_ZEGO').length}</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-10 h-10 border-2 border-transparent rounded overflow-hidden flex items-center justify-center bg-gray-50 group-hover:border-orange-500 transition-colors p-1.5">
                    <img src="/images/logos/go365-logo.png" alt="GO365" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-sm font-bold text-gray-700 group-hover:text-orange-600 transition-colors">GO365</span>
                  <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{tours.filter(t => t.source === 'API_GO365').length}</span>
                </label>
              </div>
            </div>

            {/* Filter: Categories/Destinations Tree */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">จุดหมายปลายทางยอดฮิต</h3>
              <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                
                {/* ญี่ปุ่น */}
                <div className="pt-2 border-t border-gray-50 first:border-0 first:pt-0">
                  <Link href="/destinations/asia/japan" className="font-bold text-sm text-gray-800 hover:text-orange-600 flex justify-between items-center mb-2">
                    ญี่ปุ่น (JAPAN) <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>
                  <div className="pl-3 border-l-2 border-gray-100 space-y-2 ml-1">
                    <Link href="/destinations/asia/japan/tokyo" className="text-sm text-gray-600 hover:text-orange-600 block">โตเกียว</Link>
                    <Link href="/destinations/asia/japan/osaka" className="text-sm text-gray-600 hover:text-orange-600 block">โอซาก้า</Link>
                    <Link href="/destinations/asia/japan/hokkaido" className="text-sm text-gray-600 hover:text-orange-600 block">ฮอกไกโด</Link>
                    <Link href="/search/asia/japan/fukuoka" className="text-sm text-gray-600 hover:text-orange-600 block">ฟุกุโอกะ</Link>
                    <Link href="/search/asia/japan/kyoto" className="text-sm text-gray-600 hover:text-orange-600 block">เกียวโต</Link>
                    <Link href="/search/asia/japan/okinawa" className="text-sm text-gray-600 hover:text-orange-600 block">โอกินาว่า</Link>
                  </div>
                </div>

                {/* จีน */}
                <div className="pt-2 border-t border-gray-50">
                  <Link href="/destinations/asia/china" className="font-bold text-sm text-gray-800 hover:text-orange-600 flex justify-between items-center mb-2">
                    จีน (CHINA) <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>
                  <div className="pl-3 border-l-2 border-gray-100 space-y-2 ml-1">
                    <Link href="/search/asia/china/chengdu" className="text-sm text-gray-600 hover:text-orange-600 block">เฉิงตู</Link>
                    <Link href="/destinations/asia/china/shanghai" className="text-sm text-gray-600 hover:text-orange-600 block">เซี่ยงไฮ้</Link>
                    <Link href="/search/asia/china/zhangjiajie" className="text-sm text-gray-600 hover:text-orange-600 block">จางเจียเจี้ย</Link>
                    <Link href="/destinations/asia/china/chongqing" className="text-sm text-gray-600 hover:text-orange-600 block">ฉงชิ่ง</Link>
                    <Link href="/search/asia/china/beijing" className="text-sm text-gray-600 hover:text-orange-600 block">ปักกิ่ง</Link>
                    <Link href="/search/asia/china/kunming" className="text-sm text-gray-600 hover:text-orange-600 block">คุนหมิง</Link>
                    <Link href="/search/asia/china/guilin" className="text-sm text-gray-600 hover:text-orange-600 block">กุ้ยหลิน</Link>
                    <Link href="/search/asia/china/xian" className="text-sm text-gray-600 hover:text-orange-600 block">ซีอาน</Link>
                    <Link href="/search/asia/china/silk-road" className="text-sm text-gray-600 hover:text-orange-600 block">เส้นทางสายไหม</Link>
                    <Link href="/search/asia/china/xinjiang" className="text-sm text-gray-600 hover:text-orange-600 block">ซินเจียง</Link>
                    <Link href="/search/asia/china/tibet" className="text-sm text-gray-600 hover:text-orange-600 block">ทิเบต</Link>
                    <Link href="/search/asia/china/lijiang" className="text-sm text-gray-600 hover:text-orange-600 block">ลี่เจียง</Link>
                    <Link href="/search/asia/china/yichang" className="text-sm text-gray-600 hover:text-orange-600 block">อี้ชาง</Link>
                    <Link href="/search/asia/china/hangzhou" className="text-sm text-gray-600 hover:text-orange-600 block">หังโจว</Link>
                    <Link href="/search/asia/china/dali" className="text-sm text-gray-600 hover:text-orange-600 block">ต้าหลี่</Link>
                    <Link href="/search/asia/china/guangzhou" className="text-sm text-gray-600 hover:text-orange-600 block">กวางโจว</Link>
                    <Link href="/search/asia/china/harbin" className="text-sm text-gray-600 hover:text-orange-600 block">ฮาร์บิ้น</Link>
                    <Link href="/search/asia/china/luoyang" className="text-sm text-gray-600 hover:text-orange-600 block">ลั่วหยาง</Link>
                    <Link href="/search/asia/china/wangxian" className="text-sm text-gray-600 hover:text-orange-600 block">หุบเขาเทวดา</Link>
                    <Link href="/search/asia/china/enshi" className="text-sm text-gray-600 hover:text-orange-600 block">เอินซือ</Link>
                    <Link href="/search/asia/china/qingdao" className="text-sm text-gray-600 hover:text-orange-600 block">ชิงเต่า</Link>
                    <Link href="/search/asia/china/dalian" className="text-sm text-gray-600 hover:text-orange-600 block">ต้าเหลียน</Link>
                    <Link href="/search/asia/china/inner-mongolia" className="text-sm text-gray-600 hover:text-orange-600 block">มองโกเลีย</Link>
                    <Link href="/destinations/asia/china/zhuhai" className="text-sm text-gray-600 hover:text-orange-600 block">จู่ไห่</Link>

                    <div className="mt-3 pt-2 border-t border-gray-100">
                      <span className="text-xs font-bold text-gray-400 mb-1 block">เส้นทางพิเศษ</span>
                      <Link href="/search/asia/china/no-shopping" className="text-sm text-gray-600 hover:text-orange-600 block">ทัวร์ไม่ลงร้าน</Link>
                      <Link href="/search/asia/china/chongqing-zhangjiajie" className="text-sm text-gray-600 hover:text-orange-600 block">ฉงชิ่ง-จางเจียเจี้ย</Link>
                      <Link href="/search/asia/china/shanghai-beijing" className="text-sm text-gray-600 hover:text-orange-600 block">เซี่ยงไฮ้-ปักกิ่ง</Link>
                      <Link href="/search/asia/china/zhuhai-macau" className="text-sm text-gray-600 hover:text-orange-600 block">จู่ไห่-มาเก๊า</Link>
                      <Link href="/search/asia/china/guangzhou-macau" className="text-sm text-gray-600 hover:text-orange-600 block">กวางโจว-มาเก๊า</Link>
                      <Link href="/search/asia/china/guangzhou-hongkong" className="text-sm text-gray-600 hover:text-orange-600 block">กวางโจว-ฮ่องกง</Link>
                    </div>
                  </div>
                </div>

                {/* ทัวร์เอเชีย */}
                <div className="pt-2 border-t border-gray-50">
                  <Link href="/search/asia" className="font-bold text-sm text-gray-800 hover:text-orange-600 flex justify-between items-center mb-2">
                    เอเชีย (ASIA) <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>
                  <div className="pl-3 border-l-2 border-gray-100 space-y-2 ml-1">
                    <Link href="/search/asia/south-korea" className="text-sm text-gray-600 hover:text-orange-600 block">เกาหลีใต้ (Korea)</Link>
                    <Link href="/search/asia/taiwan" className="text-sm text-gray-600 hover:text-orange-600 block">ไต้หวัน (Taiwan)</Link>
                    <Link href="/search/asia/hongkong" className="text-sm text-gray-600 hover:text-orange-600 block">ฮ่องกง (Hong Kong)</Link>
                    <Link href="/search/asia/macau" className="text-sm text-gray-600 hover:text-orange-600 block">มาเก๊า (Macau)</Link>
                    <Link href="/search/asia/vietnam" className="text-sm text-gray-600 hover:text-orange-600 block">เวียดนาม (Vietnam)</Link>
                    <Link href="/search/asia/singapore" className="text-sm text-gray-600 hover:text-orange-600 block">สิงคโปร์ (Singapore)</Link>
                    <Link href="/search/asia/malaysia" className="text-sm text-gray-600 hover:text-orange-600 block">มาเลเซีย (Malaysia)</Link>
                    <Link href="/search/asia/indonesia" className="text-sm text-gray-600 hover:text-orange-600 block">อินโดนีเซีย (Indonesia)</Link>
                    <Link href="/search/asia/india" className="text-sm text-gray-600 hover:text-orange-600 block">อินเดีย (India)</Link>
                    <Link href="/search/asia/maldives" className="text-sm text-gray-600 hover:text-orange-600 block">มัลดีฟส์ (Maldives)</Link>
                  </div>
                </div>

                {/* ยุโรป & ตะวันออกกลาง */}
                <div className="pt-2 border-t border-gray-50">
                  <Link href="/destinations/europe" className="font-bold text-sm text-gray-800 hover:text-orange-600 flex justify-between items-center mb-2">
                    ยุโรป & ตะวันออกกลาง <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>
                  <div className="pl-3 border-l-2 border-gray-100 space-y-2 ml-1">
                    <Link href="/search/europe/switzerland" className="text-sm text-gray-600 hover:text-orange-600 block">สวิตเซอร์แลนด์</Link>
                    <Link href="/search/europe/italy" className="text-sm text-gray-600 hover:text-orange-600 block">อิตาลี</Link>
                    <Link href="/search/europe/france" className="text-sm text-gray-600 hover:text-orange-600 block">ฝรั่งเศส</Link>
                    <Link href="/search/europe/uk" className="text-sm text-gray-600 hover:text-orange-600 block">อังกฤษ</Link>
                    <Link href="/search/europe/germany" className="text-sm text-gray-600 hover:text-orange-600 block">เยอรมนี</Link>
                    <Link href="/search/europe/austria" className="text-sm text-gray-600 hover:text-orange-600 block">ออสเตรีย</Link>
                    <Link href="/search/europe/czech" className="text-sm text-gray-600 hover:text-orange-600 block">เช็ก</Link>
                    <Link href="/search/europe/spain" className="text-sm text-gray-600 hover:text-orange-600 block">สเปน</Link>
                    <Link href="/search/europe/netherlands" className="text-sm text-gray-600 hover:text-orange-600 block">เนเธอร์แลนด์</Link>
                    <Link href="/search/europe/finland" className="text-sm text-gray-600 hover:text-orange-600 block">ฟินแลนด์</Link>
                    <div className="my-2 pt-2 border-t border-gray-100"></div>
                    <Link href="/search/middle-east/turkey" className="text-sm text-gray-600 hover:text-orange-600 block">ตุรกี</Link>
                    <Link href="/search/europe/georgia" className="text-sm text-gray-600 hover:text-orange-600 block">จอร์เจีย</Link>
                    <Link href="/search/middle-east/egypt" className="text-sm text-gray-600 hover:text-orange-600 block">อียิปต์</Link>
                    <Link href="/search/middle-east/jordan" className="text-sm text-gray-600 hover:text-orange-600 block">จอร์แดน</Link>
                    <Link href="/search/africa/morocco" className="text-sm text-gray-600 hover:text-orange-600 block">โมร็อกโก</Link>
                  </div>
                </div>
                
                {/* อเมริกา & โอเชียเนีย */}
                <div className="pt-2 border-t border-gray-50">
                  <div className="font-bold text-sm text-gray-800 flex justify-between items-center mb-2">
                    อเมริกา & โอเชียเนีย
                  </div>
                  <div className="pl-3 border-l-2 border-gray-100 space-y-2 ml-1">
                    <Link href="/search/america/usa" className="text-sm text-gray-600 hover:text-orange-600 block">อเมริกา</Link>
                    <Link href="/search/america/canada" className="text-sm text-gray-600 hover:text-orange-600 block">แคนาดา</Link>
                    <div className="my-2 pt-2 border-t border-gray-100"></div>
                    <Link href="/search/oceania/australia" className="text-sm text-gray-600 hover:text-orange-600 block">ออสเตรเลีย</Link>
                    <Link href="/search/oceania/new-zealand" className="text-sm text-gray-600 hover:text-orange-600 block">นิวซีแลนด์</Link>
                  </div>
                </div>
                
              </div>
            </div>

            {/* Banner Add */}
            <div className="rounded-2xl overflow-hidden relative group hidden lg:block">
               <img src="https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80&w=400&auto=format&fit=crop" className="w-full h-[300px] object-cover group-hover:scale-105 transition-transform duration-700" alt="Promo" />
               <div className="absolute inset-0 bg-gradient-to-t from-orange-600 via-orange-600/50 to-transparent flex flex-col justify-end p-5">
                  <span className="bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded w-fit mb-2">โปรลดพิเศษ</span>
                  <h4 className="text-white font-bold text-lg leading-tight mb-2">เที่ยวฟินกว่าเดิมในราคาที่ถูกลง</h4>
                  <p className="text-orange-100 text-xs mb-4">รับส่วนลดพิเศษสูงสุด 15% เมื่อจองภายในเดือนนี้</p>
                  <button className="bg-white text-orange-600 font-bold text-sm py-2 rounded-lg w-full">ดูโปรโมชั่น</button>
               </div>
            </div>

          </aside>

          {/* Right Content (Tour Grid) */}
          <div className="flex-1 min-w-0">
            
            {/* Sub-destinations Quick Links (ถ้ามี) */}
            {node.children && Object.keys(node.children).length > 0 && (
              <div className="mb-8 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  พื้นที่น่าสนใจใน {node.name}
                </h2>
                <div className="flex flex-wrap gap-4">
                  {Object.entries(node.children).map(([childKey, childNode]) => {
                    const childUrl = `/destinations/${slug.join('/')}/${childKey}`;
                    return (
                      <Link href={childUrl} key={childKey} className="group flex flex-col items-center gap-2 hover:-translate-y-1 transition-transform w-16 md:w-20">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden shadow-sm border-2 border-gray-100 group-hover:border-orange-200 group-hover:shadow-md transition-all">
                          <img 
                            src={childNode.coverImage} 
                            alt={childNode.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        </div>
                        <span className="text-xs font-bold text-gray-600 group-hover:text-orange-600 text-center leading-tight">
                          {childNode.name}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-between items-end mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                มีที่พัก/ทัวร์ {tours.length} แห่งใน {node.name}
              </h2>
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm text-gray-500">เรียงผลการค้นหาโดย:</span>
                <select className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 outline-none focus:border-orange-500">
                  <option>ทัวร์แนะนำ</option>
                  <option>ราคา (ต่ำไปสูง)</option>
                  <option>ราคา (สูงไปต่ำ)</option>
                </select>
              </div>
            </div>

            {tours.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center shadow-sm">
                  <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MapPin className="w-10 h-10 text-orange-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">ยังไม่มีแพ็กเกจทัวร์ในขณะนี้</h3>
                  <p className="text-gray-500 text-sm">แพ็กเกจสำหรับ {node.name} กำลังจะมาเร็วๆ นี้ โปรดรอติดตาม</p>
                </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {tours.map((tour) => {
                  // หาเดือนที่เดินทางจาก departures
                  let dateDisplay = "เร็วๆ นี้";
                  if (tour.departures && tour.departures.length > 0) {
                    const sorted = [...tour.departures].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
                    const firstDate = sorted[0].startDate;
                    const lastDate = sorted[sorted.length - 1].startDate;
                    
                    const formatMonth = (d: Date) => d.toLocaleDateString("th-TH", { month: "short", year: "2-digit" });
                    const m1 = formatMonth(firstDate);
                    const m2 = formatMonth(lastDate);
                    
                    if (m1 === m2) {
                      dateDisplay = `เดินทาง ${m1}`;
                    } else {
                      dateDisplay = `เดินทาง ${m1} - ${m2}`;
                    }
                  }

                  // หาวันเดินทางที่ถูกที่สุด
                  const lowestPrice = tour.departures.length > 0 
                    ? Math.min(...tour.departures.map(d => d.price)) 
                    : tour.price;

                  return (
                    <div key={tour.id} className="bg-white rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-all group flex flex-col h-full border border-gray-200">
                      
                      {/* Tour Image - Variable height to fit width without cropping */}
                      <div className="relative bg-gray-100 overflow-hidden flex items-center justify-center">
                        {tour.price > lowestPrice && (
                          <div className="absolute top-0 left-0 bg-orange-600 text-white px-3 py-1 rounded-br-lg text-xs font-bold z-10 shadow-sm flex items-center gap-1">
                            <Star className="w-3 h-3 fill-white" /> ได้รับรางวัล
                          </div>
                        )}
                        <img 
                          src={tour.imageUrl || "https://images.unsplash.com/photo-1436491865332-7a61a109cc05"} 
                          alt={tour.title} 
                          className="w-full h-[180px] object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        
                        {/* Map Pin Badge */}
                        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-white flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-white" /> {tour.destination}
                        </div>

                        {/* Wholesale Logos */}
                        {tour.source === "API_ZEGO" && (
                          <div className="absolute top-3 right-3 bg-white w-10 h-10 rounded-full shadow-md overflow-hidden flex items-center justify-center p-0.5 border border-gray-100 z-10">
                             <img src="/images/logos/letsgo-logo.png" alt="LET'S GO" className="w-full h-full object-contain" />
                          </div>
                        )}
                        {tour.source === "API_GO365" && (
                          <div className="absolute top-3 right-3 bg-white w-10 h-10 rounded-full shadow-md overflow-hidden flex items-center justify-center p-1.5 border border-gray-100 z-10">
                             <img src="/images/logos/go365-logo.png" alt="GO365" className="w-full h-full object-contain" />
                          </div>
                        )}
                      </div>

                      {/* Tour Content */}
                      <div className="p-4 flex-1 flex flex-col">
                        
                        <Link href={`/tour/${tour.id}`} className="block flex-1">
                          <h3 className="font-bold text-orange-600 text-base leading-snug mb-1 group-hover:underline transition-colors line-clamp-2">
                            {tour.title}
                          </h3>
                          <div className="flex gap-0.5 mb-2">
                            {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}
                          </div>
                          <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                            {tour.description}
                          </p>
                        </Link>

                        <div className="flex flex-wrap gap-1.5 mb-4">
                          <div className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-[10px] font-medium flex items-center gap-1 border border-gray-200">
                            <Clock className="w-3 h-3" /> {tour.durationDays} วัน {tour.durationDays > 1 ? tour.durationDays - 1 : 0} คืน
                          </div>
                          <div className="bg-green-50 text-green-700 px-2 py-1 rounded text-[10px] font-medium flex items-center gap-1 border border-green-200">
                             <Calendar className="w-3 h-3" /> {dateDisplay}
                          </div>
                        </div>

                        {/* Footer / Price Box */}
                        <div className="flex justify-between items-end pt-3 border-t border-gray-100 mt-auto">
                          <div className="flex flex-col">
                            <div className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm w-fit mb-1">
                              8.5 ดีเยี่ยม
                            </div>
                            <span className="text-[10px] text-gray-400">128 รีวิว</span>
                          </div>

                          <div className="text-right">
                            {tour.price > lowestPrice && (
                              <p className="text-[10px] text-red-500 line-through mb-0.5">฿ {tour.price.toLocaleString()}</p>
                            )}
                            <p className="text-lg font-black text-gray-900 leading-none">
                              ฿ {lowestPrice.toLocaleString()}
                            </p>
                            <p className="text-[9px] text-gray-400 mt-1">รวมภาษีและค่าธรรมเนียมแล้ว</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}

// หน้า Index เมื่อเข้า /destinations
function DestinationIndexPage() {
  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gray-900 py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">เลือกปลายทางในฝันของคุณ</h1>
        <p className="text-gray-400 text-lg">เริ่มต้นการเดินทางไปกับแพ็กเกจทัวร์คุณภาพจากเรา</p>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Object.entries(destinationConfig).map(([key, node]) => (
            <Link href={`/destinations/${key}`} key={key} className="group relative h-80 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all">
              <img 
                src={node.coverImage} 
                alt={node.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent"></div>
              <div className="absolute bottom-8 left-8">
                <span className="text-orange-400 font-bold tracking-wider uppercase text-sm mb-2 block">ทวีป</span>
                <h2 className="text-4xl font-black text-white">{node.name}</h2>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
