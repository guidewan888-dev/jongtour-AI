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
  const agentCompany = await prisma.company.findUnique({
    where: { subdomain },
    include: { users: { take: 1 } } // Get primary user for contact info
  });

  if (!agentCompany || agentCompany.type !== 'AGENT') {
    notFound();
  }

  const primaryContact = agentCompany.users[0];
  const themeColor = agentCompany.themeColor || "#ea580c"; // Default orange-600

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans" style={{ '--theme-color': themeColor } as React.CSSProperties}>
      
      {/* Top Header - Agent Branding */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo & Name */}
            <Link href={`/agent/${subdomain}`} className="flex items-center gap-3">
              {agentCompany.logoUrl ? (
                <img src={agentCompany.logoUrl} alt={agentCompany.name} className="h-10 object-contain" />
              ) : (
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                  style={{ backgroundColor: 'var(--theme-color)' }}
                >
                  {agentCompany.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="font-bold text-lg text-gray-800 hidden sm:block">{agentCompany.name}</span>
            </Link>

            {/* Contact Info (Desktop) */}
            {primaryContact && (
              <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
                {primaryContact.phone && (
                  <a href={`tel:${primaryContact.phone}`} className="flex items-center gap-2 hover:text-gray-900">
                    <Phone className="w-4 h-4" /> {primaryContact.phone}
                  </a>
                )}
                {primaryContact.email && (
                  <a href={`mailto:${primaryContact.email}`} className="flex items-center gap-2 hover:text-gray-900">
                    <Mail className="w-4 h-4" /> {primaryContact.email}
                  </a>
                )}
              </div>
            )}
            
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button className="text-gray-500 hover:text-gray-900 p-2">
                <Map className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 text-center text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} {agentCompany.name}. All rights reserved.</p>
          <p className="mt-4 md:mt-0 opacity-50 flex items-center gap-1">
            Powered by <Link href="https://jongtour.com" className="hover:text-white font-semibold">Jongtour B2B Network</Link>
          </p>
        </div>
      </footer>

    </div>
  );
}
