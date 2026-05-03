import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as line from '@line/bot-sdk';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qterfftaebnoawnzkfgu.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_SRwNSJ89mInda5FcuB1W2w_9IEJlSOI";
const supabase = createClient(supabaseUrl, supabaseKey);

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
};
const lineClient = new line.messagingApi.MessagingApiClient(lineConfig);

export async function GET(request: Request) {
  // 1. Authorization check for Cron
  // Vercel sends a CRON secret header
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { prisma } = await import('@/lib/prisma');

    // 2. Find "Fire Sale" tours
    const cheapToursData = await prisma.tour.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        departures: {
          where: { startDate: { gte: new Date() } },
          include: { prices: true }
        },
        destinations: true,
        images: { take: 1 }
      },
      take: 20
    });

    const cheapToursRaw = cheapToursData.map((t: any) => ({
      id: t.id,
      title: t.tourName,
      code: t.tourCode,
      price: t.departures.length > 0 ? Math.min(...t.departures.map((d: any) => d.prices?.[0]?.sellingPrice || 0)) : 0,
      destination: t.destinations?.[0]?.country || 'ไม่ระบุ',
      imageUrl: t.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80',
    }));

    const cheapTours = cheapToursRaw.filter(t => t.price > 0 && t.price < 20000).sort((a, b) => a.price - b.price).slice(0, 5);

    if (!cheapTours || cheapTours.length === 0) {
      return NextResponse.json({ message: 'No fire sale tours found' });
    }

    // 3. Get User Profiles that have preferences
    const profiles = await prisma.userProfile.findMany({
      where: {
        preferences: { not: {} }
      }
    });

    let messagesSent = 0;

    // 4. Match profiles with tours
    for (const profile of profiles) {
      const prefs: any = profile.preferences;
      if (!prefs || !profile.userId.startsWith('U')) continue; // Skip if not a valid LINE user ID

      // Check if any cheap tour matches their favorite destination
      let matchedTour = null;
      if (prefs.favorite_destination) {
        matchedTour = cheapTours.find(t => 
          t.destination.toLowerCase().includes(prefs.favorite_destination.toLowerCase()) || 
          t.title.toLowerCase().includes(prefs.favorite_destination.toLowerCase())
        );
      } else if (prefs.budget) {
         // If no dest, but budget matches
         const budget = parseInt(prefs.budget);
         matchedTour = cheapTours.find(t => t.price <= budget);
      }

      if (matchedTour) {
        // Send a proactive push message
        try {
          await lineClient.pushMessage({
            to: profile.userId,
            messages: [
              {
                type: 'text',
                text: `🔥 โปรไฟไหม้มาแล้วครับพี่! ทัวร์ ${matchedTour.destination} ที่พี่เคยดูไว้ ตอนนี้ราคาลงมาเหลือแค่ ${matchedTour.price.toLocaleString()} บาท!! รีบจองก่อนเต็มนะครับ สนใจพิมพ์ 'สนใจ' หรือ 'จอง' ได้เลยครับ 👇`
              },
              {
                type: 'flex',
                altText: `โปรไฟไหม้ ${matchedTour.title}`,
                contents: {
                  type: 'bubble',
                  hero: {
                    type: 'image',
                    url: matchedTour.imageUrl || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80',
                    size: 'full',
                    aspectRatio: '20:13',
                    aspectMode: 'cover'
                  },
                  body: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                      { type: 'text', text: matchedTour.title, weight: 'bold', size: 'md', wrap: true },
                      { type: 'text', text: `ราคา: ${matchedTour.price.toLocaleString()} บาท`, size: 'lg', color: '#ff3344', weight: 'bold' }
                    ]
                  },
                  footer: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                      {
                        type: 'button',
                        style: 'primary',
                        color: '#ff3344',
                        action: { type: 'uri', label: 'ดูรายละเอียด', uri: `https://jongtour.com/tours/${matchedTour.code}` }
                      }
                    ]
                  }
                }
              }
            ]
          });
          messagesSent++;
        } catch (e) {
          console.error(`Failed to push message to ${profile.userId}:`, e);
        }
      }
    }

    return NextResponse.json({ success: true, messagesSent });
  } catch (err: any) {
    console.error('Proactive Alert Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
