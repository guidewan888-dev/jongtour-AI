'use client'

import React from 'react'
import Link from 'next/link'

export default function CustomerCompareToursPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Compare Tours</h1>
          <p className="text-slate-500 text-sm mt-1">Compare up to 3 tours side-by-side to find your perfect trip.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-orange-50 text-orange-400 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
        </div>
        <h2 className="text-xl font-black text-slate-800 mb-2">No tours selected for comparison</h2>
        <p className="text-slate-500 font-medium mb-8 max-w-md">
          Browse our tours and click the "Compare" button to add them here. You can compare prices, itineraries, and inclusions side-by-side.
        </p>
        <Link href="/tours" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold shadow-sm transition-colors flex items-center gap-2">
          Browse Tours
        </Link>
      </div>
    </div>
  )
}
