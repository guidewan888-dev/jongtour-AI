export const dynamic = 'force-dynamic';
import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import FavoritesClient from './FavoritesClient'

export default async function CustomerFavoritesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const customer = await prisma.customer.findFirst({
    where: { email: user.email },
    include: {
      favorites: {
        include: {
          tour: {
            include: {
              images: { take: 1 }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!customer) redirect('/login')

  const favorites = customer.favorites.map(f => ({
    id: f.id,
    tourId: f.tourId,
    code: f.tour.tourCode,
    title: f.tour.tourName,
    imageUrl: f.tour.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800',
    price: f.tour.durationDays || 0,
    destination: f.tour.slug || 'Worldwide',
    durationDays: f.tour.durationDays,
    durationNights: f.tour.durationNights
  }))

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <svg className="w-6 h-6 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
            เธ—เธฑเธงเธฃเนเธ—เธตเนเธเธฑเธเธ—เธถเธเนเธงเน (Favorites)
          </h1>
          <p className="text-slate-500 text-sm mt-1">เนเธเนเธเน€เธเธเธ—เธฑเธงเธฃเนเธ—เธตเนเธเธธเธ“เธชเธเนเธเนเธฅเธฐเธเธฑเธเธ—เธถเธเนเธงเนเน€เธเธฃเธตเธขเธเน€เธ—เธตเธขเธ</p>
        </div>
      </div>

      <FavoritesClient favorites={favorites} />

    </div>
  )
}

