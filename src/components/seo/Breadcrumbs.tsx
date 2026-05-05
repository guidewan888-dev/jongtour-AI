"use client";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { StructuredData, breadcrumbSchema } from "@/components/seo/StructuredData";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jongtour.com";

  const schemaItems = [
    { name: "หน้าแรก", url: siteUrl },
    ...items.map((item) => ({
      name: item.label,
      ...(item.href ? { url: `${siteUrl}${item.href}` } : {}),
    })),
  ];

  return (
    <>
      <StructuredData schemas={[breadcrumbSchema(schemaItems)]} />
      <nav aria-label="Breadcrumb" className={`flex items-center gap-1.5 text-sm text-slate-400 flex-wrap ${className}`}>
        <Link href="/" className="flex items-center gap-1 hover:text-primary transition-colors">
          <Home className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">หน้าแรก</span>
        </Link>
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-slate-300" />
            {item.href && i < items.length - 1 ? (
              <Link href={item.href} className="hover:text-primary transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-slate-600 font-medium truncate max-w-[200px]">{item.label}</span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}
