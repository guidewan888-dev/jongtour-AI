import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import Header from "@/components/layouts/Header";
import OAuthCallbackCatcher from "@/components/OAuthCallbackCatcher";
import LineTracker from "@/components/LineTracker";
import { Suspense } from "react";

const prompt = Prompt({ 
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin", "thai"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Jongtour AI - จองทัวร์อัจฉริยะ",
  description: "แพลตฟอร์มค้นหาและจองทัวร์ที่ดีที่สุด ด้วยเทคโนโลยี AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={prompt.className}>
        <Suspense fallback={null}>
          <OAuthCallbackCatcher />
          <LineTracker />
        </Suspense>
        <Header />
        {children}
      </body>
    </html>
  );
}
