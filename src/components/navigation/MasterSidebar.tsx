import React from 'react';
import { adminMenu } from '@/config/adminMenu';

export default function MasterSidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 min-h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 font-bold text-xl border-b border-slate-800">
        <span className="text-orange-500">Jongtour</span> <span className="ml-2 font-light text-white">Admin</span>
      </div>
      <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
        {adminMenu.map((item, idx) => (
          <div key={idx} className="mb-2">
            <a 
              href={item.href} 
              className="flex items-center px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors group"
            >
              <span className="font-medium">{item.label}</span>
              {item.status === 'COMING_SOON' && <span className="ml-auto text-[10px] bg-slate-700 px-1.5 py-0.5 rounded">Soon</span>}
              {item.badge && <span className="ml-auto text-[10px] bg-orange-600 text-white px-1.5 py-0.5 rounded">{item.badge}</span>}
            </a>
            {item.children && (
              <div className="ml-4 pl-3 border-l border-slate-700 mt-1 space-y-1">
                {item.children.map((child, cIdx) => (
                  <a 
                    key={cIdx} 
                    href={child.href} 
                    className="block px-3 py-1.5 text-sm rounded-md hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    {child.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
