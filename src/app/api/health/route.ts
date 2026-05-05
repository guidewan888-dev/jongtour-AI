export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/health — System health check endpoint
 * Used by Vercel, uptime monitors, and the admin dashboard
 */
export async function GET() {
  const checks: Record<string, any> = {};
  const startTime = Date.now();

  // 1. Database connectivity
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: 'OK', latency: Date.now() - dbStart };
  } catch (err: any) {
    checks.database = { status: 'ERROR', error: err.message };
  }

  // 2. Environment variables check
  const requiredEnvs = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'DATABASE_URL',
  ];
  const optionalEnvs = [
    'OPENAI_API_KEY',
    'NEXT_PUBLIC_GTM_ID',
    'LINE_CHANNEL_ACCESS_TOKEN',
    'CRON_SECRET',
  ];

  checks.envVars = {
    required: requiredEnvs.reduce((acc, key) => ({
      ...acc,
      [key]: !!process.env[key] ? 'SET' : 'MISSING',
    }), {} as Record<string, string>),
    optional: optionalEnvs.reduce((acc, key) => ({
      ...acc,
      [key]: !!process.env[key] ? 'SET' : 'NOT_SET',
    }), {} as Record<string, string>),
  };

  // 3. Tour data check
  try {
    const tourCount = await prisma.tour.count({ where: { status: 'PUBLISHED' } });
    const departureCount = await prisma.departure.count({
      where: { startDate: { gte: new Date() }, remainingSeats: { gt: 0 } },
    });
    checks.data = { tours: tourCount, activeDepartures: departureCount, status: tourCount > 0 ? 'OK' : 'EMPTY' };
  } catch {
    checks.data = { status: 'ERROR' };
  }

  // 4. Memory usage
  const mem = process.memoryUsage();
  checks.memory = {
    heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
    heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024),
    rssMB: Math.round(mem.rss / 1024 / 1024),
  };

  // 5. Summary
  const allOk = checks.database?.status === 'OK';
  const totalLatency = Date.now() - startTime;

  return NextResponse.json({
    ok: allOk,
    status: allOk ? 'HEALTHY' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    uptime: process.uptime(),
    latency: totalLatency,
    checks,
  }, {
    status: allOk ? 200 : 503,
    headers: { 'Cache-Control': 'no-store' },
  });
}
