import { Search, Plus, Filter, MoreVertical, Building2, Mail, Phone, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AgentManagementPage() {
  // Mock data for B2B Agents
  const agents = [
    { id: '1', name: 'Global Travel Co.', type: 'B2B Partner', contactName: 'Somchai Jaidee', email: 'contact@globaltravel.co.th', phone: '02-123-4567', creditLimit: 500000, balance: 125000, status: 'Active' },
    { id: '2', name: 'Siam Holiday', type: 'B2B Partner', contactName: 'Nida Sukjai', email: 'booking@siamholiday.com', phone: '081-999-8888', creditLimit: 200000, balance: 45000, status: 'Active' },
    { id: '3', name: 'Traveloka Partner', type: 'OTA', contactName: 'API Integration', email: 'partner@traveloka.com', phone: '-', creditLimit: 1000000, balance: 850000, status: 'Pending Review' },
    { id: '4', name: 'Wanderlust TH', type: 'Freelance Agent', contactName: 'Pipat S.', email: 'pipat.s@gmail.com', phone: '089-123-4567', creditLimit: 50000, balance: 0, status: 'Active' },
    { id: '5', name: 'Chiang Mai Tours', type: 'B2B Partner', contactName: 'Lanna Travel', email: 'info@cm-tours.net', phone: '053-111-222', creditLimit: 100000, balance: 100000, status: 'Suspended' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Agent Management</h2>
          <p className="text-sm text-slate-500">Manage B2B partners, credit limits, and commissions.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
          <Plus size={16} />
          Add Agent
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Building2 size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Active Agents</p>
            <p className="text-2xl font-bold text-slate-900">84</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Pending Approvals</p>
            <p className="text-2xl font-bold text-slate-900">3</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <span className="font-bold text-xl">฿</span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Credit Utilized</p>
            <p className="text-2xl font-bold text-slate-900">1.2M</p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search agents by company name, email, or contact..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Filter size={16} />
            Filters
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Company Details</th>
                <th className="px-6 py-3">Contact Person</th>
                <th className="px-6 py-3">Credit Limit</th>
                <th className="px-6 py-3">Utilized Balance</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{agent.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{agent.type}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-700 font-medium">{agent.contactName}</p>
                    <div className="flex flex-col gap-1 mt-1">
                      <span className="text-xs text-slate-500 flex items-center gap-1"><Mail size={12}/> {agent.email}</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1"><Phone size={12}/> {agent.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">
                    ฿{agent.creditLimit.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`font-semibold ${agent.balance >= agent.creditLimit ? 'text-red-600' : 'text-slate-900'}`}>
                        ฿{agent.balance.toLocaleString()}
                      </span>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 max-w-[120px]">
                        <div 
                          className={`h-1.5 rounded-full ${agent.balance >= agent.creditLimit ? 'bg-red-500' : 'bg-indigo-500'}`}
                          style={{ width: `${Math.min(100, (agent.balance / agent.creditLimit) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium 
                      ${agent.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 
                        agent.status === 'Pending Review' ? 'bg-amber-100 text-amber-700' : 
                        'bg-red-100 text-red-700'}`}>
                      {agent.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-indigo-600">
                      <MoreVertical size={16} />
                    </button>
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
