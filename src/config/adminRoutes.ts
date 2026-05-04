import { LayoutDashboard, Ticket, Users, FileText, Settings, BarChart, Bot, FileEdit, PlaneTakeoff, ShieldCheck, Briefcase, Globe2, LucideIcon } from "lucide-react";

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
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "Bookings", href: "/admin/bookings", icon: Ticket },
      { name: "Operations", href: "/admin/operations", icon: PlaneTakeoff },
    ]
  },
  {
    title: "Finance & CRM",
    items: [
      { name: "Finance", href: "/admin/finance", icon: FileText },
      { name: "Customers", href: "/admin/customers", icon: Users },
    ]
  },
  {
    title: "AI & Content",
    items: [
      { name: "AI Center", href: "/admin/ai", icon: Bot },
      { name: "CMS Content", href: "/admin/cms", icon: FileEdit },
      { name: "Reports Hub", href: "/admin/reports", icon: BarChart },
    ]
  },
  {
    title: "System",
    items: [
      { name: "Users & Roles", href: "/admin/users", icon: ShieldCheck },
      { name: "Settings", href: "/admin/settings", icon: Settings },
    ]
  },
  {
    title: "Wholesale / Supplier Center",
    items: [
      { name: "Dashboard", href: "/admin/wholesale/dashboard", icon: LayoutDashboard },
      { name: "Supplier Master", href: "/admin/wholesale/suppliers", icon: Briefcase },
      { name: "Data Sync", href: "/admin/wholesale/sync", icon: Globe2 },
      { name: "Tour Import", href: "/admin/wholesale/import", icon: FileText },
      { name: "Mapping", href: "/admin/wholesale/mapping", icon: BarChart },
      { name: "Human Review", href: "/admin/wholesale/human-review", icon: Users },
    ]
  }
];

export const filterAdminMenusByRole = (role: string): RouteGroup[] => {
  // SUPER_ADMIN and ADMIN see everything
  if (role === 'SUPER_ADMIN' || role === 'ADMIN') return adminMenuGroups;

  return adminMenuGroups.map(group => {
    let filteredItems = [...group.items];
    
    if (role === 'OPERATION') {
      // Operations shouldn't see System Settings, Content, or Finance
      if (group.title === 'Finance & CRM') {
         filteredItems = filteredItems.filter(i => i.name !== 'Finance');
      }
      if (group.title === 'System') filteredItems = [];
      if (group.title === 'AI & Content') filteredItems = [];
    } 
    else if (role === 'FINANCE') {
      // Finance sees only Finance & CRM, and basic Overview
      if (group.title === 'Wholesale / Supplier Center') filteredItems = [];
      if (group.title === 'System') filteredItems = [];
      if (group.title === 'AI & Content') filteredItems = [];
    }
    else if (role === 'CONTENT_MANAGER') {
      // Content Manager sees CMS, AI, and basic overview
      if (group.title === 'Wholesale / Supplier Center') filteredItems = [];
      if (group.title === 'Finance & CRM') filteredItems = [];
      if (group.title === 'System') filteredItems = [];
    }
    else if (role === 'SALE_MANAGER') {
      // Sale Manager sees Customers, Bookings, Reports
      if (group.title === 'Wholesale / Supplier Center') filteredItems = [];
      if (group.title === 'System') filteredItems = [];
      if (group.title === 'Finance & CRM') filteredItems = filteredItems.filter(i => i.name === 'Customers');
    }
    else {
       // Default fallback: just show dashboard
       if (group.title !== 'Overview') filteredItems = [];
    }

    return { ...group, items: filteredItems };
  }).filter(group => group.items.length > 0);
};

export const getAllAdminRoutes = (): string[] => {
  return adminMenuGroups.flatMap(group => group.items.map(item => item.href));
};
