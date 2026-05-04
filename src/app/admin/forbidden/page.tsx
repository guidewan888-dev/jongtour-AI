import { ShieldAlert, Home } from "lucide-react";
import { Button } from "@/components/ui-new/Button";
import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm">
        <ShieldAlert className="w-12 h-12 text-amber-600" />
      </div>
      <h2 className="text-3xl font-black text-trust-900 mb-2">403 - ไม่มีสิทธิ์เข้าถึง</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        ขออภัย บัญชีของคุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้ กรุณาติดต่อ Super Admin หากคุณต้องการสิทธิ์เพิ่มเติม
      </p>
      
      <Button asChild variant="brand" className="gap-2">
        <Link href="/admin">
          <Home className="w-4 h-4" /> กลับหน้า Dashboard
        </Link>
      </Button>
    </div>
  );
}
