import { MenuItem } from './adminMenu';

export const publicMenu: MenuItem[] = [
  {
    label: 'Home',
    href: '/',
    enabled: true,
    status: 'ACTIVE',
    route_exists: true,
  },
  {
    label: 'Search Tours',
    href: '/search',
    enabled: true,
    status: 'ACTIVE',
    route_exists: true,
  },
  {
    label: 'Destinations',
    href: '/country/japan', // Default to Japan instead of #
    enabled: true,
    status: 'ACTIVE',
    route_exists: true,
    children: [
      { label: 'Japan', href: '/country/japan', enabled: true, status: 'ACTIVE', route_exists: true },
      { label: 'China', href: '/country/china', enabled: true, status: 'ACTIVE', route_exists: true },
      { label: 'Europe', href: '/region/europe', enabled: true, status: 'ACTIVE', route_exists: true },
    ]
  },
  {
    label: 'Promotions',
    href: '/deals/flash-sale', // Default to flash sale instead of #
    enabled: true,
    status: 'ACTIVE',
    route_exists: true,
    children: [
      { label: 'Flash Sale', href: '/deals/flash-sale', enabled: true, status: 'ACTIVE', badge: 'Hot', route_exists: true },
      { label: 'Compare Tours', href: '/compare', enabled: true, status: 'COMING_SOON', route_exists: true },
    ]
  },
  {
    label: 'AI Planner',
    href: '/ai-search',
    enabled: true,
    status: 'ACTIVE',
    badge: 'New',
    route_exists: true,
  },
  {
    label: 'About Us',
    href: '/about', // Mapped to info subdomain in middleware/reality
    enabled: true,
    status: 'ACTIVE',
    route_exists: true,
  },
  {
    label: 'Contact',
    href: '/contact',
    enabled: true,
    status: 'ACTIVE',
    route_exists: true,
  }
];

export const footerConfig = [
  {
    title: 'บริการของเรา',
    links: [
      { label: 'ค้นหาโปรแกรมทัวร์', href: '/search' },
      { label: 'ทัวร์ไฟไหม้ (Last Minute)', href: '/deals/flash-sale' },
      { label: 'จัดกรุ๊ปเหมาส่วนตัว', href: '/private-group' },
      { label: 'AI ช่วยวางแผนเที่ยว', href: '/ai-search' },
    ]
  },
  {
    title: 'ติดต่อและสนับสนุน',
    links: [
      { label: 'เกี่ยวกับเรา', href: '/about' },
      { label: 'ติดต่อสอบถาม', href: '/contact' },
      { label: 'คำถามที่พบบ่อย', href: '/faq' },
      { label: 'เงื่อนไขการจอง', href: '/pdpa' },
    ]
  },
  {
    title: 'สำหรับพาร์ทเนอร์',
    links: [
      { label: 'สมัครสมาชิก Agent', href: '/register', icon: 'agent' },
      { label: 'เข้าสู่ระบบหลังบ้าน', href: '/dashboard' },
      { label: 'สำหรับ Wholesale (API)', href: '/wholesale' },
    ]
  }
];
