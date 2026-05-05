import React from 'react'
import Link from 'next/link'

interface CustomerEmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  icon?: React.ReactNode
}

export function CustomerEmptyState({ title, description, actionLabel, actionHref, icon }: CustomerEmptyStateProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 flex flex-col items-center justify-center text-center shadow-sm">
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-5 text-slate-300">
        {icon || (
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        )}
      </div>
      <h3 className="text-lg font-black text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      
      {actionLabel && actionHref && (
        <Link 
          href={actionHref}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-sm transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
