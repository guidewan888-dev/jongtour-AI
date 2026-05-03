import { createClient } from "@supabase/supabase-js";
import { Users, Search, Edit2, Shield, Percent, DollarSign, Plus } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

export default async function AdminAgentsPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  // ดึงข้อมูล Agent ทั้งหมดตรงจาก DB
  const { data: agents, error } = await supabase
    .from("agents")
    .select("*")
    .order("createdAt", { ascending: false });

  async function updateAgentTier(formData: FormData) {
    "use server";
    const supabaseServer = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );
    
    const id = formData.get("id") as string;
    const tier = formData.get("tier") as string;
    const discountRate = parseFloat(formData.get("discountRate") as string);
    const creditLimit = parseFloat(formData.get("creditLimit") as string);

    await supabaseServer
      .from("agents")
      .update({ tier, discountRate, creditLimit })
      .eq("id", id);
      
    revalidatePath("/admin/agents");
  }

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "GOLD": return <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md text-xs font-bold border border-amber-200">GOLD</span>;
      case "SILVER": return <span className="bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md text-xs font-bold border border-slate-300">SILVER</span>;
      case "BRONZE": return <span className="bg-orange-100 text-orange-700 px-2.5 py-1 rounded-md text-xs font-bold border border-orange-200">BRONZE</span>;
      default: return <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-bold border border-gray-200">STANDARD</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">ตัวแทนจำหน่าย (B2B Agents)</h2>
          <p className="text-gray-500">ตั้งค่า Tier, ส่วนลด และเครดิตสำหรับตัวแทน B2B</p>
        </div>
        <button className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 shadow-lg shadow-gray-900/20 inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> เพิ่มเอเจนซี่
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="ค้นหาชื่อบริษัท, อีเมล..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
                <th className="p-4 font-bold">บริษัท / ติดต่อ</th>
                <th className="p-4 font-bold">Tier</th>
                <th className="p-4 font-bold">ส่วนลด (%)</th>
                <th className="p-4 font-bold">วงเงิน (Credit)</th>
                <th className="p-4 font-bold">ยอดค้างชำระ</th>
                <th className="p-4 font-bold">สถานะ</th>
                <th className="p-4 font-bold text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {!agents || agents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    ไม่พบข้อมูลตัวแทนจำหน่ายในระบบ
                  </td>
                </tr>
              ) : agents.map((agent: any) => (
                <tr key={agent.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-gray-800">{agent.companyName}</p>
                    <p className="text-xs text-gray-500">{agent.contactName} • {agent.email}</p>
                  </td>
                  <td className="p-4">
                    {getTierBadge(agent.tier || "STANDARD")}
                  </td>
                  <td className="p-4 font-medium text-gray-700">
                    {agent.discountRate || 0}%
                  </td>
                  <td className="p-4 font-medium text-gray-700">
                    ฿{agent.creditLimit?.toLocaleString() || 0}
                  </td>
                  <td className="p-4 font-medium text-red-600">
                    ฿{agent.balance?.toLocaleString() || 0}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${agent.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {agent.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <form action={updateAgentTier} className="inline-flex items-center gap-2">
                      <input type="hidden" name="id" value={agent.id} />
                      
                      <select name="tier" defaultValue={agent.tier || "STANDARD"} className="text-xs border rounded p-1">
                        <option value="STANDARD">Standard (0%)</option>
                        <option value="BRONZE">Bronze (5%)</option>
                        <option value="SILVER">Silver (10%)</option>
                        <option value="GOLD">Gold (15%)</option>
                      </select>
                      
                      <input type="hidden" name="discountRate" value={
                        agent.tier === 'GOLD' ? 15 : agent.tier === 'SILVER' ? 10 : agent.tier === 'BRONZE' ? 5 : 0
                      } />
                      
                      <input type="number" name="creditLimit" defaultValue={agent.creditLimit || 0} className="w-24 text-xs border rounded p-1" placeholder="Credit Limit" />
                      
                      <button type="submit" className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded transition-colors" title="อัปเดต">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
