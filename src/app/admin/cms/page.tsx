import Link from "next/link";
import { LayoutDashboard, FileText, Globe, MapPin, Building2, Flame, Calendar, Tag, Search, RefreshCw, Layers, Plus, Settings, Eye, Edit, Trash2, MoreVertical, Link as LinkIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui-new/Card";
import { Badge } from "@/components/ui-new/Badge";
import { Button } from "@/components/ui-new/Button";
import { Input } from "@/components/ui-new/Input";

export const metadata = {
  title: "Jongtour CMS | Manage Landing Pages & Menus"
};

export default function AdminCMSPage() {
  const menuItems = [
    { icon: Layers, label: "Menu Builder", desc: "จัดการเมนูหลักและ Mega Menu", active: true },
    { icon: FileText, label: "All Landing Pages", desc: "หน้า Landing Page ทั้งหมด", count: 142 },
    { icon: Globe, label: "Country Pages", desc: "หน้าทัวร์แยกตามประเทศ", count: 15 },
    { icon: MapPin, label: "City Pages", desc: "หน้าทัวร์แยกตามเมือง", count: 48 },
    { icon: Building2, label: "Wholesale Pages", desc: "หน้าโฮลเซลล์และพาร์ทเนอร์", count: 12 },
    { icon: Flame, label: "Promotion Pages", desc: "หน้าโปรโมชันและไฟไหม้", count: 8 },
    { icon: Calendar, label: "Festival Pages", desc: "หน้าเทศกาล (สงกรานต์, ปีใหม่)", count: 6 },
    { icon: Tag, label: "Style Pages", desc: "หน้าตามรูปแบบการเที่ยว", count: 14 },
    { icon: Search, label: "SEO Settings", desc: "ตั้งค่า SEO ระดับ Global" },
    { icon: RefreshCw, label: "Redirects (301)", desc: "จัดการการเปลี่ยนเส้นทาง URL", count: 23 },
    { icon: LinkIcon, label: "Sitemap XML", desc: "อัปเดต sitemap.xml แบบอัตโนมัติ" },
  ];

  const recentPages = [
    { id: 1, title: "ทัวร์โตเกียว โปรโมชัน", slug: "/country/japan/tokyo", type: "City Page", filter: "city=tokyo", status: "Published", views: "12.5k", date: "Today, 10:30" },
    { id: 2, title: "ทัวร์ไฟไหม้", slug: "/deals/flash-sale", type: "Promotion", filter: "is_flash=true", status: "Published", views: "45.2k", date: "Yesterday, 14:00" },
    { id: 3, title: "Let's Go Group Official", slug: "/wholesale/letgo-group", type: "Wholesale", filter: "supplierId=SUP_LETGO", status: "Published", views: "8.1k", date: "2 days ago" },
    { id: 4, title: "ทัวร์ฮ่องกง ดิสนีย์แลนด์", slug: "/country/hongkong/disneyland", type: "City Page", filter: "city=hongkong, tag=disney", status: "Draft", views: "-", date: "3 days ago" },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-trust-900 tracking-tight flex items-center gap-2">
             <LayoutDashboard className="w-6 h-6 text-primary" /> Content Management System
          </h2>
          <p className="text-sm text-muted-foreground mt-1">จัดการโครงสร้างเมนู Landing Page และ SEO ของเว็บไซต์ (Presentation Layer)</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="bg-white gap-2"><Settings className="w-4 h-4" /> SEO Global Settings</Button>
           <Button variant="brand" className="gap-2 shadow-sm"><Plus className="w-4 h-4" /> สร้าง Landing Page ใหม่</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Sidebar: CMS Menu */}
        <div className="lg:col-span-1 space-y-2">
           {menuItems.map((item, idx) => (
              <button key={idx} className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors text-left ${item.active ? 'bg-primary-50 border border-primary-200' : 'bg-white border border-border hover:border-primary/30 hover:shadow-sm'}`}>
                 <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.active ? 'bg-primary text-white shadow-md' : 'bg-muted text-trust-600'}`}>
                       <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                       <p className={`text-sm font-bold ${item.active ? 'text-primary' : 'text-trust-900'}`}>{item.label}</p>
                    </div>
                 </div>
                 {item.count && (
                    <Badge variant="outline" className={`font-mono text-[10px] ${item.active ? 'bg-white border-primary-200 text-primary' : 'bg-muted border-0 text-muted-foreground'}`}>{item.count}</Badge>
                 )}
              </button>
           ))}
           
           <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> CMS System Rule</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                 CMS นี้จัดการเฉพาะการนำเสนอ (Presentation Layer) เท่านั้น ข้อมูลทัวร์ โควต้า และราคา จะดึงมาจากฐานข้อมูล Booking หลักแบบ Real-time เสมอ
              </p>
           </div>
        </div>

        {/* Right Content Area: Landing Page Manager */}
        <div className="lg:col-span-3 space-y-6">
           
           {/* Quick Stats */}
           <div className="grid grid-cols-3 gap-4">
              <Card className="shadow-sm border-border">
                 <CardContent className="p-4">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Published Pages</p>
                    <p className="text-2xl font-black text-trust-900">142</p>
                    <p className="text-[10px] text-emerald-600 font-medium mt-1">อยู่ใน Sitemap ทั้งหมด</p>
                 </CardContent>
              </Card>
              <Card className="shadow-sm border-border">
                 <CardContent className="p-4">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Active Redirects</p>
                    <p className="text-2xl font-black text-trust-900">23</p>
                    <p className="text-[10px] text-muted-foreground font-medium mt-1">ป้องกัน 404 Error</p>
                 </CardContent>
              </Card>
              <Card className="shadow-sm border-border bg-primary-50">
                 <CardContent className="p-4">
                    <p className="text-xs font-bold text-primary-800 uppercase tracking-wider mb-1">Menu Builder</p>
                    <p className="text-2xl font-black text-primary">Live</p>
                    <p className="text-[10px] text-primary-700 font-medium mt-1">ใช้งาน Mega Menu แบบใหม่</p>
                 </CardContent>
              </Card>
           </div>

           {/* Landing Page List */}
           <Card className="shadow-sm border-border overflow-hidden">
              <CardHeader className="bg-muted/20 border-b border-border py-4 px-5 flex flex-row items-center justify-between">
                 <CardTitle className="text-base font-bold text-trust-900">Landing Pages ล่าสุด</CardTitle>
                 <div className="flex gap-2">
                    <div className="relative">
                       <Search className="w-4 h-4 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                       <Input placeholder="ค้นหา URL, ชื่อเพจ..." className="pl-8 h-8 text-xs w-64 bg-white" />
                    </div>
                    <Button variant="outline" size="sm" className="h-8 bg-white"><Filter className="w-3.5 h-3.5 mr-1" /> Filter</Button>
                 </div>
              </CardHeader>
              <div className="overflow-x-auto bg-white">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-muted/50 border-b border-border">
                       <tr className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                          <th className="px-5 py-3">Page Info</th>
                          <th className="px-5 py-3">URL Slug & Filter</th>
                          <th className="px-5 py-3">Status</th>
                          <th className="px-5 py-3">Views</th>
                          <th className="px-5 py-3 text-right">Action</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                       {recentPages.map(page => (
                          <tr key={page.id} className="hover:bg-muted/30 transition-colors group">
                             <td className="px-5 py-4">
                                <p className="font-bold text-sm text-trust-900">{page.title}</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">{page.type} • อัปเดต {page.date}</p>
                             </td>
                             <td className="px-5 py-4">
                                <Link href={page.slug} className="text-xs font-mono text-primary hover:underline flex items-center gap-1"><LinkIcon className="w-3 h-3" /> {page.slug}</Link>
                                <p className="text-[10px] text-trust-500 font-mono mt-1 bg-muted w-fit px-1.5 rounded border border-border/50">DB: {page.filter}</p>
                             </td>
                             <td className="px-5 py-4">
                                <Badge variant={page.status === 'Published' ? 'success' : 'secondary'} className="text-[10px] px-1.5 py-0">{page.status}</Badge>
                             </td>
                             <td className="px-5 py-4">
                                <span className="text-xs font-bold text-trust-700">{page.views}</span>
                             </td>
                             <td className="px-5 py-4 text-right">
                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <Button variant="outline" size="icon" className="w-7 h-7 bg-white"><Eye className="w-3 h-3 text-trust-600" /></Button>
                                   <Button variant="outline" size="icon" className="w-7 h-7 bg-white"><Edit className="w-3 h-3 text-trust-600" /></Button>
                                   <Button variant="outline" size="icon" className="w-7 h-7 bg-white hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"><Trash2 className="w-3 h-3" /></Button>
                                </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
              <div className="p-3 border-t border-border bg-muted/20 text-center">
                 <Link href="#" className="text-xs font-bold text-primary hover:text-primary-600">ดูรายการทั้งหมด</Link>
              </div>
           </Card>

        </div>
      </div>
    </div>
  );
}

// Icon for missing import
function AlertCircle(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}
