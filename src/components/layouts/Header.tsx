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

  const isInternalPortal = [
    '/admin', '/b2badmin', '/b2b', '/sale', '/supplier', '/tour-cms', 
    '/booking/admin', '/tour/admin', '/info/admin'
  ].some(path => pathname.startsWith(path));

  if (pathname === "/" || isInternalPortal) {
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
            <div className="absolute left-1/2 -translate-x-1/2 top-[80px] w-screen max-w-[1100px] bg-white border border-border shadow-floating rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top translate-y-2 group-hover:translate-y-0 p-6 z-50 flex gap-6">
               
               {/* Column 1: Asia */}
               <div className="flex-1">
                  <div className="flex items-center justify-between border-b-2 border-primary pb-2 mb-4">
                     <h3 className="text-sm font-black text-trust-900">🌏 เอเชีย</h3>
                     <Link href="/region/asia" className="text-[10px] font-bold text-primary hover:underline">ดูทั้งหมด</Link>
                  </div>
                  <ul className="space-y-1.5">
                     <CityLink name="ทัวร์เอเชียทั้งหมด" href="/region/asia" className="font-bold text-trust-900" />
                     <CityLink name="ญี่ปุ่น" href="/country/japan" />
                     <CityLink name="จีน" href="/country/china" />
                     <CityLink name="เกาหลี" href="/country/korea" />
                     <CityLink name="ไต้หวัน" href="/country/taiwan" />
                     <CityLink name="ฮ่องกง" href="/country/hong-kong" />
                     <CityLink name="สิงคโปร์" href="/country/singapore" />
                     <CityLink name="เวียดนาม" href="/country/vietnam" />
                  </ul>
               </div>

               {/* Column 2: Europe */}
               <div className="flex-[1.5] border-l border-border pl-6">
                  <div className="flex items-center justify-between border-b-2 border-blue-600 pb-2 mb-4">
                     <h3 className="text-sm font-black text-trust-900">🏰 ยุโรป</h3>
                     <Link href="/region/europe" className="text-[10px] font-bold text-blue-600 hover:underline">ดูทั้งหมด</Link>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-4">
                     <div>
                        <ul className="space-y-1.5">
                           <CityLink name="ทัวร์ยุโรปทั้งหมด" href="/region/europe" className="font-bold text-trust-900" />
                           <CityLink name="แกรนด์ยุโรป" href="/region/europe/grand-europe" />
                           <CityLink name="สวิตเซอร์แลนด์" href="/country/switzerland" />
                           <CityLink name="ฝรั่งเศส" href="/country/france" />
                           <CityLink name="อิตาลี" href="/country/italy" />
                           <CityLink name="อังกฤษ" href="/country/uk" />
                           <CityLink name="เยอรมนี" href="/country/germany" />
                           <CityLink name="ออสเตรีย" href="/country/austria" />
                        </ul>
                     </div>
                     <div>
                        <ul className="space-y-1.5">
                           <CityLink name="สเปน" href="/country/spain" />
                           <CityLink name="โปรตุเกส" href="/country/portugal" />
                           <CityLink name="เช็ก" href="/country/czech-republic" />
                           <CityLink name="ฮังการี" href="/country/hungary" />
                           <CityLink name="ไอซ์แลนด์" href="/country/iceland" />
                           <CityLink name="สแกนดิเนเวีย" href="/region/europe/scandinavia" />
                           <CityLink name="บอลข่าน" href="/region/europe/balkans" />
                        </ul>
                     </div>
                  </div>
               </div>

               {/* Column 3: Middle East / Africa */}
               <div className="flex-[1.2] border-l border-border pl-6">
                  <div className="flex items-center justify-between border-b-2 border-amber-600 pb-2 mb-4">
                     <h3 className="text-sm font-black text-trust-900">🐪 ตะวันออกกลาง / คอเคซัส / แอฟริกาเหนือ</h3>
                     <Link href="/region/middle-east-caucasus-north-africa" className="text-[10px] font-bold text-amber-600 hover:underline shrink-0 ml-2">ดูทั้งหมด</Link>
                  </div>
                  <ul className="space-y-1.5">
                     <CityLink name="ทัวร์ตะวันออกกลางทั้งหมด" href="/region/middle-east-caucasus-north-africa" className="font-bold text-trust-900" />
                     <CityLink name="อียิปต์" href="/country/egypt" />
                     <CityLink name="จอร์เจีย" href="/country/georgia" />
                     <CityLink name="ตุรกี" href="/country/turkey" />
                     <CityLink name="ดูไบ" href="/country/dubai" />
                     <CityLink name="จอร์แดน" href="/country/jordan" />
                     <CityLink name="โมร็อกโก" href="/country/morocco" />
                  </ul>
               </div>

               {/* Column 4: America / Australia */}
               <div className="flex-1 border-l border-border pl-6">
                  <div className="flex items-center justify-between border-b-2 border-emerald-600 pb-2 mb-4">
                     <h3 className="text-sm font-black text-trust-900">🗽 อเมริกา / ออสเตรเลีย</h3>
                     <Link href="/region/america-australia" className="text-[10px] font-bold text-emerald-600 hover:underline">ดูทั้งหมด</Link>
                  </div>
                  <ul className="space-y-1.5">
                     <CityLink name="ทัวร์ทั้งหมด" href="/region/america-australia" className="font-bold text-trust-900" />
                     <CityLink name="อเมริกา" href="/country/united-states" />
                     <CityLink name="แคนาดา" href="/country/canada" />
                     <CityLink name="ออสเตรเลีย" href="/country/australia" />
                     <CityLink name="นิวซีแลนด์" href="/country/new-zealand" />
                  </ul>
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

          <NavLink href="/info/contact" label="ติดต่อเรา" />
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
                  <div className="pl-4 space-y-4 mt-2">
                     <div>
                        <p className="text-xs font-bold text-primary mb-2">🌏 เอเชีย</p>
                        <div className="grid grid-cols-2 gap-2">
                           <Link href="/region/asia" className="text-sm font-bold text-trust-700 py-1" onClick={() => setMobileMenuOpen(false)}>ทัวร์เอเชียทั้งหมด</Link>
                           <Link href="/country/japan" className="text-sm text-trust-700 py-1" onClick={() => setMobileMenuOpen(false)}>ญี่ปุ่น</Link>
                           <Link href="/country/china" className="text-sm text-trust-700 py-1" onClick={() => setMobileMenuOpen(false)}>จีน</Link>
                           <Link href="/country/korea" className="text-sm text-trust-700 py-1" onClick={() => setMobileMenuOpen(false)}>เกาหลี</Link>
                           <Link href="/country/taiwan" className="text-sm text-trust-700 py-1" onClick={() => setMobileMenuOpen(false)}>ไต้หวัน</Link>
                           <Link href="/country/hong-kong" className="text-sm text-trust-700 py-1" onClick={() => setMobileMenuOpen(false)}>ฮ่องกง</Link>
                           <Link href="/country/singapore" className="text-sm text-trust-700 py-1" onClick={() => setMobileMenuOpen(false)}>สิงคโปร์</Link>
                           <Link href="/country/vietnam" className="text-sm text-trust-700 py-1" onClick={() => setMobileMenuOpen(false)}>เวียดนาม</Link>
                        </div>
                     </div>
                     <div>
                        <p className="text-xs font-bold text-blue-600 mb-2">🏰 ยุโรป</p>
                        <div className="grid grid-cols-2 gap-2">
                           <Link href="/region/europe" className="text-sm font-bold text-trust-700 py-1" onClick={() => setMobileMenuOpen(false)}>ทัวร์ยุโรปทั้งหมด</Link>
                           <Link href="/region/europe/grand-europe" className="text-sm text-trust-700 py-1" onClick={() => setMobileMenuOpen(false)}>แกรนด์ยุโรป</Link>
                           <Link href="/country/switzerland" className="text-sm text-trust-700 py-1" onClick={() => setMobileMenuOpen(false)}>สวิตเซอร์แลนด์</Link>
                           <Link href="/country/france" className="text-sm text-trust-700 py-1" onClick={() => setMobileMenuOpen(false)}>ฝรั่งเศส</Link>
                           <Link href="/country/italy" className="text-sm text-trust-700 py-1" onClick={() => setMobileMenuOpen(false)}>อิตาลี</Link>
                           <Link href="/country/uk" className="text-sm text-trust-700 py-1" onClick={() => setMobileMenuOpen(false)}>อังกฤษ</Link>
                           <Link href="/country/germany" className="text-sm text-trust-700 py-1" onClick={() => setMobileMenuOpen(false)}>เยอรมนี</Link>
                           <Link href="/country/austria" className="text-sm text-trust-700 py-1" onClick={() => setMobileMenuOpen(false)}>ออสเตรีย</Link>
                           <Link href="/country/spain" className="text-sm text-trust-700 py-1" onClick={() => setMobileMenuOpen(false)}>สเปน</Link>
                           <Link href="/country/portugal" className="text-sm text-trust-700 py-1" onClick={() => setMobileMenuOpen(false)}>โปรตุเกส</Link>
                           <Link href="/country/czech-republic" className="text-sm text-trust-700 py-1" onClick={() => setMobileMenuOpen(false)}>เช็ก</Link>
                           <Link href="/country/hungary" className="text-sm text-trust-700 py-1" onClick={() => setMobileMenuOpen(false)}>ฮังการี</Link>
                           <Link href="/country/iceland" className="text-sm text-trust-700 py-1" onClick={() => setMobileMenuOpen(false)}>ไอซ์แลนด์</Link>
                           <Link href="/region/europe/scandinavia" className="text-sm text-trust-700 py-1" onClick={() => setMobileMenuOpen(false)}>สแกนดิเนเวีย</Link>
                           <Link href="/region/europe/balkans" className="text-sm text-trust-700 py-1" onClick={() => setMobileMenuOpen(false)}>บอลข่าน</Link>
                        </div>
                     </div>
                     <div>
                        <p className="text-xs font-bold text-amber-600 mb-2">🐪 ตะวันออกกลาง / คอเคซัส / แอฟริกาเหนือ</p>
                        <div className="grid grid-cols-2 gap-2">
                           <Link href="/region/middle-east-caucasus-north-africa" className="text-sm font-bold text-trust-700 py-1" onClick={() => setMobileMenuOpen(false)}>ทัวร์ทั้งหมด</Link>
                           <Link href="/country/egypt" className="text-sm text-trust-700 py-1" onClick={() => setMobileMenuOpen(false)}>อียิปต์</Link>
                           <Link href="/country/georgia" className="text-sm text-trust-700 py-1" onClick={() => setMobileMenuOpen(false)}>จอร์เจีย</Link>
                           <Link href="/country/turkey" className="text-sm text-trust-700 py-1" onClick={() => setMobileMenuOpen(false)}>ตุรกี</Link>
                           <Link href="/country/dubai" className="text-sm text-trust-700 py-1" onClick={() => setMobileMenuOpen(false)}>ดูไบ</Link>
                           <Link href="/country/jordan" className="text-sm text-trust-700 py-1" onClick={() => setMobileMenuOpen(false)}>จอร์แดน</Link>
                           <Link href="/country/morocco" className="text-sm text-trust-700 py-1" onClick={() => setMobileMenuOpen(false)}>โมร็อกโก</Link>
                        </div>
                     </div>
                     <div>
                        <p className="text-xs font-bold text-emerald-600 mb-2">🗽 อเมริกา / ออสเตรเลีย</p>
                        <div className="grid grid-cols-2 gap-2">
                           <Link href="/region/america-australia" className="text-sm font-bold text-trust-700 py-1" onClick={() => setMobileMenuOpen(false)}>ทัวร์ทั้งหมด</Link>
                           <Link href="/country/united-states" className="text-sm text-trust-700 py-1" onClick={() => setMobileMenuOpen(false)}>อเมริกา</Link>
                           <Link href="/country/canada" className="text-sm text-trust-700 py-1" onClick={() => setMobileMenuOpen(false)}>แคนาดา</Link>
                           <Link href="/country/australia" className="text-sm text-trust-700 py-1" onClick={() => setMobileMenuOpen(false)}>ออสเตรเลีย</Link>
                           <Link href="/country/new-zealand" className="text-sm text-trust-700 py-1" onClick={() => setMobileMenuOpen(false)}>นิวซีแลนด์</Link>
                        </div>
                     </div>
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

