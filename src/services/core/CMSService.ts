/**
 * CMSService — Blog posts, banners, and content management
 */
import { prisma } from '@/lib/prisma';

export class CMSService {

  /** Get active homepage banners */
  static async getBanners() {
    try {
      return await prisma.banner.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
    } catch {
      return [];
    }
  }

  /** Get published blog posts with pagination */
  static async getArticles(options?: { page?: number; limit?: number; category?: string; tag?: string }) {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = { status: 'PUBLISHED' };
    if (options?.category) where.category = options.category;

    try {
      const [posts, total] = await Promise.all([
        prisma.blogPost.findMany({
          where,
          orderBy: { publishedAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.blogPost.count({ where }),
      ]);

      return { posts, total, page, totalPages: Math.ceil(total / limit) };
    } catch {
      return { posts: [], total: 0, page: 1, totalPages: 0 };
    }
  }

  /** Get single blog post by slug */
  static async getArticleBySlug(slug: string) {
    try {
      const post = await prisma.blogPost.findFirst({
        where: { slug, status: 'PUBLISHED' },
      });

      // Increment view count
      if (post) {
        await prisma.blogPost.update({
          where: { id: post.id },
          data: { views: { increment: 1 } },
        }).catch(() => {});
      }

      return post;
    } catch {
      return null;
    }
  }

  /** Create or update blog post */
  static async upsertArticle(data: {
    id?: string; title: string; slug: string; content: string;
    excerpt?: string; coverImage?: string; category?: string;
    tags?: string[]; status?: string; authorId?: string;
  }) {
    const slug = data.slug || data.title.toLowerCase()
      .replace(/[ก-๙]+/g, (m) => m) // Keep Thai chars
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9ก-๙\-]/g, '')
      .substring(0, 80);

    if (data.id) {
      return prisma.blogPost.update({
        where: { id: data.id },
        data: {
          title: data.title,
          slug,
          content: data.content,
          excerpt: data.excerpt,
          coverImage: data.coverImage,
          category: data.category,
          tags: data.tags,
          status: data.status || 'DRAFT',
          ...(data.status === 'PUBLISHED' && { publishedAt: new Date() }),
        },
      });
    }

    return prisma.blogPost.create({
      data: {
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt,
        coverImage: data.coverImage,
        category: data.category,
        tags: data.tags || [],
        status: data.status || 'DRAFT',
        authorId: data.authorId,
        ...(data.status === 'PUBLISHED' && { publishedAt: new Date() }),
      },
    });
  }

  /** Get blog categories with counts */
  static async getCategories() {
    try {
      const cats = await prisma.blogPost.groupBy({
        by: ['category'],
        where: { status: 'PUBLISHED' },
        _count: true,
      });
      return cats.map(c => ({ category: c.category, count: c._count }));
    } catch {
      return [];
    }
  }

  /** Get related posts (by category) */
  static async getRelatedPosts(postId: string, category: string, limit = 4) {
    try {
      return await prisma.blogPost.findMany({
        where: { status: 'PUBLISHED', category, id: { not: postId } },
        orderBy: { publishedAt: 'desc' },
        take: limit,
      });
    } catch {
      return [];
    }
  }
}
