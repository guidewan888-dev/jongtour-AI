import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

/**
 * TalentService — Database operations for Talent/Guide Request system
 */
export const TalentService = {

  // ─── Talent CRUD ────────────────────────────────────────
  async listTalents(filters?: { tier?: string; status?: string; region?: string; search?: string }) {
    const where: Prisma.TalentWhereInput = {};
    if (filters?.tier) where.tier = filters.tier;
    if (filters?.status) where.status = filters.status;
    if (filters?.region) where.region = { contains: filters.region, mode: 'insensitive' };
    if (filters?.search) {
      where.OR = [
        { displayName: { contains: filters.search, mode: 'insensitive' } },
        { bio: { contains: filters.search, mode: 'insensitive' } },
        { specialties: { has: filters.search } },
      ];
    }
    return prisma.talent.findMany({
      where,
      include: { _count: { select: { requests: true, reviews: true } } },
      orderBy: { rating: 'desc' },
    });
  },

  async getTalent(id: string) {
    return prisma.talent.findUnique({
      where: { id },
      include: {
        reviews: { orderBy: { createdAt: 'desc' }, take: 10 },
        scheduleBlocks: { where: { endDate: { gte: new Date() } }, orderBy: { startDate: 'asc' } },
        _count: { select: { requests: true, reviews: true, favorites: true } },
      },
    });
  },

  async createTalent(data: Prisma.TalentCreateInput) {
    return prisma.talent.create({ data });
  },

  async updateTalent(id: string, data: Prisma.TalentUpdateInput) {
    return prisma.talent.update({ where: { id }, data });
  },

  // ─── Availability Check ─────────────────────────────────
  async checkAvailability(talentId: string, startDate: Date, endDate: Date) {
    const conflicts = await prisma.talentScheduleBlock.findMany({
      where: {
        talentId,
        OR: [
          { startDate: { lte: endDate }, endDate: { gte: startDate } },
        ],
      },
    });
    return { available: conflicts.length === 0, conflicts };
  },

  async blockDates(data: Prisma.TalentScheduleBlockCreateInput) {
    return prisma.talentScheduleBlock.create({ data });
  },

  // ─── Request Lifecycle ──────────────────────────────────
  async createRequest(data: {
    talentId: string;
    customerId?: string;
    bookingId?: string;
    bookingType: string;
    travelDate: Date;
    daysCount: number;
    paxCount: number;
    language: string;
    message?: string;
    backupTalentId?: string;
  }) {
    const requestRef = `TR-${Date.now().toString(36).toUpperCase()}`;
    
    return prisma.talentRequest.create({
      data: {
        requestRef,
        talent: { connect: { id: data.talentId } },
        customerId: data.customerId,
        bookingId: data.bookingId,
        bookingType: data.bookingType,
        travelDate: data.travelDate,
        daysCount: data.daysCount,
        paxCount: data.paxCount,
        language: data.language,
        message: data.message,
        backupTalentId: data.backupTalentId,
        status: 'SUBMITTED',
      },
    });
  },

  async listRequests(filters?: { status?: string; talentId?: string }) {
    return prisma.talentRequest.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.talentId && { talentId: filters.talentId }),
      },
      include: { talent: { select: { displayName: true, tier: true, photoUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getRequest(id: string) {
    return prisma.talentRequest.findUnique({
      where: { id },
      include: { talent: true },
    });
  },

  async getRequestByRef(requestRef: string) {
    return prisma.talentRequest.findUnique({
      where: { requestRef },
      include: { talent: { select: { displayName: true, tier: true } } },
    });
  },

  /**
   * Transition request status (8-state lifecycle)
   * SUBMITTED → PENDING_REVIEW → TALENT_NOTIFIED → CONFIRMED → COMPLETED
   *                             ↘ ALTERNATIVE_OFFERED → CUSTOMER_DECIDED
   *                             ↘ AUTO_ASSIGNED
   *                             ↘ FULL_CANCEL
   */
  async updateRequestStatus(id: string, status: string, extra?: Prisma.TalentRequestUpdateInput) {
    const timestampMap: Record<string, string> = {
      CONFIRMED: 'confirmedAt',
      COMPLETED: 'completedAt',
      FULL_CANCEL: 'cancelledAt',
    };

    const data: Prisma.TalentRequestUpdateInput = {
      status,
      ...extra,
      ...(timestampMap[status] && { [timestampMap[status]]: new Date() }),
    };

    return prisma.talentRequest.update({ where: { id }, data });
  },

  // ─── Pricing Override ───────────────────────────────────
  async setPricingOverride(requestId: string, premium: number, surcharge: number, discount: number, note?: string) {
    const request = await prisma.talentRequest.update({
      where: { id: requestId },
      data: {
        premiumAmount: premium,
        surchargeAmount: surcharge,
        discountAmount: discount,
        pricingNote: note,
      },
    });

    // Audit trail
    await prisma.talentPricingOverride.create({
      data: {
        requestRef: request.requestRef,
        talentId: request.talentId,
        premiumAmount: premium,
        surcharge,
        discount,
        reason: note,
      },
    });

    return request;
  },

  // ─── Reviews ────────────────────────────────────────────
  async createReview(data: Prisma.TalentReviewCreateInput) {
    const review = await prisma.talentReview.create({ data });
    
    // Recalculate talent rating
    const stats = await prisma.talentReview.aggregate({
      where: { talentId: (data.talent as any).connect.id },
      _avg: { rating: true },
      _count: true,
    });

    await prisma.talent.update({
      where: { id: (data.talent as any).connect.id },
      data: {
        rating: stats._avg.rating || 0,
        reviewCount: stats._count,
      },
    });

    return review;
  },

  async listReviews(talentId: string, publicOnly = true) {
    return prisma.talentReview.findMany({
      where: {
        talentId,
        ...(publicOnly && { isPublic: true, isModerated: true }),
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  // ─── Favorites ──────────────────────────────────────────
  async toggleFavorite(customerId: string, talentId: string) {
    const existing = await prisma.talentFavorite.findUnique({
      where: { customerId_talentId: { customerId, talentId } },
    });

    if (existing) {
      await prisma.talentFavorite.delete({ where: { id: existing.id } });
      return { favorited: false };
    } else {
      await prisma.talentFavorite.create({ data: { customerId, talentId } });
      return { favorited: true };
    }
  },

  async getFavorites(customerId: string) {
    return prisma.talentFavorite.findMany({
      where: { customerId },
      include: { talent: { select: { id: true, displayName: true, tier: true, rating: true, region: true } } },
    });
  },

  // ─── Auto-match ─────────────────────────────────────────
  async findBestMatch(options: {
    travelDate: Date;
    endDate: Date;
    region?: string;
    language?: string;
    excludeTalentIds?: string[];
  }) {
    const { travelDate, endDate, region, language, excludeTalentIds = [] } = options;

    const talents = await prisma.talent.findMany({
      where: {
        status: 'ACTIVE',
        id: { notIn: excludeTalentIds },
        ...(region && { region: { contains: region, mode: 'insensitive' } }),
        ...(language && { languages: { has: language } }),
      },
      include: {
        scheduleBlocks: {
          where: {
            OR: [{ startDate: { lte: endDate }, endDate: { gte: travelDate } }],
          },
        },
      },
      orderBy: { rating: 'desc' },
    });

    // Filter available ones
    const available = talents.filter(t => t.scheduleBlocks.length === 0);
    return available.slice(0, 3); // Top 3
  },

  // ─── Dashboard KPIs ─────────────────────────────────────
  async getDashboardKpis() {
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const [
      activeTalents,
      pendingRequests,
      confirmedMtd,
      conflicts,
    ] = await Promise.all([
      prisma.talent.count({ where: { status: 'ACTIVE' } }),
      prisma.talentRequest.count({ where: { status: { in: ['SUBMITTED', 'PENDING_REVIEW'] } } }),
      prisma.talentRequest.count({ where: { status: 'CONFIRMED', confirmedAt: { gte: monthStart } } }),
      prisma.talentScheduleBlock.count({
        where: {
          startDate: { gte: new Date() },
          endDate: { gte: new Date() },
        },
      }),
    ]);

    return { activeTalents, pendingRequests, confirmedMtd, conflicts };
  },
};
