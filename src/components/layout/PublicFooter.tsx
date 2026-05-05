import React from "react";
import Link from "next/link";
import { footerColumns, footerLegalLinks, wholesalePartners } from "@/config/megaMenu";

export default function PublicFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400 font-sans">
      {/* Main Footer */}
      <div className="g-container pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-bold">
                <span className="text-primary-500">Jong</span>
                <span className="text-white">tour</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed mb-5">
              แพลตฟอร์มค้นหาและจองทัวร์ต่างประเทศ ครบทุกเส้นทาง รวมทุก Wholesale พร้อม AI ช่วยแนะนำ
            </p>
            {/* Social */}
            <div className="flex gap-2">
              {[
                { label: "Facebook", href: "https://facebook.com/jongtour", icon: "M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" },
                { label: "Instagram", href: "https://instagram.com/jongtour", icon: "M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" },
                { label: "LINE", href: "https://line.me/R/ti/p/@jongtour", icon: "M22.5 10.364c0-4.398-4.237-7.973-9.455-7.973-5.216 0-9.454 3.575-9.454 7.973 0 3.963 3.42 7.333 8.01 7.893.313.064.738.197.846.678.097.432-.03.882-.03.882s-.132.793-.162.977c-.038.232-.178.913.805.498 1.154-.486 6.223-3.666 8.163-6.07 1.01-1.238 1.278-2.678 1.278-4.858z" },
                { label: "YouTube", href: "https://youtube.com/@jongtour", icon: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
              ].map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-primary-600 hover:text-white transition-all" aria-label={s.label}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d={s.icon} clipRule="evenodd" /></svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-white mb-4 tracking-wide">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className={`text-sm transition-colors ${link.highlight ? "text-primary-400 hover:text-primary-300 font-semibold" : "text-slate-500 hover:text-white"}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Wholesale Partners */}
        <div className="py-6 border-t border-slate-800">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">Wholesale Partners</p>
          <div className="flex flex-wrap gap-3">
            {wholesalePartners.map((p) => (
              <Link
                key={p.slug}
                href={`/wholesale/${p.slug}`}
                className="px-3 py-1.5 bg-slate-800 text-slate-400 text-xs font-medium rounded-full hover:bg-slate-700 hover:text-white transition-colors"
              >
                {p.name}
              </Link>
            ))}
            <span className="px-3 py-1.5 text-slate-600 text-xs">และอีกหลายเจ้า</span>
          </div>
        </div>

        {/* Legal Links */}
        <div className="py-6 border-t border-slate-800">
          <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
            {footerLegalLinks.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800 text-xs text-slate-600 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
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
