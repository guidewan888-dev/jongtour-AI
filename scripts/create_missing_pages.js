const fs = require('fs');
const path = require('path');

const missingRoutes = [
  "src/app/info/(b2c)/about/page.tsx",
  "src/app/info/(b2c)/faq/page.tsx",
  "src/app/info/(b2c)/travel-guide/page.tsx",
  "src/app/info/(b2c)/promotions/page.tsx",
  "src/app/info/(b2c)/destination-guide/page.tsx",
  "src/app/info/admin/blog/page.tsx",
  "src/app/info/admin/banners/page.tsx",
  "src/app/info/admin/faq/page.tsx",
  "src/app/sale/tasks/page.tsx",
  "src/app/sale/follow-ups/page.tsx",
  "src/app/sale/pipeline/page.tsx",
  "src/app/sale/booking-requests/page.tsx",
  "src/app/supplier/bookings/page.tsx",
  "src/app/supplier/tours/page.tsx",
  "src/app/supplier/departures/page.tsx",
  "src/app/supplier/manifest/page.tsx",
  "src/app/supplier/finance/page.tsx",
  "src/app/supplier/settings/page.tsx",
  "src/app/tour/admin/packages/page.tsx",
  "src/app/tour/admin/departures/page.tsx",
  "src/app/tour/admin/pricing/page.tsx",
  "src/app/tour/admin/fire-sale/page.tsx",
  "src/app/tour/admin/promotions/page.tsx",
  "src/app/tour/admin/tags/page.tsx",
  "src/app/tour/admin/suppliers/page.tsx",
  "src/app/tour/admin/health/page.tsx"
];

const template = `import { Construction } from 'lucide-react';

export default function ComingSoonPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-6">
        <Construction className="w-10 h-10" />
      </div>
      <h1 className="text-3xl font-black text-slate-900 mb-4">ระบบกำลังอยู่ระหว่างการพัฒนา</h1>
      <p className="text-slate-500 max-w-md">หน้านี้กำลังถูกสร้างขึ้นใน Phase ถัดไป กรุณากลับมาตรวจสอบอีกครั้งในภายหลัง</p>
    </div>
  );
}
`;

missingRoutes.forEach(routePath => {
  const fullPath = path.join(__dirname, '..', routePath);
  const dir = path.dirname(fullPath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, template);
    console.log(`Created: ${routePath}`);
  }
});
