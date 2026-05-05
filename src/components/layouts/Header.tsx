"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Map, Compass, Flame, Users, BookOpen, Star, FileText, Smartphone } from "lucide-react";
import AuthButtons from "@/components/AuthButtons";
import NotificationBell from "@/components/NotificationBell";
import { useState } from "react";
import { megaMenuConfig } from "@/config/megaMenu";

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

  // Map icon strings to actual Lucide components
  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Map': return Map;
      case 'Compass': return Compass;
      case 'Star': return Star;
      case 'Smartphone': return Smartphone;
      case 'FileText': return FileText;
      case 'Users': return Users;
      default: return undefined;
    }
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
          
          {/* ค้นหาทัวร์ */}
          <div className="group py-8 relative">
            <button className="flex items-center gap-1 px-3 py-2 text-trust-700 group-hover:text-primary font-medium transition-colors whitespace-nowrap text-[15px]">
              ค้นหาทัวร์
              <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
            </button>
            <div className="absolute left-0 top-[80px] w-56 bg-white border border-border shadow-floating rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top translate-y-2 group-hover:translate-y-0 p-2 z-50">
               {megaMenuConfig.searchTours.map((item, idx) => (
                 <DropdownLink key={idx} href={item.href} icon={getIcon(item.icon)} label={item.label} />
               ))}
            </div>
          </div>

          {/* ทัวร์ต่างประเทศ MEGA MENU */}
          <div className="group py-8 relative">
            <button className="flex items-center gap-1 px-3 py-2 text-trust-700 group-hover:text-primary font-medium transition-colors whitespace-nowrap text-[15px]">
              ทัวร์ต่างประเทศ
              <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
            </button>
            <div className="absolute left-1/2 -translate-x-1/2 top-[80px] w-screen max-w-[1100px] bg-white border border-border shadow-floating rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top translate-y-2 group-hover:translate-y-0 p-6 z-50 flex gap-6">
               
               {megaMenuConfig.overseasTours.map((col, idx) => (
                 <div key={idx} className={`flex-1 ${idx > 0 ? 'border-l border-border pl-6' : ''}`}>
                    <div className={`flex items-center justify-between border-b-2 border-${col.colorClass} pb-2 mb-4`}>
                       <h3 className="text-sm font-black text-trust-900">{col.title}</h3>
                       {col.titleHref && (
                         <Link href={col.titleHref} className={`text-[10px] font-bold text-${col.colorClass} hover:underline`}>ดูทั้งหมด</Link>
                       )}
                    </div>
                    {col.sections.length > 1 ? (
                      <div className="grid grid-cols-2 gap-x-2 gap-y-4">
                        {col.sections.map((section, sIdx) => (
                          <div key={sIdx}>
                            <ul className="space-y-1.5">
                              {section.items.map((item, iIdx) => (
                                <CityLink key={iIdx} name={item.label} href={item.href} highlight={item.isBold} className={item.isBold ? "font-bold text-trust-900" : ""} />
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <ul className="space-y-1.5">
                        {col.sections[0].items.map((item, iIdx) => (
                          <CityLink key={iIdx} name={item.label} href={item.href} highlight={item.isBold} className={item.isBold ? "font-bold text-trust-900" : ""} />
                        ))}
                      </ul>
                    )}
                 </div>
               ))}

            </div>
          </div>

          {/* Wholesale */}
          <div className="group py-8 relative">
            <button className="flex items-center gap-1 px-3 py-2 text-trust-700 group-hover:text-primary font-medium transition-colors whitespace-nowrap text-[15px]">
              ทัวร์ตามโฮลเซล
              <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
            </button>
            <div className="absolute left-0 top-[80px] w-56 bg-white border border-border shadow-floating rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top translate-y-2 group-hover:translate-y-0 p-2 z-50">
               {megaMenuConfig.wholesale.map((item, idx) => (
                 item.isFooter ? (
                   <div key={idx}>
                     <div className="my-1 border-t border-border"></div>
                     <DropdownLink href={item.href} label={item.label} className="font-bold text-primary" />
                   </div>
                 ) : (
                   <DropdownLink key={idx} href={item.href} label={item.label} />
                 )
               ))}
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
               {megaMenuConfig.privateGroup.map((item, idx) => (
                 <DropdownLink key={idx} href={item.href} icon={getIcon(item.icon)} label={item.label} />
               ))}
            </div>
          </div>

          {/* บทความ */}
          <div className="group py-8 relative">
            <button className="flex items-center gap-1 px-3 py-2 text-trust-700 group-hover:text-primary font-medium transition-colors whitespace-nowrap text-[15px]">
              บทความ
              <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
            </button>
            <div className="absolute left-0 top-[80px] w-48 bg-white border border-border shadow-floating rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top translate-y-2 group-hover:translate-y-0 p-2 z-50">
               {megaMenuConfig.blog.map((item, idx) => (
                 <DropdownLink key={idx} href={item.href} label={item.label} />
               ))}
            </div>
          </div>

          <NavLink href="/talents" label="🧑‍✈️ ไกด์" />
          <NavLink href="/contact" label="ติดต่อเรา" />
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2">
             <NotificationBell />
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
                     {megaMenuConfig.overseasTours.map((col, idx) => (
                       <div key={idx}>
                          <p className={`text-xs font-bold text-${col.colorClass} mb-2`}>{col.title}</p>
                          <div className="grid grid-cols-2 gap-2">
                             {col.sections.flatMap(s => s.items).map((item, iIdx) => (
                               <Link key={iIdx} href={item.href} className={`text-sm ${item.isBold ? 'font-bold' : ''} text-trust-700 py-1`} onClick={() => setMobileMenuOpen(false)}>{item.label}</Link>
                             ))}
                          </div>
                       </div>
                     ))}
                  </div>
               </MobileAccordion>

               <MobileAccordion 
                  title="ทัวร์ตามโฮลเซล" 
                  isOpen={activeMobileSection === 'wholesale'} 
                  onClick={() => toggleMobileSection('wholesale')}
               >
                  <div className="pl-4 space-y-2 mt-2 flex flex-col">
                     {megaMenuConfig.wholesale.map((item, idx) => (
                       <Link key={idx} href={item.href} className={`text-sm ${item.isBold ? 'font-bold' : ''} text-trust-700 py-2`} onClick={() => setMobileMenuOpen(false)}>{item.label}</Link>
                     ))}
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
