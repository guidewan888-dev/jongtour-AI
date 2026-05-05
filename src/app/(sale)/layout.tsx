import MasterLayout from '@/components/layout/MasterLayout';

export default function SaleRouteLayout({ children }: { children: React.ReactNode }) {
  return <MasterLayout variant="business">{children}</MasterLayout>;
}
