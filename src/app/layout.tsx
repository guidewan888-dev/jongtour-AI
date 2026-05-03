import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layouts/Header";
import OAuthCallbackCatcher from "@/components/OAuthCallbackCatcher";
import LineTracker from "@/components/LineTracker";
import { Suspense } from "react";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://jongtour.com'),
  title: "Jongtour AI - จองทัวร์อัจฉริยะ",
  description: "แพลตฟอร์มค้นหาและจองทัวร์ที่ดีที่สุด ด้วยเทคโนโลยี AI",
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Jongtour AI - จองทัวร์อัจฉริยะ",
    description: "แพลตฟอร์มค้นหาและจองทัวร์ที่ดีที่สุด ด้วยเทคโนโลยี AI",
    url: 'https://jongtour.com',
    siteName: 'Jongtour',
    images: [
      {
        url: 'https://jongtour.com/images/wholesales/CH7.jpg',
        width: 1200,
        height: 630,
        alt: 'Jongtour Cover',
      },
    ],
    locale: 'th_TH',
    type: 'website',
  },
};

import FloatingChat from "@/components/ui/FloatingChat";
import AgentRegistrationBadge from "@/components/AgentRegistrationBadge";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = headers();
  const subdomain = headersList.get('x-agent-subdomain') || '';
  
  let agentBranding = null;
  
  // If not a system subdomain, try to fetch agent branding
  if (subdomain && !['admin', 'b2badmin', 'sale', 'agent', 'b2b', 'booking', 'tour', 'info'].includes(subdomain)) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data } = await supabase
      .from('agents')
      .select('companyName, themeColor, logoUrl')
      .eq('subdomain', subdomain)
      .single();
      
    if (data) {
      agentBranding = data;
    }
  }

  // Inject CSS Variables if custom branding is found
  const customStyles = agentBranding?.themeColor ? {
    '--brand-color': agentBranding.themeColor,
  } as React.CSSProperties : undefined;

  return (
    <html lang="th">
      <body className={inter.className} style={customStyles}>
        <Suspense fallback={null}>
          <OAuthCallbackCatcher />
          <LineTracker />
        </Suspense>
        <Header agentLogo={agentBranding?.logoUrl} agentName={agentBranding?.companyName} />
        {children}
        <AgentRegistrationBadge />
        <FloatingChat />
      </body>
    </html>
  );
}
