import { prisma } from "@/lib/prisma";
import RpaClient from "./RpaClient";

export const dynamic = "force-dynamic";

export default async function RpaDashboardPage() {
  const sessions = await prisma.wholesaleRpaSession.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      booking: true,
      supplier: true,
    },
    take: 50
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">RPA Bot Dashboard</h1>
      <p className="text-gray-500 mb-8">Manage and approve automated bookings that the AI has submitted to wholesale systems.</p>
      
      <RpaClient initialSessions={sessions} />
    </div>
  );
}
