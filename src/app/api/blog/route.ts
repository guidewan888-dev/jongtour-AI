import { NextRequest, NextResponse } from 'next/server';
import { CMSService } from '@/services/core/CMSService';

export const dynamic = 'force-dynamic';

// GET /api/blog?page=1&limit=10&category=Travel+Guide
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page') || '1');
    const limit = Number(searchParams.get('limit') || '10');
    const category = searchParams.get('category') || undefined;

    const data = await CMSService.getArticles({ page, limit, category });
    return NextResponse.json({ success: true, ...data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/blog — Create blog post (admin only)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const post = await CMSService.upsertArticle(body);
    return NextResponse.json({ success: true, data: post });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
