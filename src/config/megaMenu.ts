/**
 * Mega Menu Configuration — Blueprint 05
 * Google-style dropdown with 4 columns
 */

export interface MegaMenuItem {
  label: string;
  href: string;
  emoji?: string;
  flag?: string; // emoji flag
  count?: number; // tour count
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
        title: "ตามภูมิภาค",
        items: [
          { label: "ทัวร์เอเชีย", href: "/region/asia", emoji: "🌏" },
          { label: "ทัวร์ยุโรป", href: "/region/europe", emoji: "🏰" },
          { label: "ทัวร์อเมริกา", href: "/region/america", emoji: "🗽" },
          { label: "ทัวร์ออสเตรเลีย", href: "/region/oceania", emoji: "🦘" },
          { label: "ทัวร์ตะวันออกกลาง", href: "/region/middle-east", emoji: "🕌" },
        ],
      },
      {
        title: "ทัวร์ฮิต",
        items: [
          { label: "ทัวร์ญี่ปุ่น", href: "/country/japan", flag: "🇯🇵" },
          { label: "ทัวร์เกาหลี", href: "/country/south-korea", flag: "🇰🇷" },
          { label: "ทัวร์จีน", href: "/country/china", flag: "🇨🇳" },
          { label: "ทัวร์ยุโรป", href: "/region/europe", flag: "🇪🇺" },
          { label: "ทัวร์อียิปต์", href: "/country/egypt", flag: "🇪🇬" },
          { label: "ทัวร์จอร์เจีย", href: "/country/georgia", flag: "🇬🇪" },
          { label: "ทัวร์ตุรกี", href: "/country/turkey", flag: "🇹🇷" },
        ],
      },
      {
        title: "ตามโปรโมชั่น",
        items: [
          { label: "Flash Sale ทัวร์ไฟไหม้", href: "/deals/flash-sale", emoji: "🔥" },
          { label: "ราคาพิเศษเดือนนี้", href: "/deals/monthly", emoji: "💰" },
          { label: "Last Minute Deal", href: "/last-minute", emoji: "⏰" },
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
          { label: "นาโกย่า", href: "/country/japan/nagoya" },
          { label: "ฟูกูโอกะ", href: "/country/japan/fukuoka" },
        ],
      },
      {
        title: "เกาหลี 🇰🇷 / จีน 🇨🇳",
        items: [
          { label: "โซล", href: "/country/south-korea/seoul" },
          { label: "ปูซาน", href: "/country/south-korea/busan" },
          { label: "เชจู", href: "/country/south-korea/jeju" },
          { label: "ปักกิ่ง", href: "/country/china/beijing" },
          { label: "เซี่ยงไฮ้", href: "/country/china/shanghai" },
          { label: "จางเจียเจี้ย", href: "/country/china/zhangjiajie" },
        ],
      },
      {
        title: "ยุโรป 🇪🇺 / ตะวันออกกลาง",
        items: [
          { label: "อิตาลี", href: "/country/italy", flag: "🇮🇹" },
          { label: "ฝรั่งเศส", href: "/country/france", flag: "🇫🇷" },
          { label: "สวิตเซอร์แลนด์", href: "/country/switzerland", flag: "🇨🇭" },
          { label: "อังกฤษ", href: "/country/united-kingdom", flag: "🇬🇧" },
          { label: "อียิปต์", href: "/country/egypt", flag: "🇪🇬" },
          { label: "จอร์เจีย", href: "/country/georgia", flag: "🇬🇪" },
        ],
      },
    ],
    footerLink: { label: "ดูทุกจุดหมาย →", href: "/destinations" },
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
    title: "จุดหมายยอดฮิต",
    links: [
      { label: "ทัวร์ญี่ปุ่น", href: "/country/japan" },
      { label: "ทัวร์เกาหลี", href: "/country/south-korea" },
      { label: "ทัวร์จีน", href: "/country/china" },
      { label: "ทัวร์ยุโรป", href: "/region/europe" },
      { label: "ทัวร์อียิปต์", href: "/country/egypt" },
      { label: "ดูทั้งหมด", href: "/destinations", highlight: true },
    ],
  },
  {
    title: "บริการ",
    links: [
      { label: "จองทัวร์ออนไลน์", href: "/search" },
      { label: "กรุ๊ปส่วนตัว", href: "/private-group" },
      { label: "บริการวีซ่า", href: "/visa" },
      { label: "AI Search", href: "/ai-search" },
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
      { label: "Voucher", href: "/account/vouchers" },
      { label: "ติดตามสถานะ", href: "/account/bookings" },
    ],
  },
  {
    title: "ข้อมูล",
    links: [
      { label: "เกี่ยวกับเรา", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "คู่มือเที่ยว", href: "/blog" },
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
  { name: "Go365", slug: "go365" },
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
  { label: "จุดหมายเที่ยว", href: "/destinations", emoji: "🌏" },
  { label: "ทัวร์ฮิต", href: "/search?sort=popular", emoji: "🎫" },
  { label: "กรุ๊ปส่วนตัว", href: "/private-group", emoji: "✈️" },
  { label: "บริการวีซ่า", href: "/visa", emoji: "🛂" },
  { label: "สมัครไกด์/หัวหน้าทัวร์", href: "/careers", emoji: "💼" },
  { label: "Blog & คู่มือเที่ยว", href: "/blog", emoji: "📝" },
  { label: "FAQ", href: "/help", emoji: "❓" },
  { label: "ติดต่อ", href: "/contact", emoji: "📞" },
];
