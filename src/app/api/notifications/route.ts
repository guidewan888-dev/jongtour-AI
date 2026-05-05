import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/notifications?customerId=xxx — Get customer notifications
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');
    if (!customerId) return NextResponse.json({ error: 'customerId required' }, { status: 400 });

    const notifications = await prisma.notification.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { customerId, isRead: false },
    });

    return NextResponse.json({ success: true, data: { notifications, unreadCount } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/notifications — Mark as read
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { notificationId, action } = body;

    if (action === 'mark_read' && notificationId) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true, readAt: new Date() },
      });
    } else if (action === 'mark_all_read' && body.customerId) {
      await prisma.notification.updateMany({
        where: { customerId: body.customerId, isRead: false },
        data: { isRead: true, readAt: new Date() },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
