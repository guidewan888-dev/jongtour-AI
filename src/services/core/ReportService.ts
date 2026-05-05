/**
 * ReportService — Consolidated platform analytics & KPIs
 */
import { prisma } from '@/lib/prisma';

export class ReportService {

  /** Dashboard KPIs — revenue, bookings, customers, conversion */
  static async getDashboardKPIs(dateFrom?: Date, dateTo?: Date) {
    const where = dateFrom && dateTo ? { createdAt: { gte: dateFrom, lte: dateTo } } : {};

    const [bookings, revenue, customers, payments, leads] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.aggregate({ where: { ...where, status: { in: ['CONFIRMED', 'paid'] } }, _sum: { totalPrice: true } }),
      prisma.customer.count({ where }),
      prisma.payment.count({ where: { ...where, status: 'COMPLETED' } }),
      prisma.lead.count({ where }).catch(() => 0),
    ]);

    return {
      totalBookings: bookings,
      totalRevenue: revenue._sum.totalPrice || 0,
      totalCustomers: customers,
      totalPayments: payments,
      totalLeads: leads,
      avgBookingValue: bookings > 0 ? Math.round((revenue._sum.totalPrice || 0) / bookings) : 0,
    };
  }

  /** Revenue breakdown by source */
  static async getRevenueBySource(dateFrom?: Date, dateTo?: Date) {
    const where = dateFrom && dateTo ? { createdAt: { gte: dateFrom, lte: dateTo } } : {};

    const bookings = await prisma.booking.groupBy({
      by: ['bookingSource'],
      where: { ...where, status: { in: ['CONFIRMED', 'paid'] } },
      _sum: { totalPrice: true },
      _count: true,
    });

    return bookings.map(b => ({
      source: b.bookingSource || 'ONLINE',
      revenue: b._sum.totalPrice || 0,
      count: b._count,
    }));
  }

  /** Top selling tours */
  static async getTopTours(limit = 10) {
    const tours = await prisma.booking.groupBy({
      by: ['tourId'],
      where: { status: { in: ['CONFIRMED', 'paid'] } },
      _sum: { totalPrice: true },
      _count: true,
      orderBy: { _count: { tourId: 'desc' } },
      take: limit,
    });

    const tourDetails = await prisma.tour.findMany({
      where: { id: { in: tours.map(t => t.tourId) } },
      select: { id: true, tourName: true, tourCode: true },
    });

    return tours.map(t => ({
      tourId: t.tourId,
      tourName: tourDetails.find(d => d.id === t.tourId)?.tourName || 'Unknown',
      tourCode: tourDetails.find(d => d.id === t.tourId)?.tourCode || '',
      bookings: t._count,
      revenue: t._sum.totalPrice || 0,
    }));
  }

  /** Payment method distribution */
  static async getPaymentMethods() {
    const methods = await prisma.payment.groupBy({
      by: ['paymentMethod'],
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
      _count: true,
    });

    return methods.map(m => ({
      method: m.paymentMethod,
      count: m._count,
      total: m._sum.amount || 0,
    }));
  }

  /** Affiliate performance summary */
  static async getAffiliateReport() {
    const affiliates = await prisma.affiliate.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true, displayName: true, type: true, tier: true,
        totalRevenue: true, totalCommission: true, totalPaid: true,
        _count: { select: { clicks: true, commissions: true } },
      },
      orderBy: { totalRevenue: 'desc' },
      take: 20,
    });

    const totalClicks = await prisma.affiliateClick.count();
    const totalConversions = await prisma.affiliateClick.count({ where: { converted: true } });

    return {
      affiliates,
      summary: {
        totalClicks,
        totalConversions,
        conversionRate: totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : '0',
      },
    };
  }

  /** Talent performance summary */
  static async getTalentReport() {
    const talents = await prisma.talent.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true, displayName: true, tier: true, rating: true,
        reviewCount: true, totalTrips: true, totalEarnings: true,
        _count: { select: { requests: true, reviews: true } },
      },
      orderBy: { rating: 'desc' },
    });

    const requestStats = await prisma.talentRequest.groupBy({
      by: ['status'],
      _count: true,
    });

    return { talents, requestStats: requestStats.map(r => ({ status: r.status, count: r._count })) };
  }

  /** Monthly revenue trend (last 12 months) */
  static async getMonthlyRevenueTrend() {
    const months: { month: string; revenue: number; bookings: number }[] = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const label = start.toLocaleDateString('th-TH', { month: 'short', year: '2-digit' });

      const [rev, count] = await Promise.all([
        prisma.booking.aggregate({ where: { createdAt: { gte: start, lte: end }, status: { in: ['CONFIRMED', 'paid'] } }, _sum: { totalPrice: true } }),
        prisma.booking.count({ where: { createdAt: { gte: start, lte: end } } }),
      ]);

      months.push({ month: label, revenue: rev._sum.totalPrice || 0, bookings: count });
    }

    return months;
  }

  /** Visa application stats */
  static async getVisaReport() {
    const stats = await prisma.visaApplication.groupBy({
      by: ['status'],
      _count: true,
    });

    const byCountry = await prisma.visaApplication.groupBy({
      by: ['country'],
      _count: true,
      orderBy: { _count: { country: 'desc' } },
      take: 10,
    });

    return {
      statusBreakdown: stats.map(s => ({ status: s.status, count: s._count })),
      topCountries: byCountry.map(c => ({ country: c.country, count: c._count })),
    };
  }
}
