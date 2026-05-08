// Public auth pages (login, register) — standalone layout without header/footer
// These pages have their own back-to-home links built in

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <main className="flex-1">{children}</main>
    </div>
  );
}
