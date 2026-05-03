"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Map, Compass, Flame, Users, BookOpen, Star, FileText, Smartphone } from "lucide-react";
import AuthButtons from "@/components/AuthButtons";
import { useState } from "react";

interface HeaderProps {
  agentLogo?: string | null;
  agentName?: string | null;
}

export default function Header({ agentLogo, agentName }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMobileSection, setActiveMobileSection] = useState<string | null>(null);

  if (pathname === "/" || pathname.startsWith("/admin")) {
    return null;
  }

  const toggleMobileSection = (section: string) => {
    setActiveMobileSection(activeMobileSection === section ? null : section);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-border relative z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-20">
        <Link href="/" className="flex items-center gap-2">
          {agentLogo ? (
            <img src={agentLogo} alt={agentName || "Agent Logo"} className="h-10 object-contain" />
          ) : (
            <span className="text-2xl md:text-3xl font-black tracking-tight text-trust-900">
              <span className="text-primary">Jong</span>tour <span className="text-primary font-bold">AI</span>
            </span>
          )}
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1">
          
          <NavLink href="/" label="หน้าแรก" />
          
          <div className="group py-8 relative">
            <button className="flex items-center gap-1 px-3 py-2 text-trust-700 group-hover:text-primary font-medium transition-colors whitespace-nowrap text-[15px]">
              ค้นหาทัวร์
              <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
            </button>
            <div className="absolute left-0 top-[80px] w-56 bg-white border border-border shadow-floating rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top translate-y-2 group-hover:translate-y-0 p-2 z-50">
               <DropdownLink href="/tour/search" icon={Map} label="ค้นหาทัวร์ทั้งหมด" />
               <DropdownLink href="/ai-planner" icon={Compass} label="AI ช่วยหาทัวร์" />
               <DropdownLink href="/compare" icon={Star} label="เปรียบเทียบทัวร์" />
               <DropdownLink href="/ai-planner?action=image" icon={Smartphone} label="ค้นหาด้วยรูปภาพ / PDF" />
            </div>
          </div>

          {/* ทัวร์ต่างประเทศ MEGA MENU */}
          <div className="group py-8 relative">
            <button className="flex items-center gap-1 px-3 py-2 text-trust-700 group-hover:text-primary font-medium transition-colors whitespace-nowrap text-[15px]">
              ทัวร์ต่างประเทศ
              <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
            </button>
            <div className="absolute left-1/2 -translate-x-1/2 top-[80px] w-[800px] bg-white border border-border shadow-floating rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top translate-y-2 group-hover:translate-y-0 p-6 z-50 flex gap-8">
               
               {/* ทัวร์ญี่ปุ่น */}
               <div className="flex-1">
                  <div className="flex items-center justify-between border-b-2 border-primary pb-2 mb-4">
                     <h3 className="text-base font-black text-trust-900">🇯🇵 ทัวร์ญี่ปุ่น</h3>
                     <Link href="/country/japan" className="text-xs font-bold text-primary hover:underline">ดูทั้งหมด</Link>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                     <div>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">เมืองยอดนิยม</p>
                        <ul className="space-y-2">
                           <CityLink name="โตเกียว" href="/country/japan/tokyo" />
                           <CityLink name="โอซาก้า" href="/country/japan/osaka" />
                           <CityLink name="เกียวโต" href="/country/japan/kyoto" />
                           <CityLink name="ฮอกไกโด" href="/country/japan/hokkaido" />
                           <CityLink name="ฟุกุโอกะ" href="/country/japan/fukuoka" />
                           <CityLink name="โอกินาว่า" href="/country/japan/okinawa" />
                        </ul>
                     </div>
                     <div>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">ภูมิภาค</p>
                        <ul className="space-y-2 mb-4">
                           <CityLink name="คันไซ" href="/country/japan/kansai" />
                           <CityLink name="คิวชู" href="/country/japan/kyushu" />
                           <CityLink name="โทโฮคุ" href="/country/japan/tohoku" />
                           <CityLink name="ฟูจิ" href="/country/japan/fuji" />
                        </ul>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">โปรโมชัน</p>
                        <ul className="space-y-2">
                           <CityLink name="🌸 ทัวร์ซากุระ" href="/country/japan/sakura" highlight />
                           <CityLink name="🍁 ใบไม้เปลี่ยนสี" href="/country/japan/autumn" highlight />
                           <CityLink name="⛄ ทัวร์หิมะ" href="/country/japan/winter" highlight />
                           <CityLink name="🔥 ไฟไหม้ญี่ปุ่น" href="/country/japan/flash-sale" highlight className="text-destructive" />
                        </ul>
                     </div>
                  </div>
               </div>

               {/* ทัวร์จีน */}
               <div className="flex-1 border-l border-border pl-8">
                  <div className="flex items-center justify-between border-b-2 border-red-500 pb-2 mb-4">
                     <h3 className="text-base font-black text-trust-900">🇨🇳 ทัวร์จีน</h3>
                     <Link href="/country/china" className="text-xs font-bold text-red-500 hover:underline">ดูทั้งหมด</Link>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                     <div>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">เมืองยอดนิยม</p>
                        <ul className="space-y-2">
                           <CityLink name="ปักกิ่ง" href="/country/china/beijing" />
                           <CityLink name="เซี่ยงไฮ้" href="/country/china/shanghai" />
                           <CityLink name="เฉิงตู" href="/country/china/chengdu" />
                           <CityLink name="ฉงชิ่ง" href="/country/china/chongqing" />
                           <CityLink name="ซีอาน" href="/country/china/xian" />
                           <CityLink name="คุนหมิง" href="/country/china/kunming" />
                        </ul>
                     </div>
                     <div>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">ธรรมชาติ / วิวสวย</p>
                        <ul className="space-y-2 mb-4">
                           <CityLink name="จางเจียเจี้ย" href="/country/china/zhangjiajie" />
                           <CityLink name="กุ้ยหลิน" href="/country/china/guilin" />
                           <CityLink name="ลี่เจียง" href="/country/china/lijiang" />
                           <CityLink name="ต้าหลี่" href="/country/china/dali" />
                           <CityLink name="แชงกรีล่า" href="/country/china/shangri-la" />
                        </ul>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">โปรโมชัน</p>
                        <ul className="space-y-2">
                           <CityLink name="🧧 ทัวร์ตรุษจีน" href="/country/china/chinese-new-year" highlight />
                           <CityLink name="🎆 ทัวร์ปีใหม่จีน" href="/country/china/new-year" highlight />
                           <CityLink name="🔥 ไฟไหม้จีน" href="/country/china/flash-sale" highlight className="text-destructive" />
                        </ul>
                     </div>
                  </div>
               </div>

            </div>
          </div>

          {/* Wholesale */}
          <div className="group py-8 relative">
            <button className="flex items-center gap-1 px-3 py-2 text-trust-700 group-hover:text-primary font-medium transition-colors whitespace-nowrap text-[15px]">
              ทัวร์ตามโฮลเซล
              <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
            </button>
            <div className="absolute left-0 top-[80px] w-56 bg-white border border-border shadow-floating rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top translate-y-2 group-hover:translate-y-0 p-2 z-50">
               <DropdownLink href="/wholesale/letgo-group" label="Let's go Group" />
               <DropdownLink href="/wholesale/go365" label="Go365" />
               <DropdownLink href="/wholesale/check-in-group" label="Check in Group" />
               <DropdownLink href="/wholesale/tour-factory" label="Tour Factory" />
               <div className="my-1 border-t border-border"></div>
               <DropdownLink href="/wholesale" label="ดูโฮลเซลทั้งหมด" className="font-bold text-primary" />
            </div>
          </div>

          <NavLink href="/deals/flash-sale" label="🔥 โปรโมชัน" className="text-destructive hover:text-destructive font-bold" />
          
          {/* Private Group */}
          <div className="group py-8 relative">
            <button className="flex items-center gap-1 px-3 py-2 text-trust-700 group-hover:text-primary font-medium transition-colors whitespace-nowrap text-[15px]">
              กรุ๊ปส่วนตัว
              <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
            </button>
            <div className="absolute left-0 top-[80px] w-56 bg-white border border-border shadow-floating rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top translate-y-2 group-hover:translate-y-0 p-2 z-50">
               <DropdownLink href="/ai-planner" icon={Compass} label="ให้ AI ออกแบบทริป" />
               <DropdownLink href="/contact?type=quotation" icon={FileText} label="ขอใบเสนอราคา" />
               <DropdownLink href="/private-group/examples" icon={Users} label="ตัวอย่างกรุ๊ปส่วนตัว" />
            </div>
          </div>

          {/* บทความ */}
          <div className="group py-8 relative">
            <button className="flex items-center gap-1 px-3 py-2 text-trust-700 group-hover:text-primary font-medium transition-colors whitespace-nowrap text-[15px]">
              บทความ
              <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
            </button>
            <div className="absolute left-0 top-[80px] w-48 bg-white border border-border shadow-floating rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top translate-y-2 group-hover:translate-y-0 p-2 z-50">
               <DropdownLink href="/blog/guides" label="คู่มือท่องเที่ยว" />
               <DropdownLink href="/blog/destinations" label="แนะนำประเทศ" />
               <DropdownLink href="/blog/visa" label="วีซ่า" />
               <DropdownLink href="/how-to-book" label="วิธีจอง" />
               <DropdownLink href="/faq" label="FAQ" />
            </div>
          </div>

          <NavLink href="/contact" label="ติดต่อเรา" />
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block">
             <AuthButtons />
          </div>
          
          {/* Mobile Menu Toggle */}
          <button 
             className="lg:hidden p-2 text-trust-700"
             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
          </button>
        </div>
      </div>

      {/* Mobile Accordion Menu */}
      {mobileMenuOpen && (
         <div className="lg:hidden absolute top-20 left-0 right-0 bg-white border-b border-border shadow-floating max-h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar p-4">
            <div className="flex flex-col space-y-2">
               <Link href="/" className="p-3 font-bold text-trust-900 border-b border-border" onClick={() => setMobileMenuOpen(false)}>หน้าแรก</Link>
               
               <MobileAccordion 
                  title="ทัวร์ต่างประเทศ" 
                  isOpen={activeMobileSection === 'overseas'} 
                  onClick={() => toggleMobileSection('overseas')}
               >
                  <div className="pl-4 space-y-2 mt-2">
                     <p className="text-xs font-bold text-primary mt-2">ทัวร์ญี่ปุ่น</p>
                     <div className="grid grid-cols-2 gap-2">
                        <Link href="/country/japan/tokyo" className="text-sm text-trust-700 py-1" onClick={() => setMobileMenuOpen(false)}>โตเกียว</Link>
                        <Link href="/country/japan/osaka" className="text-sm text-trust-700 py-1" onClick={() => setMobileMenuOpen(false)}>โอซาก้า</Link>
                        <Link href="/country/japan/hokkaido" className="text-sm text-trust-700 py-1" onClick={() => setMobileMenuOpen(false)}>ฮอกไกโด</Link>
                     </div>
                     <Link href="/country/japan" className="text-xs text-primary font-bold block mt-1" onClick={() => setMobileMenuOpen(false)}>ดูทัวร์ญี่ปุ่นทั้งหมด ➔</Link>
                     
                     <p className="text-xs font-bold text-red-500 mt-4">ทัวร์จีน</p>
                     <div className="grid grid-cols-2 gap-2">
                        <Link href="/country/china/beijing" className="text-sm text-trust-700 py-1" onClick={() => setMobileMenuOpen(false)}>ปักกิ่ง</Link>
                        <Link href="/country/china/shanghai" className="text-sm text-trust-700 py-1" onClick={() => setMobileMenuOpen(false)}>เซี่ยงไฮ้</Link>
                        <Link href="/country/china/chengdu" className="text-sm text-trust-700 py-1" onClick={() => setMobileMenuOpen(false)}>เฉิงตู</Link>
                     </div>
                     <Link href="/country/china" className="text-xs text-red-500 font-bold block mt-1" onClick={() => setMobileMenuOpen(false)}>ดูทัวร์จีนทั้งหมด ➔</Link>
                  </div>
               </MobileAccordion>

               <MobileAccordion 
                  title="ทัวร์ตามโฮลเซล" 
                  isOpen={activeMobileSection === 'wholesale'} 
                  onClick={() => toggleMobileSection('wholesale')}
               >
                  <div className="pl-4 space-y-2 mt-2 flex flex-col">
                     <Link href="/wholesale/letgo-group" className="text-sm text-trust-700 py-2" onClick={() => setMobileMenuOpen(false)}>Let's go Group</Link>
                     <Link href="/wholesale/go365" className="text-sm text-trust-700 py-2" onClick={() => setMobileMenuOpen(false)}>Go365</Link>
                     <Link href="/wholesale/check-in-group" className="text-sm text-trust-700 py-2" onClick={() => setMobileMenuOpen(false)}>Check in Group</Link>
                     <Link href="/wholesale/tour-factory" className="text-sm text-trust-700 py-2" onClick={() => setMobileMenuOpen(false)}>Tour Factory</Link>
                  </div>
               </MobileAccordion>

               <Link href="/deals/flash-sale" className="p-3 font-bold text-destructive border-b border-border" onClick={() => setMobileMenuOpen(false)}>🔥 โปรโมชันไฟไหม้</Link>
               
               <div className="p-4 mt-4">
                  <AuthButtons />
               </div>
            </div>
         </div>
      )}
    </nav>
  );
}

function NavLink({ href, label, className = "" }: { href: string, label: string, className?: string }) {
  return (
    <Link href={href} className={`px-3 py-2 text-[15px] font-medium text-trust-700 hover:text-primary transition-colors whitespace-nowrap ${className}`}>
      {label}
    </Link>
  );
}

function DropdownLink({ href, label, icon: Icon, className = "" }: { href: string, label: string, icon?: any, className?: string }) {
  return (
    <Link href={href} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-trust-700 hover:text-primary hover:bg-primary-50 rounded-lg transition-colors ${className}`}>
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </Link>
  );
}

function CityLink({ name, href, highlight, className = "" }: { name: string, href: string, highlight?: boolean, className?: string }) {
  return (
    <li>
       <Link href={href} className={`text-sm flex items-center gap-2 transition-colors ${highlight ? 'font-bold' : 'font-medium'} ${className || 'text-trust-700 hover:text-primary'}`}>
         {!highlight && <span className="w-1.5 h-1.5 rounded-full bg-border shrink-0"></span>}
         {name}
       </Link>
    </li>
  );
}

function MobileAccordion({ title, isOpen, onClick, children }: { title: string, isOpen: boolean, onClick: () => void, children: React.ReactNode }) {
   return (
      <div className="border-b border-border">
         <button className="flex items-center justify-between w-full p-3 font-bold text-trust-900" onClick={onClick}>
            {title}
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
         </button>
         {isOpen && (
            <div className="pb-3 px-3">
               {children}
            </div>
         )}
      </div>
   );
}
