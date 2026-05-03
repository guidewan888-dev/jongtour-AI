import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
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

  const { data: dbUser } = await supabase
    .from('users')
    .select('*, agent:agents(*)')
    .eq('email', user.email || '')
    .single();

  const company = dbUser?.agent;

  if (!company) {
    return <div>No company found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-2xl font-bold tracking-tight text-gray-800 flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-500" />
          Settings
        </h2>
        <p className="text-sm text-gray-500 mt-1">ตั้งค่าแบรนด์และ White-label Subdomain สำหรับลูกค้าของคุณ</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-gray-800">White-label Portal Configuration</h3>
        </div>
        
        <div className="p-8 space-y-8">
          {/* Subdomain */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-500" />
              Subdomain (ชื่อเว็บไซต์ของคุณ)
            </label>
            <div className="flex mt-1">
              <input
                type="text"
                defaultValue={company.subdomain || ''}
                className="flex-1 block w-full rounded-none rounded-l-xl font-medium sm:text-sm border-gray-200 border focus:ring-blue-500 focus:border-blue-500 px-4 py-3 outline-none transition-all"
                placeholder="youragency"
              />
              <span className="inline-flex items-center px-4 rounded-r-xl border border-l-0 border-gray-200 bg-gray-50 text-gray-500 sm:text-sm font-bold">
                .jongtour.com
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-500 font-medium">
              ชื่อนี้จะใช้เป็นลิงก์สำหรับให้ลูกค้าของคุณเข้ามาจองทัวร์ (สามารถใส่ได้เฉพาะตัวอักษรภาษาอังกฤษและตัวเลข)
            </p>
          </div>

          {/* Logo URL */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-blue-500" />
              Logo URL
            </label>
            <input
              type="url"
              defaultValue={company.logoUrl || ''}
              className="mt-1 block w-full rounded-xl font-medium sm:text-sm border-gray-200 border focus:ring-blue-500 focus:border-blue-500 px-4 py-3 outline-none transition-all"
              placeholder="https://example.com/logo.png"
            />
            {company.logoUrl && (
              <div className="mt-4 p-4 border border-gray-100 rounded-xl bg-gray-50 inline-block shadow-sm">
                <img src={company.logoUrl} alt="Preview" className="h-12 object-contain" />
              </div>
            )}
          </div>

          {/* Theme Color */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Palette className="w-4 h-4 text-blue-500" />
              Theme Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                defaultValue={company.themeColor || '#ea580c'}
                className="h-12 w-24 rounded-xl border border-gray-200 p-1 cursor-pointer bg-white"
              />
              <span className="text-sm text-gray-600 font-mono font-bold bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                {company.themeColor || '#ea580c'}
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-500 font-medium">
              สีหลักที่จะแสดงบนหน้าเว็บ White-label ของคุณ (เช่น สีปุ่มกด, สีพื้นหลังส่วนหัว)
            </p>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <button className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-slate-900/20 disabled:opacity-50">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
