import PublicHeader from "@/components/layout/PublicHeader";
import PublicFooter from "@/components/layout/PublicFooter";
import FloatingChat from "@/components/ui/FloatingChat";
import SearchClient from './SearchClient';

export const metadata = {
  title: 'ค้นหาทัวร์ | Jongtour',
  description: 'ค้นหาโปรแกรมทัวร์ต่างประเทศจากทุก Wholesale เปรียบเทียบราคา ตาราง เส้นทาง',
};

export default function TourSearchPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />
      <main className="flex-1">
        <SearchClient />
      </main>
      <PublicFooter />
      <FloatingChat />
    </div>
  );
}
