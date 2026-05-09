import { NextResponse } from "next/server";

/**
 * POST /api/scraper/sync
 * Triggers the Tour Scraper workflow on GitHub Actions via workflow_dispatch.
 * This allows admin to manually trigger a sync from the dashboard.
 */
export async function POST() {
  try {
    const token = process.env.GITHUB_PAT;
    if (!token) {
      return NextResponse.json(
        { ok: false, error: "GITHUB_PAT not configured" },
        { status: 500 }
      );
    }

    const owner = "guidewan888-dev";
    const repo = "jongtour-AI";
    const workflow = "scraper-cron.yml";

    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow}/dispatches`,
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
        message: "Scraper workflow dispatched! Check GitHub Actions for progress.",
      });
    }

    const text = await res.text();
    return NextResponse.json(
      { ok: false, error: `GitHub API returned ${res.status}: ${text}` },
      { status: res.status }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e.message },
      { status: 500 }
    );
  }
}
