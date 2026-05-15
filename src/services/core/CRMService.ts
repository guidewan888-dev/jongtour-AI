/**
 * CRMService - Sales pipeline and lead management
 */
import { prisma } from '@/lib/prisma';
import { NotificationService } from './NotificationService';

function buildContactInfo(data: { phone?: string; email?: string; lineId?: string }) {
  const parts = [data.phone && `phone:${data.phone}`, data.email && `email:${data.email}`, data.lineId && `line:${data.lineId}`].filter(
    Boolean,
  );
  return parts.join(' | ') || '-';
}

export class CRMService {
  /** Capture lead from any source */
  static async captureLead(
    source: string,
    data: {
      name: string;
      phone?: string;
      email?: string;
      lineId?: string;
      interest?: string;
      tourId?: string;
      message?: string;
    },
  ) {
    let customer = null;
    if (data.email) customer = await prisma.customer.findFirst({ where: { email: data.email } });
    if (!customer && data.phone) customer = await prisma.customer.findFirst({ where: { phone: data.phone } });

    if (!customer) {
      const nameParts = String(data.name || '').trim().split(/\s+/);
      customer = await prisma.customer.create({
        data: {
          firstName: nameParts[0] || 'Guest',
          lastName: nameParts.slice(1).join(' ') || '-',
          email: data.email || `lead_${Date.now()}@temp.jongtour.com`,
          phone: data.phone || '-',
          lineId: data.lineId,
          tags: [],
        },
      });
    }

    const lead = await prisma.lead.create({
      data: {
        customerName: data.name || `${customer.firstName} ${customer.lastName}`,
        contactInfo: buildContactInfo(data),
        source: source || 'WEB',
        status: 'NEW',
      },
    });

    if (data.message || data.interest || data.tourId) {
      const extra = [data.interest && `interest=${data.interest}`, data.tourId && `tourId=${data.tourId}`, data.message].filter(Boolean).join(' | ');
      await prisma.leadActivity.create({
        data: { leadId: lead.id, type: 'CHAT', note: extra || 'Lead captured' },
      });
    }

    await this.autoAssignLead(lead.id);
    await NotificationService.adminAlert(`New Lead: ${data.name} (${source})`, 'INFO');

    return { leadId: lead.id, customerId: customer.id };
  }

  /** Auto-assign lead to sales rep */
  private static async autoAssignLead(leadId: string) {
    const salesRep = await prisma.user.findFirst({
      where: { role: { name: { in: ['SALE_STAFF', 'SALE_MANAGER'] } }, status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });

    if (!salesRep) return;

    await prisma.lead.update({
      where: { id: leadId },
      data: { saleId: salesRep.id, status: 'CONTACTED' },
    });
  }

  /** Move lead through pipeline stages */
  static async updateLeadStage(leadId: string, newStage: string, note?: string) {
    const lead = await prisma.lead.update({
      where: { id: leadId },
      data: { status: newStage },
    });

    await prisma.leadActivity.create({
      data: { leadId, type: 'STAGE_CHANGE', note: `Stage -> ${newStage}${note ? `: ${note}` : ''}` },
    });

    return lead;
  }

  /** Add follow-up note */
  static async addFollowUp(leadId: string, userId: string, note: string, nextFollowUp?: Date) {
    await prisma.leadActivity.create({
      data: {
        leadId,
        type: 'FOLLOW_UP',
        note: `${note}${nextFollowUp ? ` | next=${nextFollowUp.toISOString()}` : ''} | by=${userId}`,
      },
    });

    return true;
  }

  /** Get lead pipeline summary */
  static async getPipelineSummary() {
    const stages = await prisma.lead.groupBy({
      by: ['status'],
      _count: true,
    });

    const totalLeads = await prisma.lead.count();
    const hotLeads = await prisma.lead.count({ where: { source: 'AI_CHAT' } });

    return {
      stages: stages.map((s) => ({ stage: s.status, count: s._count })),
      totalLeads,
      hotLeads,
    };
  }

  /** Get leads for sales dashboard */
  static async getLeads(filters?: { status?: string; assignedTo?: string; source?: string }, limit = 50) {
    return prisma.lead.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.assignedTo && { saleId: filters.assignedTo }),
        ...(filters?.source && { source: filters.source }),
      },
      include: {
        sale: { select: { id: true, email: true } },
        activities: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /** Convert lead to booking-ready stage */
  static async convertToBooking(leadId: string) {
    return prisma.lead.update({
      where: { id: leadId },
      data: { status: 'WON' },
    });
  }
}
