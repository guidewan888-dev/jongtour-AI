import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Settings, Globe, Image as ImageIcon, Palette } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function B2BSettingsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { company: true }
  });

  const company = dbUser?.company;

  if (!company) {
    return <div>No company found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-500" />
          Settings
        </h2>
        <p className="text-sm text-slate-500 mt-1">ตั้งค่าแบรนด์และ White-label Subdomain สำหรับลูกค้าของคุณ</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
          <h3 className="font-semibold text-slate-800">White-label Portal Configuration</h3>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Subdomain */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-400" />
              Subdomain (ชื่อเว็บไซต์ของคุณ)
            </label>
            <div className="flex mt-1">
              <input
                type="text"
                defaultValue={company.subdomain || ''}
                className="flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 border focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2"
                placeholder="youragency"
              />
              <span className="inline-flex items-center px-4 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                .jongtour.com
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              ชื่อนี้จะใช้เป็นลิงก์สำหรับให้ลูกค้าของคุณเข้ามาจองทัวร์ (สามารถใส่ได้เฉพาะตัวอักษรภาษาอังกฤษและตัวเลข)
            </p>
          </div>

          {/* Logo URL */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-slate-400" />
              Logo URL
            </label>
            <input
              type="url"
              defaultValue={company.logoUrl || ''}
              className="mt-1 block w-full rounded-md sm:text-sm border-gray-300 border focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2"
              placeholder="https://example.com/logo.png"
            />
            {company.logoUrl && (
              <div className="mt-3 p-4 border border-slate-100 rounded-lg bg-slate-50 inline-block">
                <img src={company.logoUrl} alt="Preview" className="h-12 object-contain" />
              </div>
            )}
          </div>

          {/* Theme Color */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
              <Palette className="w-4 h-4 text-slate-400" />
              Theme Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                defaultValue={company.themeColor || '#ea580c'}
                className="h-10 w-20 rounded border border-gray-300 p-1 cursor-pointer"
              />
              <span className="text-sm text-slate-500 font-mono">
                {company.themeColor || '#ea580c'}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              สีหลักที่จะแสดงบนหน้าเว็บ White-label ของคุณ (เช่น สีปุ่มกด, สีพื้นหลังส่วนหัว)
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors shadow-sm disabled:opacity-50">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
