import { MenuItem } from './adminMenu';

export const publicMenu: MenuItem[] = [
  {
    label: 'หน้าแรก',
    href: '/',
    enabled: true,
    status: 'ACTIVE',
    route_exists: true,
  },
  {
    label: 'ค้นหาทัวร์',
    href: '/search',
    enabled: true,
    status: 'ACTIVE',
    route_exists: true,
  },
  {
    label: 'ทัวร์ตามประเทศ',
    href: '/destinations',
    enabled: true,
    status: 'ACTIVE',
    route_exists: true,
    children: [
      { label: '🇯🇵 ญี่ปุ่น', href: '/country/japan', enabled: true, status: 'ACTIVE', route_exists: true },
      { label: '🇨🇳 จีน', href: '/country/china', enabled: true, status: 'ACTIVE', route_exists: true },
      { label: '🇰🇷 เกาหลี', href: '/country/korea', enabled: true, status: 'ACTIVE', route_exists: true },
      { label: '🇹🇼 ไต้หวัน', href: '/country/taiwan', enabled: true, status: 'ACTIVE', route_exists: true },
      { label: '🇻🇳 เวียดนาม', href: '/country/vietnam', enabled: true, status: 'ACTIVE', route_exists: true },
      { label: '🇭🇰 ฮ่องกง', href: '/country/hongkong', enabled: true, status: 'ACTIVE', route_exists: true },
      { label: '🇪🇺 ยุโรป', href: '/country/europe', enabled: true, status: 'ACTIVE', route_exists: true },
      { label: '🇮🇳 อินเดีย', href: '/country/india', enabled: true, status: 'ACTIVE', route_exists: true },
      { label: '🇹🇷 ตุรกี', href: '/country/turkey', enabled: true, status: 'ACTIVE', route_exists: true },
      { label: '🌍 ดูทั้งหมด', href: '/search', enabled: true, status: 'ACTIVE', route_exists: true },
    ]
  },
  {
    label: 'โปรโมชัน',
    href: '/deals/flash-sale',
    enabled: true,
    status: 'ACTIVE',
    route_exists: true,
    children: [
      { label: '🔥 ทัวร์ไฟไหม้', href: '/deals/flash-sale', enabled: true, status: 'ACTIVE', badge: 'Hot', route_exists: true },
      { label: '📊 เปรียบเทียบทัวร์', href: '/compare', enabled: true, status: 'COMING_SOON', route_exists: true },
    ]
  },
  {
    label: 'AI วางแผนเที่ยว',
    href: '/ai-search',
    enabled: true,
    status: 'ACTIVE',
    badge: 'New',
    route_exists: true,
  },
  {
    label: 'เกี่ยวกับเรา',
    href: '/about',
    enabled: true,
    status: 'ACTIVE',
    route_exists: true,
  },
  {
    label: 'ติดต่อเรา',
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
    title: 'ทัวร์ยอดนิยม',
    links: [
      { label: 'ทัวร์ญี่ปุ่น', href: '/country/japan' },
      { label: 'ทัวร์จีน', href: '/country/china' },
      { label: 'ทัวร์เกาหลี', href: '/country/korea' },
      { label: 'ทัวร์ยุโรป', href: '/country/europe' },
      { label: 'ทัวร์ไต้หวัน', href: '/country/taiwan' },
      { label: 'ทัวร์เวียดนาม', href: '/country/vietnam' },
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
