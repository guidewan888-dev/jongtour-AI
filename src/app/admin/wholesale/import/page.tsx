import { FileText, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui-new/Card";
import { Button } from "@/components/ui-new/Button";
import Link from "next/link";

export default function TourImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-trust-900 tracking-tight">Tour Import</h2>
        <p className="text-sm text-muted-foreground mt-1">นำเข้าโปรแกรมทัวร์เข้าสู่ระบบ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Manual Import
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">เพิ่มข้อมูลทัวร์ใหม่ด้วยตนเองผ่านแบบฟอร์ม</p>
            <Button asChild variant="brand" className="w-full">
              <Link href="/admin/wholesale/import/manual">ไปยังหน้า Manual Import</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              PDF Import
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">นำเข้าข้อมูลทัวร์จากไฟล์ PDF อัตโนมัติ (AI)</p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/wholesale/import/pdf">ไปยังหน้า PDF Import</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
