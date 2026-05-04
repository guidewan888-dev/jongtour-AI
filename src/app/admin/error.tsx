"use client";

import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui-new/Button";
import Link from "next/link";
import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Admin Boundary Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="w-10 h-10 text-destructive" />
      </div>
      <h2 className="text-2xl font-black text-trust-900 mb-2">เกิดข้อผิดพลาดในระบบ</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        ขออภัย เกิดข้อผิดพลาดในการโหลดข้อมูลหน้านี้ กรุณาลองใหม่อีกครั้ง หรือกลับไปที่หน้าหลัก
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => reset()} variant="outline" className="gap-2">
          <RefreshCcw className="w-4 h-4" /> ลองใหม่อีกครั้ง
        </Button>
        <Button asChild variant="brand" className="gap-2">
          <Link href="/admin">
            <Home className="w-4 h-4" /> กลับหน้า Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
