import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { BadgeDollarSign, Shield, Award, Crown, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CommissionPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: dbUser } = await supabase
    .from('users')
    .select('*, agent:agents(*)')
    .eq('email', user.email || '')
    .single();

  if (!dbUser?.agent) redirect('/b2b');
  const agent = dbUser.agent;

  const tiers = [
    { name: 'STANDARD', rate: '0-5%', icon: <Shield className="w-8 h-8 text-gray-400" />, desc: 'สมาชิกระดับเริ่มต้น' },
    { name: 'BRONZE', rate: '5-7%', icon: <Award className="w-8 h-8 text-amber-600" />, desc: 'ยอดขาย 500,000 บาท/ปี' },
    { name: 'SILVER', rate: '7-10%', icon: <Award className="w-8 h-8 text-gray-300" />, desc: 'ยอดขาย 2,000,000 บาท/ปี' },
    { name: 'GOLD', rate: '10-15%', icon: <Crown className="w-8 h-8 text-yellow-500" />, desc: 'ยอดขาย 5,000,000 บาท/ปีขึ้นไป' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="mb-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-2xl font-bold tracking-tight text-gray-800">โครงสร้างส่วนลด (Commission Rates)</h2>
        <p className="text-sm text-gray-500 mt-1">ข้อมูลส่วนลดและผลตอบแทนตามระดับสมาชิกภาพของคุณ</p>
      </div>

      <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-indigo-200 font-bold uppercase tracking-wider text-xs mb-2">ระดับสมาชิกปัจจุบันของคุณ</p>
            <div className="flex items-center gap-4">
              <h3 className="text-5xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400">
                {agent.tier || "STANDARD"} PARTNER
              </h3>
            </div>
            <p className="mt-5 text-slate-300 max-w-md text-sm leading-relaxed font-medium">
              สิทธิพิเศษสำหรับคุณ! คุณได้รับส่วนลด <span className="font-bold text-white bg-white/20 px-2 py-1 rounded-md mx-1 shadow-sm border border-white/20">{agent.discountRate || 0}%</span> ทุกการจอง 
              ราคา Net Price จะถูกคำนวณอัตโนมัติในหน้าค้นหาทัวร์
            </p>
          </div>
          <div className="w-36 h-36 bg-white/10 rounded-full flex items-center justify-center border border-white/20 backdrop-blur-sm shrink-0 shadow-lg shadow-black/20">
            <div className="text-center">
              <p className="text-[10px] text-indigo-200 mb-1 font-bold uppercase tracking-widest">ส่วนลด</p>
              <p className="text-4xl font-black">{agent.discountRate || 0}%</p>
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-800 mt-12 mb-6">ตารางระดับสมาชิก (Agent Tiers)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiers.map(t => {
          const isCurrent = (agent.tier || "STANDARD") === t.name;
          return (
            <div key={t.name} className={`bg-white rounded-2xl p-6 border-2 transition-all relative group ${isCurrent ? 'border-blue-500 shadow-lg shadow-blue-500/20 scale-105 z-10' : 'border-gray-100 hover:border-blue-200 hover:shadow-md'}`}>
              {isCurrent && (
                <div className="absolute -top-3 -right-3 bg-blue-500 text-white rounded-full p-1.5 shadow-md">
                  <CheckCircle2 size={20} />
                </div>
              )}
              <div className="flex justify-center mb-5 transform group-hover:scale-110 transition-transform duration-300">{t.icon}</div>
              <h4 className="text-center font-black text-gray-800 mb-1 text-lg">{t.name}</h4>
              <p className="text-center text-xs text-gray-500 mb-5 font-medium h-8">{t.desc}</p>
              <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                <p className="text-[10px] text-gray-400 mb-1 font-bold uppercase tracking-wider">ส่วนลดโดยประมาณ</p>
                <p className="font-black text-blue-600 text-xl">{t.rate}</p>
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 mt-8 text-sm text-gray-600">
        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
           <BadgeDollarSign className="text-blue-500" size={18} /> เงื่อนไขการปรับระดับ
        </h4>
        <ul className="list-disc pl-6 space-y-2 font-medium">
          <li>ยอดขายจะถูกคำนวณสะสมเป็นรายปีปฏิทิน</li>
          <li>การปรับระดับจะทำอัตโนมัติในทุกๆ ไตรมาส</li>
          <li>ส่วนลดอาจมีการเปลี่ยนแปลงขึ้นอยู่กับโปรโมชั่นของแต่ละแพ็กเกจทัวร์ โปรดอ้างอิง Net Price ในหน้ารายละเอียดทัวร์เป็นหลัก</li>
        </ul>
      </div>
    </div>
  );
}
