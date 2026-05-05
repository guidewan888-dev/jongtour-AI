import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

/**
 * AffiliateService — Database operations for Affiliate/Commission system
 */
export const AffiliateService = {

  // ─── Affiliate CRUD ─────────────────────────────────────
  async listAffiliates(filters?: { type?: string; tier?: string; status?: string; search?: string }) {
    const where: Prisma.AffiliateWhereInput = {};
    if (filters?.type) where.type = filters.type;
    if (filters?.tier) where.tier = filters.tier;
    if (filters?.status) where.status = filters.status;
    if (filters?.search) {
      where.OR = [
        { displayName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { referralCode: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    return prisma.affiliate.findMany({
      where,
      include: { _count: { select: { clicks: true, ledgerEntries: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getAffiliate(id: string) {
    return prisma.affiliate.findUnique({
      where: { id },
      include: {
        children: { select: { id: true, displayName: true, type: true, tier: true } },
        _count: { select: { clicks: true, ledgerEntries: true, payouts: true } },
      },
    });
  },

  async createAffiliate(data: Prisma.AffiliateCreateInput) {
    return prisma.affiliate.create({ data });
  },

  async updateAffiliate(id: string, data: Prisma.AffiliateUpdateInput) {
    return prisma.affiliate.update({ where: { id }, data });
  },

  // ─── Commission Rules ───────────────────────────────────
  async listRules(affiliateId?: string) {
    return prisma.commissionRule.findMany({
      where: affiliateId ? { affiliateId } : {},
      include: { affiliate: { select: { displayName: true, type: true } } },
      orderBy: { priority: 'asc' },
    });
  },

  async createRule(data: Prisma.CommissionRuleCreateInput) {
    return prisma.commissionRule.create({ data });
  },

  async updateRule(id: string, data: Prisma.CommissionRuleUpdateInput) {
    return prisma.commissionRule.update({ where: { id }, data });
  },

  async deleteRule(id: string) {
    return prisma.commissionRule.delete({ where: { id } });
  },

  // ─── Commission Calculation ─────────────────────────────
  /**
   * Calculate commission for a booking using 6-priority stackable rules
   * P1: Affiliate-specific override
   * P2: Affiliate-type rule  
   * P3: Product-specific rule
   * P4: Campaign rule
   * P5: Tier-based rule
   * P6: Global default
   */
  async calculateCommission(affiliateId: string, bookingValue: number, productType: string) {
    const affiliate = await prisma.affiliate.findUnique({ where: { id: affiliateId } });
    if (!affiliate) throw new Error('Affiliate not found');

    const now = new Date();
    const rules = await prisma.commissionRule.findMany({
      where: {
        isActive: true,
        OR: [
          { affiliateId }, // P1
          { affiliateType: affiliate.type, affiliateId: null }, // P2
          { productType, affiliateId: null }, // P3
          { affiliateId: null, affiliateType: null, productType: null }, // P6
        ],
        AND: [
          { OR: [{ validFrom: null }, { validFrom: { lte: now } }] },
          { OR: [{ validUntil: null }, { validUntil: { gte: now } }] },
        ],
      },
      orderBy: { priority: 'asc' },
    });

    // Take highest priority rule
    const rule = rules[0];
    if (!rule) return { rate: 0, amount: 0, wht: 0, net: 0, ruleId: null };

    const amount = rule.rateType === 'PERCENTAGE' 
      ? bookingValue * (rule.rateValue / 100)
      : rule.rateValue;
    const wht = amount * 0.03; // WHT 3%
    const net = amount - wht;

    return {
      rate: rule.rateValue,
      rateType: rule.rateType,
      amount: Math.round(amount * 100) / 100,
      wht: Math.round(wht * 100) / 100,
      net: Math.round(net * 100) / 100,
      ruleId: rule.id,
      ruleName: rule.name,
    };
  },

  // ─── Commission Ledger ──────────────────────────────────
  async createLedgerEntry(data: Prisma.CommissionLedgerCreateInput) {
    return prisma.commissionLedger.create({ data });
  },

  async listLedger(affiliateId?: string, status?: string) {
    return prisma.commissionLedger.findMany({
      where: {
        ...(affiliateId && { affiliateId }),
        ...(status && { status }),
      },
      include: { affiliate: { select: { displayName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  // ─── Payouts ────────────────────────────────────────────
  async listPayouts(affiliateId?: string, status?: string) {
    return prisma.affiliatePayout.findMany({
      where: {
        ...(affiliateId && { affiliateId }),
        ...(status && { status }),
      },
      include: { affiliate: { select: { displayName: true, bankName: true, bankAccount: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  async createPayout(data: Prisma.AffiliatePayoutCreateInput) {
    return prisma.affiliatePayout.create({ data });
  },

  // ─── Click Tracking ─────────────────────────────────────
  async trackClick(data: Prisma.AffiliateClickCreateInput) {
    return prisma.affiliateClick.create({ data });
  },

  async getClickStats(affiliateId: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    
    const [totalClicks, conversions] = await Promise.all([
      prisma.affiliateClick.count({ where: { affiliateId, createdAt: { gte: since } } }),
      prisma.affiliateClick.count({ where: { affiliateId, converted: true, createdAt: { gte: since } } }),
    ]);

    return {
      totalClicks,
      conversions,
      conversionRate: totalClicks > 0 ? ((conversions / totalClicks) * 100).toFixed(2) : '0',
    };
  },

  // ─── Dashboard KPIs ─────────────────────────────────────
  async getDashboardKpis() {
    const [
      totalAffiliates,
      activeAffiliates,
      pendingPayout,
      monthlyCommission,
    ] = await Promise.all([
      prisma.affiliate.count(),
      prisma.affiliate.count({ where: { status: 'ACTIVE' } }),
      prisma.commissionLedger.aggregate({
        where: { status: { in: ['CONFIRMED', 'APPROVED'] } },
        _sum: { netAmount: true },
      }),
      prisma.commissionLedger.aggregate({
        where: {
          createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
          status: { not: 'CANCELLED' },
        },
        _sum: { commissionAmount: true },
      }),
    ]);

    return {
      totalAffiliates,
      activeAffiliates,
      pendingPayout: pendingPayout._sum.netAmount || 0,
      monthlyCommission: monthlyCommission._sum.commissionAmount || 0,
    };
  },
};
