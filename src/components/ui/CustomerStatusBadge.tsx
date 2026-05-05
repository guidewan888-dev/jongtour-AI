import React from 'react'

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral'

interface CustomerStatusBadgeProps {
  status: string
  variant?: BadgeVariant
  className?: string
}

export function CustomerStatusBadge({ status, variant, className = '' }: CustomerStatusBadgeProps) {
  
  // Auto-detect variant based on common status strings if not explicitly provided
  let activeVariant = variant || 'neutral'
  if (!variant) {
    const s = status.toLowerCase()
    if (s.includes('confirm') || s.includes('paid') || s.includes('success') || s.includes('active') || s.includes('issued')) {
      activeVariant = 'success'
    } else if (s.includes('pending') || s.includes('waiting') || s.includes('review')) {
      activeVariant = 'warning'
    } else if (s.includes('cancel') || s.includes('reject') || s.includes('fail') || s.includes('error')) {
      activeVariant = 'error'
    } else if (s.includes('process') || s.includes('progress')) {
      activeVariant = 'info'
    }
  }

  const styles = {
    success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    warning: 'bg-orange-50 text-orange-600 border-orange-100',
    error: 'bg-red-50 text-red-600 border-red-100',
    info: 'bg-blue-50 text-blue-600 border-blue-100',
    neutral: 'bg-slate-50 text-slate-600 border-slate-200'
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles[activeVariant]} ${className}`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}
