"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Bell, LayoutDashboard, ShoppingCart, Globe, Hand, Clock, RefreshCw, 
  CheckCircle2, CreditCard, Receipt, FileText, CheckSquare, XCircle, 
  RotateCcw, PenTool, Edit3, Send, Users, UserCircle, History, MessageSquare, 
  FolderOpen, Inbox, Smartphone, Mail, FileOutput, CalendarCheck, 
  Building2, KeyRound, Phone, ArrowRightLeft, Database, AlertOctagon 
} from 'lucide-react';

export default function BookingAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menuSections = [
    {
      title: 'Booking Center',
      items: [
        { name: 'All Bookings', href: '/admin/center', icon: LayoutDashboard },
        { name: 'Online Bookings', href: '/admin/center/online', icon: Globe },
        { name: 'Manual Bookings', href: '/admin/center/manual', icon: Hand },
        { name: 'Pending Confirmation', href: '/admin/center/pending', icon: Clock },
        { name: 'Waiting Wholesale', href: '/admin/center/waiting-wholesale', icon: RefreshCw },
        { name: 'Confirmed', href: '/admin/center/confirmed', icon: CheckCircle2 },
        { name: 'Payment Pending', href: '/admin/center/payment-pending', icon: CreditCard },
        { name: 'Paid', href: '/admin/center/paid', icon: Receipt },
        { name: 'Voucher Issued', href: '/admin/center/voucher-issued', icon: FileText },
        { name: 'Completed', href: '/admin/center/completed', icon: CheckSquare },
        { name: 'Cancelled', href: '/admin/center/cancelled', icon: XCircle },
        { name: 'Refund Requests', href: '/admin/center/refunds', icon: RotateCcw },
      ]
    },
    {
      title: 'Manual Booking',
      items: [
        { name: 'Create Manual Booking', href: '/admin/manual/create', icon: PenTool },
        { name: 'Draft Manual Booking', href: '/admin/manual/drafts', icon: Edit3 },
        { name: 'Manual Wholesale Follow-up', href: '/admin/manual/follow-up', icon: Send },
      ]
    },
    {
      title: 'Customers',
      items: [
        { name: 'Customer List', href: '/admin/customers', icon: Users },
        { name: 'Customer Detail', href: '/admin/customers/detail', icon: UserCircle },
        { name: 'Booking History', href: '/admin/customers/history', icon: History },
        { name: 'Conversation History', href: '/admin/customers/conversations', icon: MessageSquare },
        { name: 'Documents', href: '/admin/customers/documents', icon: FolderOpen },
      ]
    },
    {
      title: 'Customer Communication',
      items: [
        { name: 'Inbox', href: '/admin/communication/inbox', icon: Inbox },
        { name: 'LINE Messages', href: '/admin/communication/line', icon: Smartphone },
        { name: 'WhatsApp Messages', href: '/admin/communication/whatsapp', icon: MessageSquare },
        { name: 'Email Messages', href: '/admin/communication/email', icon: Mail },
        { name: 'Message Templates', href: '/admin/communication/templates', icon: FileOutput },
        { name: 'Follow-up Tasks', href: '/admin/communication/tasks', icon: CalendarCheck },
      ]
    },
    {
      title: 'Wholesale / Supplier',
      items: [
        { name: 'Supplier List', href: '/admin/suppliers', icon: Building2 },
        { name: 'Supplier Profile', href: '/admin/suppliers/profile', icon: UserCircle },
        { name: 'API Credentials', href: '/admin/suppliers/api', icon: KeyRound },
        { name: 'Supplier Contacts', href: '/admin/suppliers/contacts', icon: Phone },
        { name: 'Supplier Booking Requests', href: '/admin/suppliers/requests', icon: ArrowRightLeft },
        { name: 'Supplier Confirmations', href: '/admin/suppliers/confirmations', icon: CheckCircle2 },
        { name: 'API Sync Logs', href: '/admin/suppliers/sync-logs', icon: Database },
        { name: 'Error Logs', href: '/admin/suppliers/error-logs', icon: AlertOctagon },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex h-full">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-white tracking-tight">Booking</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          {menuSections.map((section, idx) => (
            <div key={idx}>
              <div className="mb-2 px-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{section.title}</span>
              </div>
              <div className="space-y-1">
                {section.items.map((item, i) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link 
                      key={i} 
                      href={item.href} 
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive 
                          ? 'bg-blue-600/10 text-blue-400' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <item.icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Header */}
        <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-white">ระบบจัดการออเดอร์และการเงิน (Admin Center)</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors group">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-slate-900 group-hover:border-slate-800"></span>
              
              {/* Notification Dropdown (Hover) */}
              <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="p-3 border-b border-slate-700 font-bold text-white text-sm">Notifications</div>
                <div className="flex flex-col text-sm">
                  <Link href="/admin/notifications/booking" className="px-4 py-2.5 text-slate-300 hover:bg-slate-700 hover:text-white flex justify-between">Booking Alerts <span className="bg-rose-500 text-white text-xs px-1.5 py-0.5 rounded-full">3</span></Link>
                  <Link href="/admin/notifications/payment" className="px-4 py-2.5 text-slate-300 hover:bg-slate-700 hover:text-white">Payment Alerts</Link>
                  <Link href="/admin/notifications/supplier" className="px-4 py-2.5 text-slate-300 hover:bg-slate-700 hover:text-white">Supplier Alerts</Link>
                  <Link href="/admin/notifications/customer" className="px-4 py-2.5 text-slate-300 hover:bg-slate-700 hover:text-white">Customer Alerts</Link>
                  <Link href="/admin/notifications/system" className="px-4 py-2.5 text-slate-300 hover:bg-slate-700 hover:text-white">System Alerts</Link>
                  <div className="border-t border-slate-700"></div>
                  <Link href="/admin/notifications" className="px-4 py-2.5 text-blue-400 hover:bg-slate-700 hover:text-blue-300 text-center font-medium">All Notifications</Link>
                </div>
              </div>
            </button>
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full border-2 border-slate-700"></div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
