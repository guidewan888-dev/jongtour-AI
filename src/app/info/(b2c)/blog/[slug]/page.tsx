import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, ChevronLeft, Share2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: blog, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (error || !blog) {
    // If the table doesn't exist yet, we show a fallback demo post for development purposes
    if (error?.code === '42P01') {
      return <FallbackDemoPost slug={params.slug} />;
    }
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link href="/blog" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-indigo-600 mb-8 transition-colors">
        <ChevronLeft className="w-4 h-4" /> กลับหน้ารวมบทความ
      </Link>
      
      <div className="mb-10 text-center">
        {blog.category && (
          <span className="inline-block bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold mb-6">
            {blog.category}
          </span>
        )}
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
          {blog.title}
        </h1>
        <div className="flex items-center justify-center gap-4 text-slate-500 text-sm font-medium">
          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(blog.published_at).toLocaleDateString('th-TH')}</span>
        </div>
      </div>

      {blog.cover_image && (
        <div className="w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden mb-12 shadow-lg">
          <img src={blog.cover_image} alt={blog.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Render HTML content (assuming content is stored as rich text/HTML) */}
      <div className="prose prose-lg prose-slate max-w-none prose-headings:font-black prose-a:text-indigo-600 hover:prose-a:text-indigo-500" dangerouslySetInnerHTML={{ __html: blog.content || '' }} />
      
      <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-center">
        <p className="text-slate-500 font-medium">แชร์บทความนี้</p>
        <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-indigo-600 hover:text-white transition-colors">
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </article>
  );
}

// Fallback for when the 'blogs' table hasn't been created yet
function FallbackDemoPost({ slug }: { slug: string }) {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link href="/blog" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-indigo-600 mb-8 transition-colors">
        <ChevronLeft className="w-4 h-4" /> กลับหน้ารวมบทความ
      </Link>
      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-2xl mb-8">
        <h3 className="font-bold text-lg mb-2">Demo Mode (Table ไม่พบ)</h3>
        <p>หน้านี้เป็นการแสดงผลจำลอง เนื่องจากยังไม่ได้สร้าง Table `blogs` ใน Supabase</p>
      </div>
      <div className="mb-10 text-center">
        <span className="inline-block bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold mb-6">
          คู่มือท่องเที่ยว
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
          ทดสอบการแสดงผลบทความ: {slug}
        </h1>
      </div>
      <div className="prose prose-lg max-w-none">
        <p>นี่คือเนื้อหาตัวอย่าง หากมีการสร้าง Table <strong>blogs</strong> และใส่ข้อมูลจริง ระบบจะแสดงผลอัตโนมัติ</p>
      </div>
    </article>
  );
}
