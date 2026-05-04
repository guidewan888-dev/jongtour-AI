import { FileQuestion, Home } from "lucide-react";
import { Button } from "@/components/ui-new/Button";
import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm">
        <FileQuestion className="w-12 h-12 text-muted-foreground" />
      </div>
      <h2 className="text-3xl font-black text-trust-900 mb-2">404 - ไม่พบหน้าที่ต้องการ</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        หน้าที่คุณพยายามเข้าถึงอาจถูกลบไปแล้ว เปลี่ยนชื่อ หรือคุณอาจพิมพ์ URL ผิด
      </p>
      
      <Button asChild variant="brand" className="gap-2">
        <Link href="/admin">
          <Home className="w-4 h-4" /> กลับหน้า Dashboard
        </Link>
      </Button>
    </div>
  );
}
