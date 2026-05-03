import { TourDetailsContent } from "@/app/tour/[id]/page";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function AgentTourDetailsPage({ params }: { params: { subdomain: string, id: string } }) {
  const { subdomain, id } = params;

  // Verify the agent exists
  const agentCompany = await prisma.agent.findUnique({
    where: { subdomain }
  });

  if (!agentCompany || agentCompany.status !== 'ACTIVE') {
    notFound();
  }

  try {
    return await TourDetailsContent({ params: { id }, agentId: agentCompany.id });
  } catch (error: any) {
    if (error?.message === 'NEXT_NOT_FOUND') { throw error; }
    return (
      <main className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-100 max-w-2xl w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">ขออภัย เกิดข้อผิดพลาดของระบบ (500)</h1>
          <p className="text-gray-700 mb-4">ไม่สามารถโหลดข้อมูลทัวร์ได้ กรุณาลองใหม่อีกครั้ง</p>
          <div className="bg-red-50 p-4 rounded-lg text-left overflow-x-auto text-xs text-red-800 font-mono mb-6 whitespace-pre-wrap break-all">
            <strong>Error:</strong> {error?.message || "Unknown Server Error"}
          </div>
          <Link href={`/agent/${subdomain}`} className="inline-block bg-orange-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-700">
            กลับหน้าหลัก
          </Link>
        </div>
      </main>
    );
  }
}
