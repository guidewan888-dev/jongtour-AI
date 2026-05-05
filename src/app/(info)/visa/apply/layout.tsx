import { Suspense } from "react";

export default function VisaApplyLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="py-20 text-center text-slate-400">กำลังโหลด...</div>}>{children}</Suspense>;
}
