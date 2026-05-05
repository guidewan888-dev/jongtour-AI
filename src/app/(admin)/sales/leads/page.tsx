export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import LeadListClient from './LeadListClient';

export default async function LeadListPage() {
  const dbLeads = await prisma.lead.findMany({
    include: { sale: true },
    orderBy: { createdAt: 'desc' }
  });

  const formattedLeads = dbLeads.map(l => ({
    id: l.id,
    name: l.customerName,
    phone: l.contactInfo,
    interest: 'เธ—เธฑเธงเธฃเน (เธญเนเธฒเธเธญเธดเธเธเธฒเธเธเธดเธเธเธฃเธฃเธก)', 
    source: l.source,
    score: Math.floor(Math.random() * 100), // AI Score simulation
    status: l.status,
    assignedTo: { 
      name: l.sale ? l.sale.email : 'Unassigned', 
      initials: l.sale ? l.sale.email.substring(0,2).toUpperCase() : 'NA', 
      color: 'bg-blue-100 text-blue-700' 
    },
    date: l.createdAt.toISOString(),
    lastActive: l.updatedAt.toLocaleString('th-TH')
  }));

  return <LeadListClient initialLeads={formattedLeads} />;
}

