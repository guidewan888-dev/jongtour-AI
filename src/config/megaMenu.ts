/**
 * Mega Menu Configuration
 * All links point to working routes: /country/[slug] and /search
 */

export interface MegaMenuItem {
  label: string;
  href: string;
  emoji?: string;
  flag?: string;
  count?: number;
}

export interface MegaMenuColumn {
  title: string;
  items: MegaMenuItem[];
}

export interface MegaMenuGroup {
  trigger: string;
  columns: MegaMenuColumn[];
  footerLink?: { label: string; href: string };
}

export const megaMenuConfig: MegaMenuGroup[] = [
  {
    trigger: "ทัวร์ต่างประเทศ",
    columns: [
      {
        title: "เอเชีย",
        items: [
          { label: "ทัวร์ญี่ปุ่น", href: "/country/japan", flag: "🇯🇵" },
          { label: "ทัวร์จีน", href: "/country/china", flag: "🇨🇳" },
          { label: "ทัวร์เกาหลี", href: "/country/korea", flag: "🇰🇷" },
          { label: "ทัวร์ไต้หวัน", href: "/country/taiwan", flag: "🇹🇼" },
          { label: "ทัวร์เวียดนาม", href: "/country/vietnam", flag: "🇻🇳" },
          { label: "ทัวร์ฮ่องกง", href: "/country/hongkong", flag: "🇭🇰" },
          { label: "ทัวร์อินเดีย", href: "/country/india", flag: "🇮🇳" },
        ],
      },
      {
        title: "ยุโรป & ตะวันออกกลาง",
        items: [
          { label: "ทัวร์ยุโรป", href: "/country/europe", flag: "🇪🇺" },
          { label: "ทัวร์ตุรกี", href: "/country/turkey", flag: "🇹🇷" },
          { label: "ทัวร์ดูไบ", href: "/country/dubai", flag: "🇦🇪" },
          { label: "ทัวร์รัสเซีย", href: "/country/russia", flag: "🇷🇺" },
          { label: "ทัวร์ออสเตรเลีย", href: "/country/australia", flag: "🇦🇺" },
          { label: "ทัวร์นิวซีแลนด์", href: "/country/newzealand", flag: "🇳🇿" },
        ],
      },
      {
        title: "โปรโมชั่น",
        items: [
          { label: "🔥 ทัวร์ไฟไหม้ Flash Sale", href: "/deals/flash-sale" },
          { label: "💰 ราคาพิเศษเดือนนี้", href: "/search" },
          { label: "🤖 AI ช่วยหาทัวร์", href: "/ai-search" },
        ],
      },
    ],
    footerLink: { label: "ดูทัวร์ทั้งหมด →", href: "/search" },
  },
  {
    trigger: "จุดหมายเที่ยว",
    columns: [
      {
        title: "ญี่ปุ่น 🇯🇵",
        items: [
          { label: "โตเกียว", href: "/country/japan/tokyo" },
          { label: "ฮอกไกโด", href: "/country/japan/hokkaido" },
          { label: "โอซาก้า", href: "/country/japan/osaka" },
          { label: "เกียวโต", href: "/country/japan/kyoto" },
          { label: "ฟูกูโอกะ", href: "/country/japan/fukuoka" },
        ],
      },
      {
        title: "เกาหลี 🇰🇷 / จีน 🇨🇳",
        items: [
          { label: "โซล", href: "/country/korea/seoul" },
          { label: "ปูซาน", href: "/country/korea/busan" },
          { label: "เชจู", href: "/country/korea/jeju" },
          { label: "ปักกิ่ง", href: "/country/china/beijing" },
          { label: "เซี่ยงไฮ้", href: "/country/china/shanghai" },
          { label: "จางเจียเจี้ย", href: "/country/china/zhangjiajie" },
        ],
      },
      {
        title: "ยุโรป 🇪🇺 / อื่นๆ",
        items: [
          { label: "อิตาลี", href: "/country/europe", flag: "🇮🇹" },
          { label: "ฝรั่งเศส", href: "/country/europe", flag: "🇫🇷" },
          { label: "สวิตเซอร์แลนด์", href: "/country/europe", flag: "🇨🇭" },
          { label: "อียิปต์", href: "/country/egypt", flag: "🇪🇬" },
          { label: "ตุรกี", href: "/country/turkey", flag: "🇹🇷" },
          { label: "ดูไบ", href: "/country/dubai", flag: "🇦🇪" },
        ],
      },
    ],
    footerLink: { label: "ค้นหาทัวร์ทั้งหมด →", href: "/search" },
  },
];

// ============================================================
// PUBLIC HEADER NAV LINKS
// ============================================================

export interface NavLink {
  label: string;
  href: string;
  badge?: string;
  icon?: string;
}

export const publicNavLinks: NavLink[] = [
  { label: "กรุ๊ปส่วนตัว", href: "/private-group" },
  { label: "วีซ่า", href: "/visa" },
  { label: "Blog", href: "/blog" },
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
      { label: "ทัวร์เกาหลี", href: "/country/korea" },
      { label: "ทัวร์จีน", href: "/country/china" },
      { label: "ทัวร์ยุโรป", href: "/country/europe" },
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
      { label: "B2B Agent", href: "/agent" },
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
  { name: "Let'go Group", slug: "letgo" },
  { name: "Check in Group", slug: "checkin" },
  { name: "Tour Factory", slug: "tour-factory" },
];

// ============================================================
// MOBILE DRAWER LINKS
// ============================================================

export const mobileDrawerLinks = [
  { label: "หน้าแรก", href: "/", emoji: "🏠" },
  { label: "ค้นหาทัวร์", href: "/search", emoji: "🔍" },
  { label: "ค้นหาด้วย AI", href: "/ai-search", emoji: "🤖" },
  { label: "ทัวร์ญี่ปุ่น", href: "/country/japan", emoji: "🇯🇵" },
  { label: "ทัวร์จีน", href: "/country/china", emoji: "🇨🇳" },
  { label: "ทัวร์เกาหลี", href: "/country/korea", emoji: "🇰🇷" },
  { label: "ทัวร์ยุโรป", href: "/country/europe", emoji: "🇪🇺" },
  { label: "กรุ๊ปส่วนตัว", href: "/private-group", emoji: "✈️" },
  { label: "บริการวีซ่า", href: "/visa", emoji: "🛂" },
  { label: "Blog & คู่มือเที่ยว", href: "/blog", emoji: "📝" },
  { label: "ติดต่อ", href: "/contact", emoji: "📞" },
];
