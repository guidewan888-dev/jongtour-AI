"use client";
import React from "react";
import Link from "next/link";

interface RelatedTour {
  slug: string;
  tourName: string;
  coverImage?: string;
  price?: number;
  duration?: string;
}

interface RelatedToursProps {
  tours: RelatedTour[];
  title?: string;
}

/**
 * RelatedTours — SEO-optimized internal linking component
 * Hub-and-spoke model: links between sibling tours for internal link equity
 */
export default function RelatedTours({ tours, title = "ทัวร์ที่เกี่ยวข้อง" }: RelatedToursProps) {
  if (!tours || tours.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-slate-100">
      <h2 className="text-xl font-bold text-slate-900 mb-4">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {tours.slice(0, 5).map((tour) => (
          <Link
            key={tour.slug}
            href={`/tour/${tour.slug}`}
            className="group block g-card overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5"
          >
            <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
              {tour.coverImage ? (
                <img
                  src={tour.coverImage}
                  alt={tour.tourName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-primary/10 to-primary/5">
                  🌏
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-primary transition-colors">
                {tour.tourName}
              </h3>
              <div className="flex items-center justify-between mt-2">
                {tour.duration && (
                  <span className="text-[10px] text-slate-400">{tour.duration}</span>
                )}
                {tour.price && (
                  <span className="text-sm font-black text-primary">฿{tour.price.toLocaleString()}</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
