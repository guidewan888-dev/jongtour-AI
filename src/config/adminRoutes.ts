import { LayoutDashboard, Ticket, Users, FileText, Settings, BarChart, Bot, FileEdit, PlaneTakeoff, ShieldCheck, Briefcase, Globe2, LucideIcon, Stamp, KanbanSquare, CalendarDays, DollarSign, MapPin, Handshake, Wallet, MousePointerClick, BookOpen, UserCheck, Calendar, AlertCircle, CreditCard, Bell, Shield, FileSearch, Megaphone, Search, Link2, PieChart, Activity } from "lucide-react";

export type RouteItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

export type RouteGroup = {
  title: string;
  items: RouteItem[];
};

export const adminMenuGroups: RouteGroup[] = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Bookings", href: "/bookings", icon: Ticket },
      { name: "Operations", href: "/operations", icon: PlaneTakeoff },
    ]
  },
  {
    title: "Visa Center",
    items: [
      { name: "Visa Dashboard", href: "/visa-center", icon: Stamp },
      { name: "คำขอวีซ่า", href: "/visa-center/requests", icon: FileText },
      { name: "Kanban Queue", href: "/visa-center/queue", icon: KanbanSquare },
      { name: "Pricing", href: "/visa-center/pricing", icon: DollarSign },
      { name: "ปฏิทินนัดหมาย", href: "/visa-center/calendar", icon: CalendarDays },
      { name: "Country CMS", href: "/visa-center/countries", icon: MapPin },
      { name: "Staff", href: "/visa-center/staff-assignments", icon: Users },
      { name: "Reports", href: "/visa-center/reports", icon: BarChart },
    ]
  },
  {
    title: "Finance & CRM",
    items: [
      { name: "Finance", href: "/invoices", icon: FileText },
      { name: "Customers", href: "/customers", icon: Users },
    ]
  },
  {
    title: "AI & Content",
    items: [
      { name: "AI Center", href: "/ai-center", icon: Bot },
      { name: "CMS Content", href: "/cms", icon: FileEdit },
      { name: "Reports Hub", href: "/reports", icon: BarChart },
    ]
  },
  {
    title: "System",
    items: [
      { name: "Users & Roles", href: "/users", icon: ShieldCheck },
      { name: "Settings", href: "/settings", icon: Settings },
    ]
  },
  {
    title: "Affiliate Center",
    items: [
      { name: "Affiliate Dashboard", href: "/affiliate-admin", icon: Handshake },
      { name: "Affiliates", href: "/affiliate-admin/affiliates", icon: Users },
      { name: "Commission Rules", href: "/affiliate-admin/rules", icon: BookOpen },
      { name: "Commissions", href: "/affiliate-admin/commissions", icon: DollarSign },
      { name: "Tracking", href: "/affiliate-admin/tracking", icon: MousePointerClick },
      { name: "Payouts", href: "/affiliate-admin/payouts", icon: Wallet },
      { name: "Reports", href: "/affiliate-admin/reports", icon: BarChart },
    ]
  },
  {
    title: "Talent Center",
    items: [
      { name: "Talent Dashboard", href: "/talent-admin", icon: UserCheck },
      { name: "Talents", href: "/talent-admin/talents", icon: Users },
      { name: "Guide Requests", href: "/talent-admin/requests", icon: FileText },
      { name: "Schedule Conflicts", href: "/talent-admin/conflicts", icon: AlertCircle },
      { name: "Emergency", href: "/talent-admin/emergency", icon: AlertCircle },
      { name: "Reports", href: "/talent-admin/reports", icon: BarChart },
      { name: "Settings", href: "/talent-admin/settings", icon: Settings },
    ]
  },
  {
    title: "Wholesale / Supplier Center",
    items: [
      { name: "Dashboard", href: "/wholesale", icon: LayoutDashboard },
      { name: "Supplier Master", href: "/wholesale/suppliers", icon: Briefcase },
      { name: "Data Sync", href: "/wholesale/sync", icon: Globe2 },
      { name: "Human Review", href: "/wholesale/human-review", icon: Users },
    ]
  },
  {
    title: "Payment Center",
    items: [
      { name: "Payments", href: "/payments", icon: CreditCard },
      { name: "Slip Verify", href: "/payments/verify", icon: FileSearch },
      { name: "Refunds", href: "/payments/refunds", icon: Wallet },
    ]
  },
  {
    title: "Notifications & Security",
    items: [
      { name: "Notification Templates", href: "/admin/notifications", icon: Bell },
      { name: "Security Audit", href: "/admin/security", icon: Shield },
      { name: "System Monitor", href: "/settings/system", icon: Activity },
    ]
  },
  {
    title: "Marketing & SEO",
    items: [
      { name: "Marketing Dashboard", href: "/marketing", icon: Megaphone },
      { name: "Blog CMS", href: "/marketing/blog", icon: FileEdit },
      { name: "UTM Builder", href: "/marketing/utm-builder", icon: Link2 },
      { name: "Short Links", href: "/marketing/short-links", icon: Link2 },
      { name: "Attribution", href: "/marketing/attribution", icon: PieChart },
      { name: "SEO Audit", href: "/marketing/seo", icon: Search },
    ]
  }
];

export const filterAdminMenusByRole = (role: string): RouteGroup[] => {
  // SUPER_ADMIN and ADMIN see everything
  if (role === 'SUPER_ADMIN' || role === 'ADMIN') return adminMenuGroups;

  return adminMenuGroups.map(group => {
    let filteredItems = [...group.items];
    
    if (role === 'OPERATION') {
      if (group.title === 'Finance & CRM') filteredItems = filteredItems.filter(i => i.name !== 'Finance');
      if (group.title === 'System') filteredItems = [];
      if (group.title === 'AI & Content') filteredItems = [];
      if (group.title === 'Affiliate Center') filteredItems = [];
      if (group.title === 'Notifications & Security') filteredItems = [];
    } 
    else if (role === 'FINANCE') {
      if (group.title === 'Wholesale / Supplier Center') filteredItems = [];
      if (group.title === 'System') filteredItems = [];
      if (group.title === 'AI & Content') filteredItems = [];
      if (group.title === 'Talent Center') filteredItems = [];
      if (group.title === 'Notifications & Security') filteredItems = [];
    }
    else if (role === 'CONTENT_MANAGER') {
      if (group.title === 'Wholesale / Supplier Center') filteredItems = [];
      if (group.title === 'Finance & CRM') filteredItems = [];
      if (group.title === 'System') filteredItems = [];
      if (group.title === 'Affiliate Center') filteredItems = [];
      if (group.title === 'Talent Center') filteredItems = [];
      if (group.title === 'Payment Center') filteredItems = [];
      if (group.title === 'Notifications & Security') filteredItems = [];
    }
    else if (role === 'SALE_MANAGER') {
      if (group.title === 'Wholesale / Supplier Center') filteredItems = [];
      if (group.title === 'System') filteredItems = [];
      if (group.title === 'Finance & CRM') filteredItems = filteredItems.filter(i => i.name === 'Customers');
      if (group.title === 'Notifications & Security') filteredItems = [];
    }
    else {
       if (group.title !== 'Overview') filteredItems = [];
    }

    return { ...group, items: filteredItems };
  }).filter(group => group.items.length > 0);
};

export const getAllAdminRoutes = (): string[] => {
  return adminMenuGroups.flatMap(group => group.items.map(item => item.href));
};
