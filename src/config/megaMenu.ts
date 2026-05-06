/**
 * Mega Menu Configuration
 * Organized by continent with flagcdn images (no emoji flags - broken on Windows)
 * All links: /country/[slug] for countries, /region/[slug] for continents
 */

export interface MegaMenuItem {
  label: string;
  href: string;
  emoji?: string;
  flagCode?: string;
}

export interface MegaMenuColumn {
  title: string;
  titleFlagCode?: string;
  items: MegaMenuItem[];
}

export interface MegaMenuGroup {
  trigger: string;
  columns: MegaMenuColumn[];
  footerLink?: { label: string; href: string };
  wide?: boolean; // wider dropdown for many columns
}

export const megaMenuConfig: MegaMenuGroup[] = [
  {
    trigger: "ทัวร์ต่างประเทศ",
    wide: true,
    columns: [
      {
        title: "จีน / ญี่ปุ่น",
        items: [
          { label: "ทัวร์จีน", href: "/country/china", flagCode: "cn" },
          { label: "ทัวร์ญี่ปุ่น", href: "/country/japan", flagCode: "jp" },
          { label: "ทัวร์ฮ่องกง", href: "/country/hongkong", flagCode: "hk" },
          { label: "ทัวร์ไต้หวัน", href: "/country/taiwan", flagCode: "tw" },
          { label: "ทัวร์มาเก๊า", href: "/country/macau", flagCode: "mo" },
        ],
      },
      {
        title: "ทัวร์เอเชีย",
        items: [
          { label: "ทัวร์เกาหลี", href: "/country/south-korea", flagCode: "kr" },
          { label: "ทัวร์เวียดนาม", href: "/country/vietnam", flagCode: "vn" },
          { label: "ทัวร์สิงคโปร์", href: "/country/singapore", flagCode: "sg" },
          { label: "ทัวร์มาเลเซีย", href: "/country/malaysia", flagCode: "my" },
          { label: "ทัวร์กัมพูชา", href: "/country/cambodia", flagCode: "kh" },
          { label: "ทัวร์อินเดีย", href: "/country/india", flagCode: "in" },
          { label: "ทัวร์พม่า", href: "/country/myanmar", flagCode: "mm" },
          { label: "ทัวร์ลาว", href: "/country/laos", flagCode: "la" },
          { label: "ทัวร์ฟิลิปปินส์", href: "/country/philippines", flagCode: "ph" },
          { label: "ทัวร์ศรีลังกา", href: "/country/srilanka", flagCode: "lk" },
        ],
      },
      {
        title: "ทัวร์ยุโรป และทัวร์อื่นๆ",
        items: [
          { label: "ทัวร์อังกฤษ", href: "/country/uk", flagCode: "gb" },
          { label: "ทัวร์ฝรั่งเศส", href: "/country/france", flagCode: "fr" },
          { label: "ทัวร์อิตาลี", href: "/country/italy", flagCode: "it" },
          { label: "ทัวร์สวิตเซอร์แลนด์", href: "/country/switzerland", flagCode: "ch" },
          { label: "ทัวร์สเปน", href: "/country/spain", flagCode: "es" },
          { label: "ทัวร์ตุรกี", href: "/country/turkey", flagCode: "tr" },
          { label: "ทัวร์รัสเซีย", href: "/country/russia", flagCode: "ru" },
          { label: "ทัวร์จอร์เจีย", href: "/country/georgia", flagCode: "ge" },
          { label: "ทัวร์อียิปต์", href: "/country/egypt", flagCode: "eg" },
          { label: "ทัวร์ดูไบ", href: "/country/dubai", flagCode: "ae" },
        ],
      },
      {
        title: "อเมริกา / โอเชียเนีย",
        items: [
          { label: "ทัวร์อเมริกา", href: "/country/usa", flagCode: "us" },
          { label: "ทัวร์แคนาดา", href: "/country/canada", flagCode: "ca" },
          { label: "ทัวร์ออสเตรเลีย", href: "/country/australia", flagCode: "au" },
          { label: "ทัวร์นิวซีแลนด์", href: "/country/newzealand", flagCode: "nz" },
        ],
      },
    ],
    footerLink: { label: "ดูทัวร์ทั้งหมด →", href: "/search" },
  },
  {
    trigger: "ทัวร์ตามทวีป",
    columns: [
      {
        title: "ทวีป",
        items: [
          { label: "ทัวร์เอเชีย", href: "/region/asia", emoji: "🌏" },
          { label: "ทัวร์ยุโรป", href: "/region/europe", emoji: "🏰" },
          { label: "ทัวร์แอฟริกา & ตะวันออกกลาง", href: "/region/africa", emoji: "🏜️" },
          { label: "ทัวร์อเมริกา", href: "/region/americas", emoji: "🗽" },
          { label: "ทัวร์โอเชียเนีย", href: "/region/oceania", emoji: "🏝️" },
        ],
      },
      {
        title: "โปรโมชั่น",
        items: [
          { label: "ทัวร์ไฟไหม้ Flash Sale", href: "/deals/flash-sale", emoji: "🔥" },
          { label: "ราคาพิเศษเดือนนี้", href: "/search", emoji: "💰" },
          { label: "AI ช่วยหาทัวร์", href: "/ai-search", emoji: "🤖" },
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
