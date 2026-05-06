import React from "react";
import Link from "next/link";
import { footerLegalLinks, wholesalePartners } from "@/config/megaMenu";

export default function PublicFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400 font-sans">
      <div className="g-container py-6">
        {/* Legal Links */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-5">
          {footerLegalLinks.map((link) => (
            <Link
              key={link.href + link.label}
              href={link.href}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 border-t border-slate-800 text-xs text-slate-600 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div>
            <p>&copy; {new Date().getFullYear()} Jongtour Co., Ltd. All rights reserved.</p>
            <p className="mt-1 text-slate-700">ใบอนุญาตประกอบธุรกิจนำเที่ยว | เลขประจำตัวผู้เสียภาษี</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sitemap.xml" className="hover:text-slate-400 transition-colors">Sitemap</Link>
            <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
