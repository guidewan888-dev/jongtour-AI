export interface MenuItem {
  label: string;
  href: string;
  icon?: string; // Lucide icon name or similar
  permission?: string[]; // E.g., ['SUPER_ADMIN', 'ADMIN', 'STAFF']
  children?: MenuItem[];
  enabled: boolean;
  status: 'ACTIVE' | 'COMING_SOON' | 'MAINTENANCE';
  badge?: string;
  route_exists: boolean;
}

export const adminMenu: MenuItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
    permission: ['ADMIN'],
    enabled: true,
    status: 'ACTIVE',
    route_exists: true,
  },
  {
    label: 'Wholesale & Sync',
    href: '/wholesale',
    icon: 'RefreshCw',
    permission: ['SUPER_ADMIN', 'ADMIN'],
    enabled: true,
    status: 'ACTIVE',
    route_exists: true,
    children: [
      { label: 'Overview', href: '/wholesale/dashboard', enabled: true, status: 'ACTIVE', route_exists: true },
      { label: 'Suppliers', href: '/wholesale/suppliers', enabled: true, status: 'ACTIVE', route_exists: true },
      { label: 'Manual Sync', href: '/wholesale/sync', enabled: true, status: 'ACTIVE', route_exists: true },
      { label: 'Sync Logs', href: '/wholesale/sync-logs', enabled: true, status: 'ACTIVE', route_exists: true },
      { label: 'Diagnostics', href: '/wholesale/diagnostics', enabled: true, status: 'ACTIVE', route_exists: true },
      { label: 'Error Logs', href: '/wholesale/error-logs', enabled: true, status: 'ACTIVE', route_exists: true },
      { label: 'Human Review', href: '/wholesale/human-review', enabled: true, status: 'ACTIVE', route_exists: true },
    ]
  },
  {
    label: 'Bookings',
    href: '/bookings',
    icon: 'ShoppingCart',
    permission: ['ADMIN', 'SALES'],
    enabled: true,
    status: 'ACTIVE',
    route_exists: true,
    children: [
      { label: 'All Bookings', href: '/bookings', enabled: true, status: 'ACTIVE', route_exists: true },
      { label: 'Manual Booking', href: '/manual-booking', enabled: true, status: 'ACTIVE', route_exists: true },
    ]
  },
  {
    label: 'Customers',
    href: '/customers',
    icon: 'Users',
    permission: ['ADMIN', 'SALES'],
    enabled: true,
    status: 'ACTIVE',
    route_exists: true,
  },
  {
    label: 'Sales & CRM',
    href: '/sales/leads',
    icon: 'TrendingUp',
    permission: ['ADMIN', 'SALES'],
    enabled: true,
    status: 'ACTIVE',
    route_exists: true,
    children: [
      { label: 'Overview', href: '/sales/dashboard', enabled: true, status: 'ACTIVE', route_exists: true },
      { label: 'Leads', href: '/sales/leads', enabled: true, status: 'ACTIVE', route_exists: true },
      { label: 'Pipeline', href: '/sales/pipeline', enabled: true, status: 'ACTIVE', route_exists: true },
      { label: 'Quotations', href: '/sales/quotations', enabled: true, status: 'ACTIVE', route_exists: true },
      { label: 'Agents', href: '/agents', enabled: true, status: 'ACTIVE', route_exists: true },
    ]
  },
  {
    label: 'Communications',
    href: '/communications',
    icon: 'MessageSquare',
    permission: ['ADMIN', 'SALES', 'SUPPORT'],
    enabled: true,
    status: 'ACTIVE',
    route_exists: true,
  },
  {
    label: 'Finance',
    href: '/payments',
    icon: 'CreditCard',
    permission: ['ADMIN', 'FINANCE'],
    enabled: true,
    status: 'ACTIVE',
    route_exists: true,
    children: [
      { label: 'Payments', href: '/payments', enabled: true, status: 'ACTIVE', route_exists: true },
      { label: 'Invoices', href: '/invoices', enabled: true, status: 'ACTIVE', route_exists: true },
      { label: 'Receipts', href: '/receipts', enabled: true, status: 'ACTIVE', route_exists: true },
    ]
  },
  {
    label: 'AI Center',
    href: '/ai-center',
    icon: 'Bot',
    permission: ['SUPER_ADMIN'],
    enabled: true,
    status: 'COMING_SOON',
    badge: 'Beta',
    route_exists: true,
    children: [
      { label: 'Chat Logs', href: '/ai-center/chat-logs', enabled: true, status: 'ACTIVE', route_exists: true },
      { label: 'Search Logs', href: '/ai-center/search-logs', enabled: true, status: 'ACTIVE', route_exists: true },
      { label: 'Review Queue', href: '/ai-center/review-queue', enabled: true, status: 'ACTIVE', route_exists: true },
      { label: 'Private Group', href: '/ai-center/private-group', enabled: true, status: 'ACTIVE', route_exists: true },
      { label: 'Playground', href: '/ai-center/playground', enabled: true, status: 'COMING_SOON', route_exists: true },
      { label: 'Prompts', href: '/ai-center/prompts', enabled: true, status: 'ACTIVE', route_exists: true },
    ]
  },
  {
    label: 'CMS',
    href: '/cms',
    icon: 'FileText',
    permission: ['ADMIN', 'MARKETING'],
    enabled: true,
    status: 'ACTIVE',
    route_exists: true,
    children: [
      { label: 'Landing Pages', href: '/cms/landing-pages', enabled: true, status: 'ACTIVE', route_exists: true },
      { label: 'Menu Builder', href: '/cms/menu-builder', enabled: true, status: 'ACTIVE', route_exists: true },
      { label: 'Blog', href: '/cms/blog', enabled: true, status: 'ACTIVE', route_exists: true },
    ]
  },
  {
    label: 'System Health',
    href: '/system-health',
    icon: 'Activity',
    permission: ['SUPER_ADMIN'],
    enabled: true,
    status: 'ACTIVE',
    route_exists: true,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: 'Settings',
    permission: ['SUPER_ADMIN'],
    enabled: true,
    status: 'ACTIVE',
    route_exists: true,
  }
];
