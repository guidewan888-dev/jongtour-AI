"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import AuthButtons from "@/components/AuthButtons";

export default function Header() {
  const pathname = usePathname();

  if (pathname === "/" || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 relative z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-20">
        <Link href="/" className="text-3xl font-bold tracking-tight text-gray-800">
          <span className="text-orange-500">Jong</span>tour AI
        </Link>

        <div className="hidden md:flex items-center gap-4">
          
          <Link href="/" className="px-4 py-2 text-gray-600 hover:text-orange-500 font-medium transition-colors">
            หน้าแรก
          </Link>

          {/* Mega Menu Item */}
          <div className="group py-8">
            <button className="flex items-center gap-1 px-4 py-2 text-gray-600 group-hover:text-orange-500 font-medium transition-colors">
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
                        <CountryLink countryCode="jp" name="ทัวร์ญี่ปุ่น" href="/search/asia/japan" />
                        <div className="grid grid-cols-2 gap-x-2 gap-y-2 mt-3 ml-2">
                          <CityLink name="โตเกียว" href="/search/asia/japan/tokyo" />
                          <CityLink name="โอซาก้า" href="/search/asia/japan/osaka" />
                          <CityLink name="ฮอกไกโด" href="/search/asia/japan/hokkaido" />
                          <CityLink name="ฟุกุโอกะ" href="/search/asia/japan/fukuoka" />
                          <CityLink name="เกียวโต" href="/search/asia/japan/kyoto" />
                          <CityLink name="โอกินาว่า" href="/search/asia/japan/okinawa" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-transparent border-b-2 border-transparent pb-2 mb-4 hidden md:block">&nbsp;</h3>
                      <CountryLink countryCode="cn" name="ทัวร์จีน" href="/search/asia/china" />
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-3 ml-2">
                        <CityLink name="เฉิงตู" href="/search/asia/china/chengdu" />
                        <CityLink name="เซี่ยงไฮ้" href="/search/asia/china/shanghai" />
                        <CityLink name="จางเจียเจี้ย" href="/search/asia/china/zhangjiajie" />
                        <CityLink name="ฉงชิ่ง" href="/search/asia/china/chongqing" />
                        <CityLink name="ปักกิ่ง" href="/search/asia/china/beijing" />
                        <CityLink name="คุนหมิง" href="/search/asia/china/kunming" />
                        <CityLink name="กุ้ยหลิน" href="/search/asia/china/guilin" />
                        <CityLink name="ซีอาน" href="/search/asia/china/xian" />
                        <CityLink name="เส้นทางสายไหม" href="/search/asia/china/silk-road" />
                        <CityLink name="ซินเจียง" href="/search/asia/china/xinjiang" />
                        <CityLink name="ทิเบต" href="/search/asia/china/tibet" />
                        <CityLink name="ลี่เจียง" href="/search/asia/china/lijiang" />
                        <CityLink name="อี้ชาง" href="/search/asia/china/yichang" />
                        <CityLink name="หังโจว" href="/search/asia/china/hangzhou" />
                        <CityLink name="ต้าหลี่" href="/search/asia/china/dali" />
                        <CityLink name="กวางโจว" href="/search/asia/china/guangzhou" />
                        <CityLink name="ฮาร์บิ้น" href="/search/asia/china/harbin" />
                        <CityLink name="ลั่วหยาง" href="/search/asia/china/luoyang" />
                        <CityLink name="หุบเขาเทวดา" href="/search/asia/china/wangxian" />
                        <CityLink name="เอินซือ" href="/search/asia/china/enshi" />
                        <CityLink name="ชิงเต่า" href="/search/asia/china/qingdao" />
                        <CityLink name="ต้าเหลียน" href="/search/asia/china/dalian" />
                        <CityLink name="มองโกเลีย" href="/search/asia/china/inner-mongolia" />
                        <CityLink name="จู่ไห่" href="/search/asia/china/zhuhai" />
                      </div>
                      
                      {/* เส้นทางพิเศษ */}
                      <div className="mt-3 ml-2 border-t border-gray-100 pt-2">
                        <span className="text-xs font-bold text-gray-400 mb-1 block">เส้นทางพิเศษ</span>
                        <div className="flex flex-col gap-1">
                          <CityLink name="ทัวร์ไม่ลงร้าน" href="/search/asia/china/no-shopping" />
                          <CityLink name="ฉงชิ่ง-จางเจียเจี้ย" href="/search/asia/china/chongqing-zhangjiajie" />
                          <CityLink name="เซี่ยงไฮ้-ปักกิ่ง" href="/search/asia/china/shanghai-beijing" />
                          <CityLink name="จู่ไห่-มาเก๊า" href="/search/asia/china/zhuhai-macau" />
                          <CityLink name="กวางโจว-มาเก๊า" href="/search/asia/china/guangzhou-macau" />
                          <CityLink name="กวางโจว-ฮ่องกง" href="/search/asia/china/guangzhou-hongkong" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: เอเชีย */}
                  <div className="col-span-1">
                    <h3 className="text-lg font-bold text-gray-800 border-b-2 border-orange-500 pb-2 mb-4">ทัวร์เอเชีย</h3>
                    <ul className="space-y-3">
                      <CountryLink countryCode="kr" name="ทัวร์เกาหลีใต้" href="/search/asia/south-korea" />
                      <CountryLink countryCode="tw" name="ทัวร์ไต้หวัน" href="/search/asia/taiwan" />
                      <CountryLink countryCode="hk" name="ทัวร์ฮ่องกง" href="/search/asia/hongkong" />
                      <CountryLink countryCode="mo" name="ทัวร์มาเก๊า" href="/search/asia/macau" />
                      <CountryLink countryCode="vn" name="ทัวร์เวียดนาม" href="/search/asia/vietnam" />
                      <CountryLink countryCode="sg" name="ทัวร์สิงคโปร์" href="/search/asia/singapore" />
                      <CountryLink countryCode="my" name="ทัวร์มาเลเซีย" href="/search/asia/malaysia" />
                      <CountryLink countryCode="id" name="ทัวร์อินโดนีเซีย" href="/search/asia/indonesia" />
                      <CountryLink countryCode="in" name="ทัวร์อินเดีย" href="/search/asia/india" />
                      <CountryLink countryCode="mv" name="ทัวร์มัลดีฟส์" href="/search/asia/maldives" />
                    </ul>
                  </div>

                  {/* Column 3: ยุโรป & ตะวันออกกลาง */}
                  <div className="col-span-1">
                    <h3 className="text-lg font-bold text-gray-800 border-b-2 border-blue-500 pb-2 mb-4">ยุโรป & ตะวันออกกลาง</h3>
                    <ul className="space-y-3">
                      <CountryLink countryCode="ch" name="สวิตเซอร์แลนด์" href="/search/europe/switzerland" titleColor="hover:text-blue-600" />
                      <CountryLink countryCode="it" name="อิตาลี" href="/search/europe/italy" titleColor="hover:text-blue-600" />
                      <CountryLink countryCode="fr" name="ฝรั่งเศส" href="/search/europe/france" titleColor="hover:text-blue-600" />
                      <CountryLink countryCode="gb" name="อังกฤษ" href="/search/europe/uk" titleColor="hover:text-blue-600" />
                      <CountryLink countryCode="de" name="เยอรมนี" href="/search/europe/germany" titleColor="hover:text-blue-600" />
                      <CountryLink countryCode="at" name="ออสเตรีย" href="/search/europe/austria" titleColor="hover:text-blue-600" />
                      <CountryLink countryCode="cz" name="เช็ก" href="/search/europe/czech" titleColor="hover:text-blue-600" />
                      <CountryLink countryCode="es" name="สเปน" href="/search/europe/spain" titleColor="hover:text-blue-600" />
                      <CountryLink countryCode="nl" name="เนเธอร์แลนด์" href="/search/europe/netherlands" titleColor="hover:text-blue-600" />
                      <CountryLink countryCode="fi" name="ฟินแลนด์" href="/search/europe/finland" titleColor="hover:text-blue-600" />
                      <div className="my-2 pt-2 border-t border-gray-100"></div>
                      <CountryLink countryCode="tr" name="ทัวร์ตุรกี" href="/search/middle-east/turkey" titleColor="hover:text-blue-600" />
                      <CountryLink countryCode="ge" name="ทัวร์จอร์เจีย" href="/search/europe/georgia" titleColor="hover:text-blue-600" />
                      <CountryLink countryCode="eg" name="ทัวร์อียิปต์" href="/search/middle-east/egypt" titleColor="hover:text-blue-600" />
                      <CountryLink countryCode="jo" name="ทัวร์จอร์แดน" href="/search/middle-east/jordan" titleColor="hover:text-blue-600" />
                      <CountryLink countryCode="ma" name="ทัวร์โมร็อกโก" href="/search/africa/morocco" titleColor="hover:text-blue-600" />
                    </ul>
                  </div>

                  {/* Column 4: อเมริกา & โอเชียเนีย */}
                  <div className="col-span-1">
                    <h3 className="text-lg font-bold text-gray-800 border-b-2 border-emerald-500 pb-2 mb-4">อเมริกา & โอเชียเนีย</h3>
                    <ul className="space-y-3">
                      <CountryLink countryCode="us" name="ทัวร์อเมริกา" href="/search/america/usa" titleColor="hover:text-emerald-600" />
                      <CountryLink countryCode="ca" name="ทัวร์แคนาดา" href="/search/america/canada" titleColor="hover:text-emerald-600" />
                      <div className="my-4 pt-4 border-t border-gray-100"></div>
                      <CountryLink countryCode="au" name="ทัวร์ออสเตรเลีย" href="/search/oceania/australia" titleColor="hover:text-emerald-600" />
                      <CountryLink countryCode="nz" name="ทัวร์นิวซีแลนด์" href="/search/oceania/new-zealand" titleColor="hover:text-emerald-600" />
                    </ul>
                  </div>

                </div>
              </div>
            </div>
          </div>

          <Link href="/search/thailand" className="px-4 py-2 text-gray-600 hover:text-orange-500 font-medium transition-colors">
            เที่ยวไทย
          </Link>
          
          <Link href="/ai-planner" className="px-4 py-2 text-orange-500 hover:text-orange-600 font-bold transition-colors flex items-center gap-1">
            ✨ AI ออกแบบทริป
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
