export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="bg-orange-600 text-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tight">Jongtour Business Portal</div>
          <nav className="hidden md:flex gap-6 text-sm font-medium">
            <a href="/dashboard" className="hover:text-orange-100 transition-colors">Dashboard</a>
            <a href="/customers" className="hover:text-orange-100 transition-colors">My Clients</a>
            <a href="/sales/quotations" className="hover:text-orange-100 transition-colors">Quotes</a>
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
