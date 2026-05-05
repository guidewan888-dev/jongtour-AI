"use client";
import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { StructuredData, faqSchema } from "@/components/seo/StructuredData";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQItem[];
  title?: string;
  injectSchema?: boolean;
}

/**
 * FAQSection — SEO-optimized FAQ accordion
 * Auto-injects FAQPage schema.org JSON-LD for rich results
 */
export default function FAQSection({ faqs, title = "คำถามที่พบบ่อย", injectSchema = true }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="mt-10">
      {injectSchema && <StructuredData schemas={[faqSchema(faqs)]} />}

      <div className="flex items-center gap-2 mb-5">
        <HelpCircle className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      </div>

      <div className="space-y-2">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className={`rounded-2xl border transition-all duration-200 ${
                isOpen ? "border-primary/20 bg-primary/[0.02] shadow-sm" : "border-slate-100 bg-white"
              }`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex items-center justify-between w-full px-5 py-4 text-left group"
                aria-expanded={isOpen}
              >
                <span className={`text-sm font-medium pr-4 ${isOpen ? "text-primary font-bold" : "text-slate-700 group-hover:text-primary"} transition-colors`}>
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-primary" : "text-slate-400"
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-5 pb-4 text-sm text-slate-500 leading-relaxed border-t border-slate-50 pt-3">
                  {faq.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
