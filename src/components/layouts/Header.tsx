"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import AuthButtons from "@/components/AuthButtons";

interface HeaderProps {
  agentLogo?: string | null;
  agentName?: string | null;
}

export default function Header({ agentLogo, agentName }: HeaderProps) {
  const pathname = usePathname();

  if (pathname === "/" || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 relative z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-20">
        <Link href="/" className="flex items-center gap-2">
          {agentLogo ? (
            <img src={agentLogo} alt={agentName || "Agent Logo"} className="h-10 object-contain" />
          ) : (
            <span className="text-3xl font-bold tracking-tight text-gray-800">
              <span className="text-[var(--brand-color,theme(colors.orange.500))]">Jong</span>tour AI
            </span>
          )}
        </Link>

        <div className="hidden md:flex items-center gap-4">
          
          <Link href="/" className="px-2 lg:px-4 py-2 text-gray-600 hover:text-[var(--brand-color,theme(colors.orange.500))] font-medium transition-colors whitespace-nowrap">
            หน้าแรก
          </Link>

          {/* Mega Menu Item */}
          <div className="group py-8">
            <button className="flex items-center gap-1 px-2 lg:px-4 py-2 text-gray-600 group-hover:text-[var(--brand-color,theme(colors.orange.500))] font-medium transition-colors whitespace-nowrap">
              ทัวร์ต่างประเทศ
              <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
            </button>

            {/* Dropdown Container (Full Width) */}
            <div className="absolute left-0 top-full w-full bg-white border-t border-gray-100 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top translate-y-2 group-hover:translate-y-0 max-h-[80vh] overflow-y-auto">
              <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                  
                  {/* Column 1: ยอดฮิต (Japan & China) */}
                  <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 border-b-2 border-orange-500 pb-2 mb-4">จุดหมายยอดฮิต</h3>
                      
                      <div className="mb-6">
                        <CountryLink countryCode="jp" name="ทัวร์ญี่ปุ่น" href="/destinations/asia/japan" />
                        <div className="grid grid-cols-2 gap-x-2 gap-y-2 mt-3 ml-2">
                          <CityLink name="โตเกียว" href="/destinations/asia/japan/tokyo" />
                          <CityLink name="โอซาก้า" href="/destinations/asia/japan/osaka" />
                          <CityLink name="ฮอกไกโด" href="/destinations/asia/japan/hokkaido" />
                          <CityLink name="ฟุกุโอกะ" href="/destinations/asia/japan/fukuoka" />
                          <CityLink name="เกียวโต" href="/destinations/asia/japan/kyoto" />
                          <CityLink name="โอกินาว่า" href="/destinations/asia/japan/okinawa" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-transparent border-b-2 border-transparent pb-2 mb-4 hidden md:block">&nbsp;</h3>
                      <CountryLink countryCode="cn" name="ทัวร์จีน" href="/destinations/asia/china" />
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-3 ml-2">
                        <CityLink name="เฉิงตู" href="/destinations/asia/china/chengdu" />
                        <CityLink name="เซี่ยงไฮ้" href="/destinations/asia/china/shanghai" />
                        <CityLink name="จางเจียเจี้ย" href="/destinations/asia/china/zhangjiajie" />
                        <CityLink name="ฉงชิ่ง" href="/destinations/asia/china/chongqing" />
                        <CityLink name="ปักกิ่ง" href="/destinations/asia/china/beijing" />
                        <CityLink name="คุนหมิง" href="/destinations/asia/china/kunming" />
                        <CityLink name="กุ้ยหลิน" href="/destinations/asia/china/guilin" />
                        <CityLink name="ซีอาน" href="/destinations/asia/china/xian" />
                        <CityLink name="เส้นทางสายไหม" href="/destinations/asia/china/silk-road" />
                        <CityLink name="ซินเจียง" href="/destinations/asia/china/xinjiang" />
                        <CityLink name="ทิเบต" href="/destinations/asia/china/tibet" />
                        <CityLink name="ลี่เจียง" href="/destinations/asia/china/lijiang" />
                        <CityLink name="อี้ชาง" href="/destinations/asia/china/yichang" />
                        <CityLink name="หังโจว" href="/destinations/asia/china/hangzhou" />
                        <CityLink name="ต้าหลี่" href="/destinations/asia/china/dali" />
                        <CityLink name="กวางโจว" href="/destinations/asia/china/guangzhou" />
                        <CityLink name="ฮาร์บิ้น" href="/destinations/asia/china/harbin" />
                        <CityLink name="ลั่วหยาง" href="/destinations/asia/china/luoyang" />
                        <CityLink name="หุบเขาเทวดา" href="/destinations/asia/china/wangxian" />
                        <CityLink name="เอินซือ" href="/destinations/asia/china/enshi" />
                        <CityLink name="ชิงเต่า" href="/destinations/asia/china/qingdao" />
                        <CityLink name="ต้าเหลียน" href="/destinations/asia/china/dalian" />
                        <CityLink name="มองโกเลีย" href="/destinations/asia/china/inner-mongolia" />
                        <CityLink name="จู่ไห่" href="/destinations/asia/china/zhuhai" />
                      </div>
                      
                      {/* เส้นทางพิเศษ */}
                      <div className="mt-3 ml-2 border-t border-gray-100 pt-2">
                        <span className="text-xs font-bold text-gray-400 mb-1 block">เส้นทางพิเศษ</span>
                        <div className="flex flex-col gap-1">
                          <CityLink name="ทัวร์ไม่ลงร้าน" href="/destinations/asia/china/no-shopping" />
                          <CityLink name="ฉงชิ่ง-จางเจียเจี้ย" href="/destinations/asia/china/chongqing-zhangjiajie" />
                          <CityLink name="เซี่ยงไฮ้-ปักกิ่ง" href="/destinations/asia/china/shanghai-beijing" />
                          <CityLink name="จู่ไห่-มาเก๊า" href="/destinations/asia/china/zhuhai-macau" />
                          <CityLink name="กวางโจว-มาเก๊า" href="/destinations/asia/china/guangzhou-macau" />
                          <CityLink name="กวางโจว-ฮ่องกง" href="/destinations/asia/china/guangzhou-hongkong" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: เอเชีย */}
                  <div className="col-span-1">
                    <h3 className="text-lg font-bold text-gray-800 border-b-2 border-orange-500 pb-2 mb-4">ทัวร์เอเชีย</h3>
                    <ul className="space-y-3">
                      <CountryLink countryCode="kr" name="ทัวร์เกาหลีใต้" href="/destinations/asia/south-korea" />
                      <CountryLink countryCode="tw" name="ทัวร์ไต้หวัน" href="/destinations/asia/taiwan" />
                      <CountryLink countryCode="hk" name="ทัวร์ฮ่องกง" href="/destinations/asia/hongkong" />
                      <CountryLink countryCode="mo" name="ทัวร์มาเก๊า" href="/destinations/asia/macau" />
                      <CountryLink countryCode="vn" name="ทัวร์เวียดนาม" href="/destinations/asia/vietnam" />
                      <CountryLink countryCode="sg" name="ทัวร์สิงคโปร์" href="/destinations/asia/singapore" />
                      <CountryLink countryCode="my" name="ทัวร์มาเลเซีย" href="/destinations/asia/malaysia" />
                      <CountryLink countryCode="id" name="ทัวร์อินโดนีเซีย" href="/destinations/asia/indonesia" />
                      <CountryLink countryCode="in" name="ทัวร์อินเดีย" href="/destinations/asia/india" />
                      <CountryLink countryCode="mv" name="ทัวร์มัลดีฟส์" href="/destinations/asia/maldives" />
                    </ul>
                  </div>

                  {/* Column 3: ยุโรป & ตะวันออกกลาง */}
                  <div className="col-span-1">
                    <h3 className="text-lg font-bold text-gray-800 border-b-2 border-blue-500 pb-2 mb-4">ยุโรป & ตะวันออกกลาง</h3>
                    <ul className="space-y-3">
                      <CountryLink countryCode="ch" name="สวิตเซอร์แลนด์" href="/destinations/europe/switzerland" titleColor="hover:text-blue-600" />
                      <CountryLink countryCode="it" name="อิตาลี" href="/destinations/europe/italy" titleColor="hover:text-blue-600" />
                      <CountryLink countryCode="fr" name="ฝรั่งเศส" href="/destinations/europe/france" titleColor="hover:text-blue-600" />
                      <CountryLink countryCode="gb" name="อังกฤษ" href="/destinations/europe/uk" titleColor="hover:text-blue-600" />
                      <CountryLink countryCode="de" name="เยอรมนี" href="/destinations/europe/germany" titleColor="hover:text-blue-600" />
                      <CountryLink countryCode="at" name="ออสเตรีย" href="/destinations/europe/austria" titleColor="hover:text-blue-600" />
                      <CountryLink countryCode="cz" name="เช็ก" href="/destinations/europe/czech" titleColor="hover:text-blue-600" />
                      <CountryLink countryCode="es" name="สเปน" href="/destinations/europe/spain" titleColor="hover:text-blue-600" />
                      <CountryLink countryCode="nl" name="เนเธอร์แลนด์" href="/destinations/europe/netherlands" titleColor="hover:text-blue-600" />
                      <CountryLink countryCode="fi" name="ฟินแลนด์" href="/destinations/europe/finland" titleColor="hover:text-blue-600" />
                      <div className="my-2 pt-2 border-t border-gray-100"></div>
                      <CountryLink countryCode="tr" name="ทัวร์ตุรกี" href="/destinations/middle-east/turkey" titleColor="hover:text-blue-600" />
                      <CountryLink countryCode="ge" name="ทัวร์จอร์เจีย" href="/destinations/europe/georgia" titleColor="hover:text-blue-600" />
                      <CountryLink countryCode="eg" name="ทัวร์อียิปต์" href="/destinations/middle-east/egypt" titleColor="hover:text-blue-600" />
                      <CountryLink countryCode="jo" name="ทัวร์จอร์แดน" href="/destinations/middle-east/jordan" titleColor="hover:text-blue-600" />
                      <CountryLink countryCode="ma" name="ทัวร์โมร็อกโก" href="/destinations/africa/morocco" titleColor="hover:text-blue-600" />
                    </ul>
                  </div>

                  {/* Column 4: อเมริกา & โอเชียเนีย */}
                  <div className="col-span-1">
                    <h3 className="text-lg font-bold text-gray-800 border-b-2 border-emerald-500 pb-2 mb-4">อเมริกา & โอเชียเนีย</h3>
                    <ul className="space-y-3">
                      <CountryLink countryCode="us" name="ทัวร์อเมริกา" href="/destinations/america/usa" titleColor="hover:text-emerald-600" />
                      <CountryLink countryCode="ca" name="ทัวร์แคนาดา" href="/destinations/america/canada" titleColor="hover:text-emerald-600" />
                      <div className="my-4 pt-4 border-t border-gray-100"></div>
                      <CountryLink countryCode="au" name="ทัวร์ออสเตรเลีย" href="/destinations/oceania/australia" titleColor="hover:text-emerald-600" />
                      <CountryLink countryCode="nz" name="ทัวร์นิวซีแลนด์" href="/destinations/oceania/new-zealand" titleColor="hover:text-emerald-600" />
                    </ul>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* Wholesale Mega Menu */}
          <div className="group py-8 relative">
            <button className="flex items-center gap-1 px-4 py-2 text-gray-600 group-hover:text-orange-500 font-medium transition-colors whitespace-nowrap">
              โฮลเซลล์ (Wholesale)
              <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
            </button>

            <div className="absolute left-1/2 -translate-x-1/2 top-full w-[650px] bg-white border border-gray-100 shadow-2xl rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top translate-y-2 group-hover:translate-y-0 p-6 z-50">
              <div className="grid grid-cols-2 gap-8">
                {[
                  { slug: "letsgo", name: "Let's Go Group", logo: "/images/wholesales/download.png", dests: ["ญี่ปุ่น", "จีน", "เกาหลีใต้", "ไต้หวัน", "ฮ่องกง", "เวียดนาม", "ยุโรป"] },
                  { slug: "go365", name: "GO 365 Travel", logo: "/images/wholesales/download.jfif", dests: ["ญี่ปุ่น", "จีน", "ยุโรป", "เวียดนาม", "สิงคโปร์", "ตุรกี"] },
                  { slug: "checkingroup", name: "Check In Group", logo: "/images/wholesales/CH7.jpg", dests: ["จีน", "ฮ่องกง", "มาเก๊า", "ไต้หวัน"] },
                  { slug: "tourfactory", name: "Tour Factory", logo: "/images/wholesales/Tour-Factory.jpg", dests: ["จีน", "ฮ่องกง", "มาเก๊า", "ไต้หวัน", "เวียดนาม"] }
                ].map((ws) => (
                  <div key={ws.slug} className="flex flex-col">
                    <Link href={`/wholesale/${ws.slug}`} className="flex items-center gap-3 mb-3 group/ws">
                      <div className="w-14 h-14 bg-white rounded-xl border border-gray-100 p-1.5 flex items-center justify-center shadow-sm group-hover/ws:border-orange-500 group-hover/ws:shadow-md transition-all shrink-0">
                        <img src={ws.logo} alt={ws.name} className="max-w-full max-h-full object-contain" />
                      </div>
                      <span className="font-bold text-gray-800 text-lg group-hover/ws:text-orange-500 transition-colors">{ws.name}</span>
                    </Link>
                    <div className="flex flex-wrap gap-1.5 pl-[68px] mt-auto">
                      {ws.dests.map(dest => (
                         <Link key={dest} href={`/wholesale/${ws.slug}?dest=${encodeURIComponent(dest)}`} className="text-[11px] font-medium text-gray-500 hover:text-orange-600 hover:bg-orange-50 px-2 py-1 rounded-md transition-colors bg-gray-50 border border-gray-100">
                           {dest}
                         </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Link href="/last-minute" className="px-2 lg:px-4 py-2 text-rose-600 hover:text-rose-700 font-bold transition-colors flex items-center gap-1 whitespace-nowrap">
            🔥 ทัวร์ไฟไหม้
          </Link>
          
          <Link href="/ai-planner" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 lg:px-5 py-2 rounded-full font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 transform hover:-translate-y-0.5 ml-1 lg:ml-2 whitespace-nowrap text-sm lg:text-base">
            ✨ AI จัดทริปส่วนตัว
          </Link>
        </div>

        <div className="flex gap-4 items-center">
          <AuthButtons />
        </div>
      </div>
    </nav>
  );
}

function CountryLink({ countryCode, name, href, titleColor = "hover:text-orange-500" }: { countryCode: string, name: string, href: string, titleColor?: string }) {
  return (
    <li className="flex items-center gap-3 group/item">
      <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 shadow-sm border border-gray-100 flex items-center justify-center bg-gray-50">
        <img 
          src={`https://flagcdn.com/w40/${countryCode}.png`} 
          alt={`${name} flag`} 
          className="w-full h-full object-cover"
        />
      </div>
      <Link href={href} className={`text-[15px] font-medium text-gray-700 ${titleColor} transition-colors`}>
        {name}
      </Link>
    </li>
  );
}

function CityLink({ name, href }: { name: string, href: string }) {
  return (
    <Link href={href} className="text-sm text-gray-500 hover:text-orange-500 flex items-center gap-1 transition-colors leading-tight">
      <span className="w-1 h-1 bg-gray-300 rounded-full shrink-0"></span>
      {name}
    </Link>
  );
}
  
