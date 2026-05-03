import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");

  if (secret === "supersecret99") {
    const cookieStore = await cookies();
    cookieStore.set("admin_bypass", "supersecret99", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jongtour.com";
    return NextResponse.redirect(`${siteUrl}/admin`);
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
