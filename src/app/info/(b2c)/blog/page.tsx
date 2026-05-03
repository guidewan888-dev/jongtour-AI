import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Calendar, Clock, ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function BlogListingPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch blogs from Supabase, order by published_at descending
  // Assuming table `blogs` exists with columns: id, title, slug, excerpt, cover_image, published_at, category
  const { data: blogs, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('status', 'PUBLISHED')
    .order('published_at', { ascending: false });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">บทความท่องเที่ยว</h1>
        <p className="text-lg text-slate-500 font-medium">อัปเดตเทรนด์ท่องเที่ยว รีวิวสถานที่น่าสนใจ และทิปส์การเดินทางจากผู้เชี่ยวชาญ Jongtour</p>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-2xl mb-8">
          <h3 className="font-bold text-lg mb-2">ยังไม่มีบทความในระบบ</h3>
          <p>กรุณาสร้าง Table `blogs` ใน Supabase และเพิ่มข้อมูลบทความเพื่อแสดงผลที่นี่</p>
        </div>
      )}

      {blogs && blogs.length === 0 && !error && (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100">
          <p className="text-slate-500 text-lg">ยังไม่มีบทความในขณะนี้ กลับมาใหม่เร็วๆ นี้นะครับ</p>
        </div>
      )}

      {blogs && blogs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog: any) => (
            <Link key={blog.id} href={`/blog/${blog.slug}`} className="group bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={blog.cover_image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1000&auto=format&fit=crop'} 
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {blog.category && (
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-indigo-600 shadow-sm">
                    {blog.category}
                  </div>
                )}
              </div>
              <div className="p-8 flex flex-col flex-1">
                <div className="flex items-center gap-4 text-xs font-medium text-slate-400 mb-4">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(blog.published_at).toLocaleDateString('th-TH')}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {blog.title}
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
                  {blog.excerpt}
                </p>
                <div className="flex items-center text-indigo-600 font-semibold text-sm group-hover:gap-2 transition-all">
                  อ่านต่อ <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
