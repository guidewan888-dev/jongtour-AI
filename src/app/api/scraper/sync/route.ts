import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * POST /api/scraper/sync
 * Records a manual sync request and optionally triggers GitHub Actions.
 */
export async function POST() {
  try {
    const supabase = createClient();

    // Record the sync request in scraper_runs table
    const { error: insertError } = await supabase.from("scraper_runs").insert({
      site_name: "manual_trigger",
      status: "pending",
      started_at: new Date().toISOString(),
      tours_scraped: 0,
    });

    if (insertError) {
      console.error("[sync] Insert error:", insertError.message);
    }

    // Try to trigger GitHub Actions workflow if PAT is available
    const token = process.env.GITHUB_PAT;
    if (token) {
      try {
        const res = await fetch(
          "https://api.github.com/repos/guidewan888-dev/jongtour-AI/actions/workflows/scraper-cron.yml/dispatches",
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
            message: "Scraper workflow triggered on GitHub Actions!",
          });
        }
      } catch (e) {
        console.error("[sync] GitHub dispatch failed:", e);
      }
    }

    // Fallback: return success — the daily cron will pick it up
    return NextResponse.json({
      ok: true,
      message: "Sync request recorded. Scraper will run on next cron cycle (daily 12:15 TH). To trigger immediately, add GITHUB_PAT to env.",
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
      .limit(5);

    return NextResponse.json({ ok: true, runs: data || [] });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
