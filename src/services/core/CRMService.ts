/**
 * CRMService — Sales pipeline, lead management, telesales follow-ups
 */
import { prisma } from '@/lib/prisma';
import { NotificationService } from './NotificationService';

export class CRMService {

  /** Capture lead from any source (Web, LINE, Facebook, AI Chat) */
  static async captureLead(source: string, data: {
    name: string; phone?: string; email?: string; lineId?: string;
    interest?: string; tourId?: string; message?: string;
  }) {
    // Check existing customer
    let customer = null;
    if (data.email) {
      customer = await prisma.customer.findFirst({ where: { email: data.email } });
    }
    if (!customer && data.phone) {
      customer = await prisma.customer.findFirst({ where: { phone: data.phone } });
    }

    // Create customer if new
    if (!customer) {
      const nameParts = data.name.split(' ');
      customer = await prisma.customer.create({
        data: {
          firstName: nameParts[0] || data.name,
          lastName: nameParts.slice(1).join(' ') || '-',
          email: data.email || `lead_${Date.now()}@temp.jongtour.com`,
          phone: data.phone || '-',
          lineId: data.lineId,
        },
      });
    }

    // Create lead
    const lead = await prisma.lead.create({
      data: {
        customerId: customer.id,
        source,
        interest: data.interest || 'GENERAL',
        tourId: data.tourId,
        message: data.message,
        status: 'NEW',
        priority: source === 'AI_CHAT' ? 'HIGH' : 'NORMAL',
      },
    });

    // Auto-assign to sales rep (round-robin)
    await this.autoAssignLead(lead.id);

    // Notify admin
    await NotificationService.adminAlert(
      `New Lead: ${data.name} (${source}) — ${data.interest || 'General'}`,
      'INFO'
    );

    return { leadId: lead.id, customerId: customer.id };
  }

  /** Auto-assign lead to sales rep (round-robin) */
  private static async autoAssignLead(leadId: string) {
    try {
      const salesReps = await prisma.user.findMany({
        where: { role: { name: { in: ['SALE_STAFF', 'SALE_MANAGER'] } } },
        select: { id: true, _count: { select: { assignedLeads: true } } },
        orderBy: { assignedLeads: { _count: 'asc' } },
        take: 1,
      });

      if (salesReps.length > 0) {
        await prisma.lead.update({
          where: { id: leadId },
          data: { assignedToId: salesReps[0].id, status: 'ASSIGNED' },
        });
      }
    } catch {
      // If relation doesn't exist yet, skip
    }
  }

  /** Move lead through pipeline stages */
  static async updateLeadStage(leadId: string, newStage: string, note?: string) {
    const lead = await prisma.lead.update({
      where: { id: leadId },
      data: { status: newStage },
    });

    // Log activity
    await prisma.leadActivity.create({
      data: { leadId, type: 'STAGE_CHANGE', description: `Stage → ${newStage}${note ? ': ' + note : ''}` },
    }).catch(() => {});

    return lead;
  }

  /** Add follow-up note */
  static async addFollowUp(leadId: string, userId: string, note: string, nextFollowUp?: Date) {
    await prisma.leadActivity.create({
      data: { leadId, type: 'FOLLOW_UP', description: note, userId },
    }).catch(() => {});

    if (nextFollowUp) {
      await prisma.lead.update({
        where: { id: leadId },
        data: { nextFollowUp },
      }).catch(() => {});
    }

    return true;
  }

  /** Get lead pipeline summary */
  static async getPipelineSummary() {
    const stages = await prisma.lead.groupBy({
      by: ['status'],
      _count: true,
    });

    const totalLeads = await prisma.lead.count();
    const hotLeads = await prisma.lead.count({ where: { priority: 'HIGH' } });

    return {
      stages: stages.map(s => ({ stage: s.status, count: s._count })),
      totalLeads,
      hotLeads,
    };
  }

  /** Get leads for sales dashboard */
  static async getLeads(filters?: { status?: string; assignedTo?: string; source?: string }, limit = 50) {
    return prisma.lead.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.assignedTo && { assignedToId: filters.assignedTo }),
        ...(filters?.source && { source: filters.source }),
      },
      include: {
        customer: { select: { firstName: true, lastName: true, email: true, phone: true } },
        tour: { select: { tourName: true, tourCode: true } },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });
  }

  /** Convert lead to booking */
  static async convertToBooking(leadId: string) {
    const lead = await prisma.lead.update({
      where: { id: leadId },
      data: { status: 'CONVERTED', convertedAt: new Date() },
    });
    return lead;
  }
}
