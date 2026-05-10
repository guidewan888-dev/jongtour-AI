/**
 * Mega Menu Configuration
 * Used by Header.tsx for desktop/mobile navigation
 * Format: named property maps consumed by Header component
 */

// ============================================================
// HEADER NAV CONFIG — used by Header.tsx
// ============================================================

interface NavItem {
  label: string;
  href: string;
  icon?: string;
  isBold?: boolean;
  isFooter?: boolean;
}

interface OverseasColumn {
  title: string;
  titleHref?: string;
  colorClass: string;
  sections: { items: NavItem[] }[];
}

export const megaMenuConfig = {
  // ค้นหาทัวร์ dropdown
  searchTours: [
    { label: '🔍 ค้นหาทัวร์', href: '/search', icon: 'Compass' },
    { label: '🤖 AI ค้นหาทัวร์', href: '/ai-search', icon: 'Star' },
    { label: '📱 ทัวร์ทั้งหมด', href: '/search', icon: 'Smartphone' },
  ] as NavItem[],

  // ทัวร์ต่างประเทศ mega menu
  overseasTours: [
    {
      title: '🌏 ทัวร์เอเชีย',
      titleHref: '/region/asia',
      colorClass: 'primary',
      sections: [
        {
          items: [
            { label: '🇯🇵 ทัวร์ญี่ปุ่น', href: '/country/japan', isBold: true },
            { label: 'โตเกียว', href: '/country/japan' },
            { label: 'โอซาก้า', href: '/country/japan' },
            { label: 'ฮอกไกโด', href: '/country/japan' },
            { label: '🇨🇳 ทัวร์จีน', href: '/country/china', isBold: true },
            { label: 'เฉิงตู', href: '/country/china' },
            { label: 'จางเจียเจี้ย', href: '/country/china' },
            { label: 'คุนหมิง', href: '/country/china' },
          ],
        },
        {
          items: [
            { label: '🇰🇷 ทัวร์เกาหลี', href: '/country/south-korea', isBold: true },
            { label: '🇹🇼 ทัวร์ไต้หวัน', href: '/country/taiwan', isBold: true },
            { label: '🇭🇰 ทัวร์ฮ่องกง', href: '/country/hongkong', isBold: true },
            { label: '🇻🇳 ทัวร์เวียดนาม', href: '/country/vietnam', isBold: true },
            { label: '🇸🇬 ทัวร์สิงคโปร์', href: '/country/singapore', isBold: true },
            { label: '🇲🇲 ทัวร์พม่า', href: '/country/myanmar', isBold: true },
            { label: '🇱🇦 ทัวร์ลาว', href: '/country/laos', isBold: true },
            { label: '🇮🇳 ทัวร์อินเดีย', href: '/country/india', isBold: true },
          ],
        },
      ],
    },
    {
      title: '🏰 ทัวร์ยุโรป',
      titleHref: '/region/europe',
      colorClass: 'blue-600',
      sections: [
        {
          items: [
            { label: '🇬🇧 อังกฤษ', href: '/country/uk', isBold: true },
            { label: '🇫🇷 ฝรั่งเศส', href: '/country/france', isBold: true },
            { label: '🇮🇹 อิตาลี', href: '/country/italy', isBold: true },
            { label: '🇨🇭 สวิตเซอร์แลนด์', href: '/country/switzerland', isBold: true },
            { label: '🇩🇪 เยอรมนี', href: '/country/germany', isBold: true },
            { label: '🇪🇸 สเปน', href: '/country/spain', isBold: true },
            { label: '🇳🇱 เนเธอร์แลนด์', href: '/country/netherlands', isBold: true },
            { label: '🇦🇹 ออสเตรีย', href: '/country/austria', isBold: true },
          ],
        },
      ],
    },
    {
      title: '🌍 ตะวันออกกลาง',
      titleHref: '/region/middle-east',
      colorClass: 'amber-600',
      sections: [
        {
          items: [
            { label: '🇹🇷 ตุรกี', href: '/country/turkey', isBold: true },
            { label: '🇪🇬 อียิปต์', href: '/country/egypt', isBold: true },
            { label: '🇦🇪 ดูไบ', href: '/country/dubai', isBold: true },
            { label: '🇯🇴 จอร์แดน', href: '/country/jordan', isBold: true },
            { label: '🇬🇪 จอร์เจีย', href: '/country/georgia', isBold: true },
          ],
        },
      ],
    },
    {
      title: '🌎 อเมริกา / โอเชียเนีย',
      titleHref: '/region/americas',
      colorClass: 'green-600',
      sections: [
        {
          items: [
            { label: '🇺🇸 อเมริกา', href: '/country/usa', isBold: true },
            { label: '🇨🇦 แคนาดา', href: '/country/canada', isBold: true },
            { label: '🇦🇺 ออสเตรเลีย', href: '/country/australia', isBold: true },
            { label: '🇳🇿 นิวซีแลนด์', href: '/country/newzealand', isBold: true },
          ],
        },
      ],
    },
  ] as OverseasColumn[],

  // ทัวร์ตามโฮลเซล dropdown
  wholesale: [
    { label: "Let's Go Group", href: '/wholesaler/letsgo' },
    { label: 'World Connection', href: '/wholesaler/worldconnection' },
    { label: 'Best International', href: '/wholesaler/bestinternational' },
    { label: 'GS25 Travel', href: '/wholesaler/gs25' },
    { label: 'iTravel Center', href: '/wholesaler/itravels' },
    { label: 'ดูทั้งหมด →', href: '/search', isFooter: true, isBold: true },
  ] as NavItem[],

  // กรุ๊ปส่วนตัว dropdown
  privateGroup: [
    { label: '✈️ ขอใบเสนอราคา', href: '/private-group', icon: 'FileText' },
    { label: '👥 ทัวร์กรุ๊ปบริษัท', href: '/private-group', icon: 'Users' },
    { label: '📍 ทริปตามใจ', href: '/private-group', icon: 'Map' },
  ] as NavItem[],

  // บทความ dropdown
  blog: [
    { label: '📝 บทความทั้งหมด', href: '/blog' },
    { label: '🗺️ แนะนำที่เที่ยว', href: '/blog' },
    { label: '💡 เคล็ดลับเดินทาง', href: '/blog' },
    { label: '📋 วีซ่า', href: '/visa' },
  ] as NavItem[],
};

// ============================================================
// MEGA MENU DATA (legacy array format — for reference)
// ============================================================

export interface MegaMenuItem {
  label: string;
  href: string;
  emoji?: string;
  flagCode?: string;
}

export interface MegaMenuColumn {
  title: string;
  titleHref?: string;
  items: MegaMenuItem[];
}

export interface MegaMenuGroup {
  trigger: string;
  columns: MegaMenuColumn[];
  footerLink?: { label: string; href: string };
  wide?: boolean;
}

// ============================================================
// PUBLIC HEADER NAV LINKS
// ============================================================

export interface NavLink {
  label: string;
  href: string;
  badge?: string;
}

export const publicNavLinks: NavLink[] = [
  { label: "โปรโมชัน", href: "/deals/flash-sale" },
  { label: "วีซ่า", href: "/visa" },
  { label: "กรุ๊ปส่วนตัว", href: "/private-group" },
  { label: "ติดต่อ", href: "/contact" },
];

// ============================================================
// FOOTER CONFIG
// ============================================================

export interface FooterColumn {
  title: string;
  links: { label: string; href: string; highlight?: boolean }[];
}

export const footerColumns: FooterColumn[] = [
  {
    title: "ทัวร์ยอดฮิต",
    links: [
      { label: "ทัวร์ญี่ปุ่น", href: "/country/japan" },
      { label: "ทัวร์เกาหลี", href: "/country/south-korea" },
      { label: "ทัวร์จีน", href: "/country/china" },
      { label: "ทัวร์ยุโรป", href: "/region/europe" },
      { label: "ทัวร์ไต้หวัน", href: "/country/taiwan" },
      { label: "ทัวร์ตุรกี", href: "/country/turkey" },
      { label: "ดูทั้งหมด", href: "/search", highlight: true },
    ],
  },
  {
    title: "บริการ",
    links: [
      { label: "จองทัวร์ออนไลน์", href: "/search" },
      { label: "กรุ๊ปส่วนตัว", href: "/private-group" },
      { label: "บริการวีซ่า", href: "/visa" },
      { label: "AI ค้นหาทัวร์", href: "/ai-search" },
      { label: "B2B Agent", href: "/agent-portal/register" },
    ],
  },
  {
    title: "ลูกค้า",
    links: [
      { label: "เข้าสู่ระบบ", href: "/login" },
      { label: "สมัครสมาชิก", href: "/register" },
      { label: "การจอง", href: "/account/bookings" },
      { label: "การชำระเงิน", href: "/account/payments" },
      { label: "ติดตามสถานะ", href: "/account/bookings" },
    ],
  },
  {
    title: "ข้อมูล",
    links: [
      { label: "เกี่ยวกับเรา", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "FAQ / Help", href: "/help" },
      { label: "ติดต่อ", href: "/contact" },
      { label: "ร่วมงานกับเรา", href: "/careers" },
    ],
  },
];

export const footerLegalLinks = [
  { label: "เงื่อนไขการใช้งาน", href: "/terms" },
  { label: "นโยบายความเป็นส่วนตัว", href: "/privacy" },
  { label: "PDPA", href: "/pdpa" },
  { label: "Cookie Policy", href: "/cookies" },
  { label: "นโยบายการจอง", href: "/booking-policy" },
  { label: "นโยบายการยกเลิก", href: "/booking-policy#cancellation" },
  { label: "นโยบายการคืนเงิน", href: "/booking-policy#refund" },
];

export const wholesalePartners = [
  { name: "Let's Go", slug: "letsgo" },
  { name: "Go365", slug: "go365" },
  { name: "Checkin Group", slug: "checkin" },
  { name: "Tour Factory", slug: "tour-factory" },
];

// ============================================================
// MOBILE DRAWER LINKS
// ============================================================

export const mobileDrawerLinks = [
  { label: "หน้าแรก", href: "/", emoji: "🏠" },
  { label: "ค้นหาทัวร์", href: "/search", emoji: "🔍" },
  { label: "ค้นหาด้วย AI", href: "/ai-search", emoji: "🤖" },
  { label: "ทัวร์เอเชีย", href: "/region/asia", emoji: "🌏" },
  { label: "ทัวร์ยุโรป", href: "/region/europe", emoji: "🏰" },
  { label: "ทัวร์ญี่ปุ่น", href: "/country/japan", emoji: "🗼" },
  { label: "ทัวร์จีน", href: "/country/china", emoji: "🏯" },
  { label: "ทัวร์เกาหลี", href: "/country/south-korea", emoji: "🎎" },
  { label: "ทัวร์อเมริกา", href: "/country/usa", emoji: "🗽" },
  { label: "ทัวร์โอเชียเนีย", href: "/country/australia", emoji: "🏝️" },
  { label: "โปรโมชัน", href: "/deals/flash-sale", emoji: "🔥" },
  { label: "กรุ๊ปส่วนตัว", href: "/private-group", emoji: "✈️" },
  { label: "วีซ่า", href: "/visa", emoji: "🛂" },
  { label: "ติดต่อ", href: "/contact", emoji: "📞" },
];
