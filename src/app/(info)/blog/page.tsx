import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "บทความท่องเที่ยว คู่มือจองทัวร์ วีซ่า และเคล็ดลับเที่ยวต่างประเทศ",
  description: "อ่านบทความท่องเที่ยว คู่มือเตรียมตัวเที่ยว เคล็ดลับประหยัดตังค์ รีวิวทัวร์จริง และคู่มือวีซ่าครบทุกประเทศ จาก Jongtour",
  alternates: { canonical: 'https://jongtour.com/blog' },
};

export default async function BlogListPage() {
  let posts: { id: string; title: string; slug: string; excerpt: string | null; created_at: Date; category: string | null }[] = [];
  
  try {
    const rawPosts = await prisma.cmsPage.findMany({
      where: { page_type: "BLOG", status: "PUBLISHED" },
      select: { id: true, title: true, slug: true, meta_description: true, created_at: true, page_type: true },
      orderBy: { created_at: "desc" },
      take: 20,
    });
    posts = rawPosts.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.meta_description,
      created_at: p.created_at,
      category: p.page_type,
    }));
  } catch {
    // DB not available — show empty state
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-white border-b border-slate-100">
        <div className="g-container py-16 md:py-20">
          <div className="max-w-2xl">
            <div className="g-badge-primary mb-4">Blog</div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              บทความและ<span className="text-primary-500">รีวิวทัวร์</span>
            </h1>
            <p className="text-lg text-slate-500">
              อัปเดตข่าวสาร เคล็ดลับการเดินทาง และรีวิวจากทีมงานและลูกค้า
            </p>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="g-section bg-background">
        <div className="g-container">
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="g-card-interactive p-6 block">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">บทความ</span>
                    <span className="text-xs text-slate-400">{new Date(post.created_at).toLocaleDateString("th-TH")}</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mb-2 line-clamp-2">{post.title}</h2>
                  {post.excerpt && <p className="text-sm text-slate-500 line-clamp-3">{post.excerpt}</p>}
                  <span className="mt-4 text-sm font-semibold text-primary-600 inline-block">อ่านต่อ →</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="g-card p-16 text-center">
              <div className="g-empty">
                <span className="text-5xl mb-4">📝</span>
                <p className="g-empty-title">กำลังเตรียมบทความ</p>
                <p className="g-empty-desc">บทความท่องเที่ยว รีวิว และเคล็ดลับการเดินทางกำลังจะมาเร็วๆ นี้</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
