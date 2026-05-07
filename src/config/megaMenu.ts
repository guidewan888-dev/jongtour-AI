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
  titleHref?: string;
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
        title: "ทัวร์จีน / ทัวร์ญี่ปุ่น",
        titleHref: "/tours/asia",
        items: [
          { label: "ทัวร์จีน", href: "/tours/asia/china", flagCode: "cn" },
          { label: "ทัวร์เฉิงตู", href: "/tours/asia/china/chengdu", emoji: "🏙️" },
          { label: "ทัวร์จางเจียเจี้ย", href: "/tours/asia/china/zhangjiajie", emoji: "🏔️" },
          { label: "ทัวร์คุนหมิง", href: "/tours/asia/china/kunming", emoji: "🌸" },
          { label: "ทัวร์ปักกิ่ง", href: "/tours/asia/china/beijing", emoji: "🏯" },
          { label: "ทัวร์เซี่ยงไฮ้", href: "/tours/asia/china/shanghai", emoji: "🌃" },
          { label: "ทัวร์กวางเจา", href: "/tours/asia/china/guangzhou", emoji: "🏙️" },
          { label: "ทัวร์ญี่ปุ่น", href: "/tours/asia/japan", flagCode: "jp" },
          { label: "ทัวร์โตเกียว", href: "/tours/asia/japan/tokyo", emoji: "🗼" },
          { label: "ทัวร์โอซาก้า", href: "/tours/asia/japan/osaka", emoji: "🏯" },
          { label: "ทัวร์ฮอกไกโด", href: "/tours/asia/japan/hokkaido", emoji: "❄️" },
          { label: "ทัวร์เกียวโต", href: "/tours/asia/japan/kyoto", emoji: "⛩️" },
          { label: "ทัวร์ฟุกุโอกะ", href: "/tours/asia/japan/fukuoka", emoji: "🌊" },
          { label: "ทัวร์ฮ่องกง", href: "/tours/asia/hongkong", flagCode: "hk" },
          { label: "ทัวร์ไต้หวัน", href: "/tours/asia/taiwan", flagCode: "tw" },
          { label: "ทัวร์มาเก๊า", href: "/tours/asia/macau", flagCode: "mo" },
        ],
      },
      {
        title: "ทัวร์เอเชีย",
        titleHref: "/tours/asia",
        items: [
          { label: "ทัวร์เกาหลี", href: "/tours/asia/south-korea", flagCode: "kr" },
          { label: "ทัวร์โซล", href: "/tours/asia/south-korea/seoul", emoji: "🏙️" },
          { label: "ทัวร์ปูซาน", href: "/tours/asia/south-korea/busan", emoji: "🌊" },
          { label: "ทัวร์เชจู", href: "/tours/asia/south-korea/jeju", emoji: "🏝️" },
          { label: "ทัวร์เวียดนาม", href: "/tours/asia/vietnam", flagCode: "vn" },
          { label: "ทัวร์ดานัง", href: "/tours/asia/vietnam/danang", emoji: "🏖️" },
          { label: "ทัวร์ฮานอย", href: "/tours/asia/vietnam/hanoi", emoji: "🏙️" },
          { label: "ทัวร์สิงคโปร์", href: "/tours/asia/singapore", flagCode: "sg" },
          { label: "ทัวร์มาเลเซีย", href: "/tours/asia/malaysia", flagCode: "my" },
          { label: "ทัวร์กัมพูชา", href: "/tours/asia/cambodia", flagCode: "kh" },
          { label: "ทัวร์อินเดีย", href: "/tours/asia/india", flagCode: "in" },
          { label: "ทัวร์พม่า", href: "/tours/asia/myanmar", flagCode: "mm" },
          { label: "ทัวร์ลาว", href: "/tours/asia/laos", flagCode: "la" },
          { label: "ทัวร์ฟิลิปปินส์", href: "/tours/asia/philippines", flagCode: "ph" },
          { label: "ทัวร์ศรีลังกา", href: "/tours/asia/srilanka", flagCode: "lk" },
        ],
      },
      {
        title: "ทัวร์ยุโรป และทัวร์อื่นๆ",
        titleHref: "/tours/europe",
        items: [
          { label: "ทัวร์อังกฤษ", href: "/tours/europe/uk", flagCode: "gb" },
          { label: "ทัวร์ฝรั่งเศส", href: "/tours/europe/france", flagCode: "fr" },
          { label: "ทัวร์อิตาลี", href: "/tours/europe/italy", flagCode: "it" },
          { label: "ทัวร์สวิตเซอร์แลนด์", href: "/tours/europe/switzerland", flagCode: "ch" },
          { label: "ทัวร์สเปน", href: "/tours/europe/spain", flagCode: "es" },
          { label: "ทัวร์ตุรกี", href: "/tours/europe/turkey", flagCode: "tr" },
          { label: "ทัวร์รัสเซีย", href: "/tours/europe/russia", flagCode: "ru" },
          { label: "ทัวร์จอร์เจีย", href: "/tours/europe/georgia", flagCode: "ge" },
          { label: "ทัวร์อียิปต์", href: "/tours/europe/egypt", flagCode: "eg" },
          { label: "ทัวร์ดูไบ", href: "/tours/europe/dubai", flagCode: "ae" },
        ],
      },
      {
        title: "อเมริกา / โอเชียเนีย",
        titleHref: "/tours/americas",
        items: [
          { label: "ทัวร์อเมริกา", href: "/tours/americas/usa", flagCode: "us" },
          { label: "ทัวร์แคนาดา", href: "/tours/americas/canada", flagCode: "ca" },
          { label: "ทัวร์ออสเตรเลีย", href: "/tours/oceania/australia", flagCode: "au" },
          { label: "ทัวร์นิวซีแลนด์", href: "/tours/oceania/newzealand", flagCode: "nz" },
        ],
      },
    ],
    footerLink: { label: "ดูทัวร์ทั้งหมด →", href: "/search" },
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
