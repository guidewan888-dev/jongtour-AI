import React from 'react';

interface TourGalleryProps {
  images: string[];
  title: string;
}

export default function TourGallery({ images, title }: TourGalleryProps) {
  if (!images || images.length === 0) return null;

  // Destructure for grid layout
  const mainImage = images[0];
  const sideImages = images.slice(1, 5); // Take next 4 images

  return (
    <div className="relative group w-full">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-3 rounded-2xl md:rounded-3xl overflow-hidden h-[40vh] md:h-[60vh] min-h-[300px]">
        {/* Main large image (Left half on desktop) */}
        <div className="col-span-1 md:col-span-2 relative h-full">
          <img src={mainImage} alt={`${title} - ภาพหลัก`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-pointer" />
        </div>

        {/* 4 Small images grid (Right half on desktop) */}
        <div className="hidden md:grid col-span-2 grid-cols-2 grid-rows-2 gap-3 h-full">
          {sideImages.map((img, idx) => (
            <div key={idx} className="relative h-full w-full overflow-hidden">
              <img src={img} alt={`${title} - ภาพที่ ${idx + 2}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700 cursor-pointer" />
            </div>
          ))}
        </div>
      </div>

      {/* View All Button */}
      <button className="absolute bottom-4 right-4 md:bottom-6 md:right-6 bg-white/90 backdrop-blur text-slate-900 font-bold px-4 py-2 rounded-xl shadow-lg border border-slate-200 hover:bg-white transition-colors text-sm flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
        ดูรูปภาพทั้งหมด ({images.length})
      </button>
    </div>
  );
}
