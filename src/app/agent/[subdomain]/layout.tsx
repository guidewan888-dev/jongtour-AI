import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Map, Phone, Mail } from "lucide-react";

export default async function AgentWhiteLabelLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { subdomain: string };
}) {
  const { subdomain } = params;

  // Fetch the agent's company by subdomain
  const agentCompany = await prisma.agent.findUnique({
    where: { subdomain },
    include: { users: { take: 1 } } // Get primary user for contact info
  });

  if (!agentCompany || agentCompany.status !== 'ACTIVE') {
    notFound();
  }

  const primaryContact = agentCompany.users[0];
  const themeColor = agentCompany.themeColor || "#ea580c"; // Default orange-600

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans" style={{ '--theme-color': themeColor } as React.CSSProperties}>
      


      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 text-center text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} {agentCompany.companyName}. All rights reserved.</p>
          <p className="mt-4 md:mt-0 opacity-50 flex items-center gap-1">
            Powered by <Link href="https://jongtour.com" className="hover:text-white font-semibold">Jongtour B2B Network</Link>
          </p>
        </div>
      </footer>

    </div>
  );
}
