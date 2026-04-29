import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layouts/Header";
import OAuthCallbackCatcher from "@/components/OAuthCallbackCatcher";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <Suspense fallback={null}>
          <OAuthCallbackCatcher />
        </Suspense>
        <Header />
        {children}
      </body>
    </html>
  );
}
