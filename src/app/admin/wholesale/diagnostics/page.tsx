import { createClient } from '@/utils/supabase/server';
import { PrismaClient } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui-new/Card";
import { Badge } from "@/components/ui-new/Badge";
import { Button } from "@/components/ui-new/Button";
import { AlertCircle, CheckCircle2, RefreshCw, Server, AlertTriangle, Globe, MapPin, Tag, Search, Box } from "lucide-react";
import Link from 'next/link';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function DiagnosticsPage() {
  const prisma = new PrismaClient();
  
  // 1. Supplier Sync Status
  const suppliers = await prisma.supplier.findMany({
    select: {
      id: true,
      displayName: true,
      canonicalName: true,
      status: true,
      updatedAt: true
    }
  });

  const rawDataCounts = await prisma.tourRawSource.groupBy({
    by: ['supplierId'],
    _count: { _all: true }
  });

  const tourStatusCounts = await prisma.tour.groupBy({
    by: ['supplierId', 'status'],
    _count: { _all: true }
  });

  const supplierStats = suppliers.map(sup => {
    const rawCount = rawDataCounts.find(r => r.supplierId === sup.id)?._count._all || 0;
    const published = tourStatusCounts.find(t => t.supplierId === sup.id && t.status === 'PUBLISHED')?._count._all || 0;
    const hidden = tourStatusCounts.find(t => t.supplierId === sup.id && t.status === 'HIDDEN')?._count._all || 0;
    const review = tourStatusCounts.find(t => t.supplierId === sup.id && t.status === 'NEED_REVIEW')?._count._all || 0;
    const draft = tourStatusCounts.find(t => t.supplierId === sup.id && t.status === 'DRAFT')?._count._all || 0;
    
    return {
      ...sup,
      rawCount,
      totalTours: published + hidden + review + draft,
      published,
      hidden,
      review
    };
  });

  // 2. Publishing Status Funnel
  const totalImported = await prisma.tourRawSource.count();
  const totalNormalized = await prisma.tour.count();
  const totalPublished = await prisma.tour.count({ where: { status: 'PUBLISHED' } });
  
  // Tours with future departures and valid prices
  const visibleToursResult = await prisma.tour.count({
    where: {
      status: 'PUBLISHED',
      departures: {
        some: {
          startDate: { gte: new Date() },
          status: { not: 'CANCELLED' },
          prices: { some: { sellingPrice: { gt: 0 } } }
        }
      }
    }
  });

  const totalIndexed = await prisma.tourEmbedding.count();

  // 3. Menu Mapping Status (tour_destinations)
  const getDestCount = async (keyword: string) => await prisma.tourDestination.count({
    where: { country: { contains: keyword, mode: 'insensitive' } }
  });
  
  const mapJapan = await getDestCount('japan');
  const mapChina = await getDestCount('china');
  const mapEurope = await getDestCount('europe');
  const mapTaiwan = await getDestCount('taiwan');
  const mapVietnam = await getDestCount('vietnam');
  
  // 4. Problems / Anomalies
  const missingDests = await prisma.tour.count({ where: { destinations: { none: {} } } });
  const missingDeps = await prisma.tour.count({ where: { departures: { none: {} } } });
  // Missing prices: Tour -> Departures -> Prices
  const missingPrices = await prisma.tour.count({
    where: { departures: { some: { prices: { none: {} } } } }
  });
  const notIndexed = totalPublished - totalIndexed;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Wholesale Diagnostics</h1>
          <p className="text-muted-foreground text-sm">Monitor tour publishing pipeline and system health.</p>
        </div>
        <div className="flex gap-2">
          <form action="/api/revalidate?path=/" method="GET">
            <Button variant="outline" className="gap-2 bg-background">
              <RefreshCw className="w-4 h-4" /> Clear Cache & Revalidate
            </Button>
          </form>
        </div>
      </div>

      {/* 1. Funnel Overview */}
      <div className="grid gap-4 md:grid-cols-5">
        <MetricCard title="Raw Imported" value={totalImported} icon={<Box className="w-4 h-4 text-muted-foreground" />} />
        <MetricCard title="Mapped/Normalized" value={totalNormalized} icon={<Server className="w-4 h-4 text-muted-foreground" />} />
        <MetricCard title="Published" value={totalPublished} icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />} />
        <MetricCard title="Visible on Frontend" value={visibleToursResult} icon={<Globe className="w-4 h-4 text-primary" />} />
        <MetricCard title="AI Search Indexed" value={totalIndexed} icon={<Search className="w-4 h-4 text-indigo-500" />} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 2. Supplier Sync Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Supplier Sync Status</CardTitle>
            <CardDescription>Live data directly from wholesale providers.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {supplierStats.map(sup => (
                <div key={sup.id} className="flex flex-col gap-2 p-3 bg-muted/30 rounded-lg border">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{sup.displayName}</span>
                      <Badge variant={sup.status === 'ACTIVE' ? 'success' : 'secondary'} className="text-[10px]">{sup.status}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">Updated: {new Date(sup.updatedAt).toLocaleDateString()}</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-sm mt-2">
                    <div className="bg-background p-2 rounded border">
                      <div className="font-mono font-bold">{sup.rawCount}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">Raw Data</div>
                    </div>
                    <div className="bg-background p-2 rounded border">
                      <div className="font-mono font-bold">{sup.totalTours}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">Tours</div>
                    </div>
                    <div className="bg-emerald-50 p-2 rounded border border-emerald-100">
                      <div className="font-mono font-bold text-emerald-600">{sup.published}</div>
                      <div className="text-[10px] text-emerald-600 uppercase">Published</div>
                    </div>
                    <div className="bg-orange-50 p-2 rounded border border-orange-100">
                      <div className="font-mono font-bold text-orange-600">{sup.review}</div>
                      <div className="text-[10px] text-orange-600 uppercase">Review</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* 3. Problems / Anomalies */}
          <Card className="border-red-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" /> Pipeline Anomalies
              </CardTitle>
              <CardDescription>Tours stuck in the pipeline or missing critical data.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <AnomalyItem label="Missing Destinations" count={missingDests} />
                <AnomalyItem label="Missing Departures" count={missingDeps} />
                <AnomalyItem label="Missing Prices" count={missingPrices} />
                <AnomalyItem label="Failed Indexing" count={Math.max(0, notIndexed)} />
                <AnomalyItem label="Hidden Status" count={supplierStats.reduce((a,b)=>a+b.hidden,0)} />
                <AnomalyItem label="Needs Human Review" count={supplierStats.reduce((a,b)=>a+b.review,0)} />
              </div>
            </CardContent>
          </Card>

          {/* 4. Menu Mapping Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Landing Page Mapping
              </CardTitle>
              <CardDescription>Tours successfully attached to Frontend categories.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                 <Badge variant="outline" className="px-3 py-1.5 text-sm"><span className="text-muted-foreground mr-2">Japan</span> <span className="font-mono font-bold">{mapJapan}</span></Badge>
                 <Badge variant="outline" className="px-3 py-1.5 text-sm"><span className="text-muted-foreground mr-2">China</span> <span className="font-mono font-bold">{mapChina}</span></Badge>
                 <Badge variant="outline" className="px-3 py-1.5 text-sm"><span className="text-muted-foreground mr-2">Europe</span> <span className="font-mono font-bold">{mapEurope}</span></Badge>
                 <Badge variant="outline" className="px-3 py-1.5 text-sm"><span className="text-muted-foreground mr-2">Taiwan</span> <span className="font-mono font-bold">{mapTaiwan}</span></Badge>
                 <Badge variant="outline" className="px-3 py-1.5 text-sm"><span className="text-muted-foreground mr-2">Vietnam</span> <span className="font-mono font-bold">{mapVietnam}</span></Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-black font-mono">{value}</div>
      </CardContent>
    </Card>
  );
}

function AnomalyItem({ label, count }: { label: string, count: number }) {
  return (
    <div className="flex justify-between items-center p-2 rounded-md border bg-background">
      <span className="text-sm font-medium">{label}</span>
      <Badge variant={count > 0 ? 'destructive' : 'secondary'} className="font-mono">
        {count}
      </Badge>
    </div>
  );
}
