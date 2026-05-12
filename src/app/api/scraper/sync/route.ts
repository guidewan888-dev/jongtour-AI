import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * POST /api/scraper/sync
 * Records a manual sync request and triggers GitHub Actions.
 * 
 * Body: { site?: string }
 *   - If `site` is provided (e.g. "worldconnection"), triggers only that site's workflow.
 *   - If omitted, triggers the full scraper cron (all sites).
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();

    let site: string | null = null;
    try {
      const body = await req.json();
      site = body.site || null;
    } catch {
      // No body = sync all
    }

    // Record the sync request
    const { error: insertError } = await supabase.from("scraper_runs").insert({
      site: site || "manual_trigger",
      status: "pending",
      started_at: new Date().toISOString(),
      urls_scraped: 0,
      urls_found: 0,
      urls_failed: 0,
      images_saved: 0,
    });

    if (insertError) {
      console.error("[sync] Insert error:", insertError.message);
    }

    // Choose which workflow to trigger
    const WORKFLOWS: Record<string, string> = {
      worldconnection: "worldconnection-sync.yml",
    };
    const workflowFile = site ? (WORKFLOWS[site] || "scraper-cron.yml") : "scraper-cron.yml";

    // Try to trigger GitHub Actions
    const token = process.env.GH_PAT || process.env.GITHUB_PAT;
    if (token) {
      try {
        const res = await fetch(
          `https://api.github.com/repos/guidewan888-dev/jongtour-AI/actions/workflows/${workflowFile}/dispatches`,
          {
            method: "POST",
            headers: {
              Authorization: `token ${token}`,
              Accept: "application/vnd.github.v3+json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ref: "main" }),
          }
        );
        if (res.status === 204) {
          return NextResponse.json({
            ok: true,
            message: site
              ? `Sync triggered for ${site}! (workflow: ${workflowFile})`
              : "Full scraper workflow triggered!",
          });
        }
      } catch (e) {
        console.error("[sync] GitHub dispatch failed:", e);
      }
    }

    // Fallback
    return NextResponse.json({
      ok: true,
      message: site
        ? `Sync request recorded for ${site}. Will run on next cron cycle or add GITHUB_PAT to trigger immediately.`
        : "Sync request recorded. Scraper will run on next cron cycle (daily 12:15 TH).",
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/scraper/sync
 * Returns the latest sync status
 */
export async function GET() {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("scraper_runs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(10);

    return NextResponse.json({ ok: true, runs: data || [] });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
