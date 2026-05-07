import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GTMScript, { GTMNoScript } from "@/components/tracking/GTMScript";
import CookieConsent from "@/components/tracking/CookieConsent";
import { StructuredData, organizationSchema, websiteSchema } from "@/components/seo/StructuredData";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jongtour.com";

export const metadata: Metadata = {
  title: {
    default: "Jongtour — จองทัวร์ออนไลน์ ครบทุกเส้นทาง พร้อม AI ช่วยค้นหา",
    template: "%s | Jongtour",
  },
  description:
    "ค้นหาและจองทัวร์ทั่วโลก AI ช่วยแนะนำทัวร์ที่ใช่ ราคาถูก รับประกันคืนเงิน บริการวีซ่าครบวงจร พร้อมไกด์มืออาชีพ",
  keywords: [
    "จองทัวร์", "ทัวร์ต่างประเทศ", "ทัวร์ญี่ปุ่น", "ทัวร์เกาหลี", "ทัวร์ยุโรป",
    "ทัวร์อียิปต์", "AI ค้นหาทัวร์", "กรุ๊ปส่วนตัว", "วีซ่า", "Jongtour",
  ],
  openGraph: {
    title: "Jongtour — จองทัวร์ออนไลน์ ครบทุกเส้นทาง",
    description: "ค้นหาและจองทัวร์ต่างประเทศจากทุก Wholesale พร้อม AI ช่วยแนะนำ",
    siteName: "Jongtour",
    locale: "th_TH",
    type: "website",
    images: [{ url: `${siteUrl}/og/default.svg`, width: 1200, height: 630, alt: "Jongtour — จองทัวร์ออนไลน์" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@Jongtour",
    title: "Jongtour — จองทัวร์ออนไลน์",
    description: "ค้นหาและจองทัวร์ต่างประเทศจากทุก Wholesale พร้อม AI ช่วยแนะนำ",
  },
  robots: { index: true, follow: true, "max-image-preview": "large" as any },
  alternates: {
    canonical: siteUrl,
    languages: { "th-TH": siteUrl, "x-default": siteUrl },
  },
  metadataBase: new URL(siteUrl),
  icons: {
    icon: "/favicon.svg",
    apple: "/icons/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  other: {
    "theme-color": "#F97316",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning className={inter.variable}>
      <head>
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />

        {/* Hreflang (Phase 1 Thai, ready for EN) */}
        <link rel="alternate" hrefLang="th-TH" href={siteUrl} />
        <link rel="alternate" hrefLang="x-default" href={siteUrl} />

        {/* Structured Data — Organization + WebSite (every page) */}
        <StructuredData schemas={[organizationSchema(), websiteSchema()]} />

        {/* GTM + All Pixels */}
        <GTMScript />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <GTMNoScript />
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
