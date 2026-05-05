import MasterLayout from '@/components/layout/MasterLayout';

export default function AdminRouteLayout({ children }: { children: React.ReactNode }) {
  return <MasterLayout variant="admin">{children}</MasterLayout>;
}
