import { Key, ShieldCheck, AlertCircle, Save } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function CredentialsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 mb-1">API Credentials</h1>
          <p className="text-slate-500 text-xs font-mono">จัดการ API Key และ Endpoint ของ Wholesale Suppliers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Let'go Group Configuration */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-6">
          <div className="flex justify-between items-start mb-6 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Let's Go Group</h2>
              <p className="text-emerald-400 text-xs font-mono">ID: 5f8a9b21-4c1d-48e2-9b0d-1c2a3f4e5d6b</p>
            </div>
            <span className="flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded text-[10px] font-bold tracking-wider">
              <ShieldCheck size={12}/> CONNECTED
            </span>
          </div>

          <form className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">API Endpoint URL</label>
              <input 
                type="text" 
                defaultValue="https://api.letgogroup.com/v2"
                className="w-full bg-black border border-slate-800 rounded p-2.5 text-sm text-slate-300 font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">API Key / Bearer Token</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                <input 
                  type="password" 
                  defaultValue="sk_live_1234567890abcdef"
                  className="w-full bg-black border border-slate-800 rounded p-2.5 pl-9 text-sm text-slate-300 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Webhook Secret (Optional)</label>
              <input 
                type="password" 
                placeholder="whsec_..."
                className="w-full bg-black border border-slate-800 rounded p-2.5 text-sm text-slate-300 font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
            
            <div className="pt-4 flex justify-end">
              <button type="button" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded flex items-center gap-2 transition-colors">
                <Save size={14} /> Save Configuration
              </button>
            </div>
          </form>
        </div>

        {/* Go365 Configuration */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-6">
          <div className="flex justify-between items-start mb-6 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Go 365 Tours</h2>
              <p className="text-slate-500 text-xs font-mono">ID: 8a1c4d92-2b3f-4e5a-8d7c-6b5a4f3e2d1c</p>
            </div>
            <span className="flex items-center gap-1 text-rose-400 bg-rose-400/10 px-2 py-1 rounded text-[10px] font-bold tracking-wider">
              <AlertCircle size={12}/> KEY EXPIRED
            </span>
          </div>

          <form className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">API Endpoint URL</label>
              <input 
                type="text" 
                defaultValue="https://b2b.go365tours.com/api/v1"
                className="w-full bg-black border border-slate-800 rounded p-2.5 text-sm text-slate-300 font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">API Key / Bearer Token</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                <input 
                  type="password" 
                  defaultValue="go365_old_key_expired"
                  className="w-full bg-black border border-rose-900 rounded p-2.5 pl-9 text-sm text-rose-300 font-mono focus:border-rose-500 focus:outline-none"
                />
              </div>
              <p className="text-rose-500 text-[10px] mt-1 font-mono">API Request returned 401 Unauthorized at 2026-05-04 01:15:00</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Client Secret</label>
              <input 
                type="password" 
                defaultValue="secret_abc123"
                className="w-full bg-black border border-slate-800 rounded p-2.5 text-sm text-slate-300 font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
            
            <div className="pt-4 flex justify-end gap-3">
              <button type="button" className="border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-bold px-4 py-2 rounded flex items-center gap-2 transition-colors">
                Test Connection
              </button>
              <button type="button" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded flex items-center gap-2 transition-colors">
                <Save size={14} /> Update Key
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
