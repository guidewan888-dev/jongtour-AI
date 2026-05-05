"use client";
import React, { useState } from "react";
import { Plus, FileText, Eye, Edit, Trash2, Search, Calendar, Tag, TrendingUp } from "lucide-react";

type BlogPost = {
  id: string; title: string; slug: string; status: "DRAFT" | "PUBLISHED" | "SCHEDULED";
  category: string; author: string; views: number; publishedAt?: string; wordCount: number;
};

const mockPosts: BlogPost[] = [
  { id: "1", title: "ทัวร์ญี่ปุ่นเดือนไหนดี? คู่มือเลือกฤดูเที่ยว 2026", slug: "japan-best-season-2026", status: "PUBLISHED", category: "Travel Guide", author: "Jongtour Team", views: 4250, publishedAt: "15 ม.ค.", wordCount: 2800 },
  { id: "2", title: "เตรียมตัวไปเที่ยวฮอกไกโด ฤดูหนาว 2026", slug: "hokkaido-winter-prep-2026", status: "PUBLISHED", category: "Preparation", author: "Jongtour Team", views: 3180, publishedAt: "20 ม.ค.", wordCount: 2200 },
  { id: "3", title: "10 อันดับทัวร์ครอบครัวญี่ปุ่นที่ดีที่สุด", slug: "top-10-family-japan-tours", status: "PUBLISHED", category: "Ranking", author: "Jongtour Team", views: 2100, publishedAt: "25 ม.ค.", wordCount: 2500 },
  { id: "4", title: "ขอวีซ่าอเมริกายากไหม? สิ่งที่ต้องรู้ก่อนยื่น", slug: "usa-visa-guide", status: "DRAFT", category: "Visa Guide", author: "Visa Expert", views: 0, wordCount: 1800 },
  { id: "5", title: "เปรียบเทียบทัวร์เกาหลี vs ญี่ปุ่น ที่ไหนดีกว่ากัน", slug: "korea-vs-japan-tour", status: "SCHEDULED", category: "Comparison", author: "Jongtour Team", views: 0, publishedAt: "1 ก.พ.", wordCount: 2100 },
];

const statusBadge: Record<string, [string, string]> = {
  DRAFT: ["bg-slate-100 text-slate-600", "📝 Draft"],
  PUBLISHED: ["bg-emerald-100 text-emerald-700", "✅ Published"],
  SCHEDULED: ["bg-blue-100 text-blue-700", "📅 Scheduled"],
};

export default function BlogCMSPage() {
  const [posts] = useState(mockPosts);
  const [filter, setFilter] = useState<string>("ALL");

  const filtered = filter === "ALL" ? posts : posts.filter(p => p.status === filter);
  const totalViews = posts.reduce((s, p) => s + p.views, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">📝 Blog CMS</h1>
          <p className="text-sm text-slate-500 mt-1">{posts.length} บทความ · {totalViews.toLocaleString()} views</p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-hover transition-colors">
          <Plus className="w-4 h-4" /> เขียนบทความใหม่
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-emerald-50 p-3 rounded-2xl text-center">
          <div className="text-xl font-black text-emerald-700">{posts.filter(p => p.status === "PUBLISHED").length}</div>
          <div className="text-[10px] text-emerald-600">Published</div>
        </div>
        <div className="bg-slate-50 p-3 rounded-2xl text-center">
          <div className="text-xl font-black text-slate-600">{posts.filter(p => p.status === "DRAFT").length}</div>
          <div className="text-[10px] text-slate-500">Drafts</div>
        </div>
        <div className="bg-blue-50 p-3 rounded-2xl text-center">
          <div className="text-xl font-black text-blue-700">{posts.filter(p => p.status === "SCHEDULED").length}</div>
          <div className="text-[10px] text-blue-600">Scheduled</div>
        </div>
        <div className="bg-primary/5 p-3 rounded-2xl text-center">
          <div className="text-xl font-black text-primary">{totalViews.toLocaleString()}</div>
          <div className="text-[10px] text-primary/70">Total Views</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 bg-slate-100 rounded-xl p-1 w-fit">
        {["ALL", "PUBLISHED", "DRAFT", "SCHEDULED"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === f ? "bg-white text-primary shadow-sm" : "text-slate-500"}`}
          >
            {f === "ALL" ? "ทั้งหมด" : f}
          </button>
        ))}
      </div>

      {/* Post list */}
      <div className="space-y-3 stagger-children">
        {filtered.map(post => {
          const [badgeClass, badgeLabel] = statusBadge[post.status];
          return (
            <div key={post.id} className="g-card p-4 flex items-start gap-4 hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{post.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeClass}`}>{badgeLabel}</span>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{post.category}</span>
                  <span>{post.author}</span>
                  <span>{post.wordCount.toLocaleString()} คำ</span>
                  {post.publishedAt && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{post.publishedAt}</span>}
                </div>
                <div className="text-xs text-slate-300 mt-1 font-mono">/blog/{post.slug}</div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {post.views > 0 && (
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm font-bold text-slate-700">
                      <Eye className="w-3.5 h-3.5 text-blue-500" />
                      {post.views.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400">views</div>
                  </div>
                )}
                <div className="flex gap-1">
                  <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors"><Edit className="w-4 h-4 text-slate-400" /></button>
                  <button className="p-2 rounded-lg hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4 text-slate-300 hover:text-red-400" /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Calendar prompt */}
      <div className="g-card p-5 bg-slate-50 text-center">
        <h3 className="font-bold text-sm text-slate-700 mb-2">📅 Content Calendar</h3>
        <p className="text-xs text-slate-400 mb-3">เป้าหมาย: 4-8 บทความ/เดือน · 1,500+ คำ/บทความ</p>
        <div className="flex justify-center gap-2 flex-wrap text-xs">
          {["Best Time to Visit", "Comparison", "How-to Guide", "Top 10 List"].map(t => (
            <span key={t} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-500">{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
