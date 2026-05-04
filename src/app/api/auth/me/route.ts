import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    // Fetch user role
    const { data: dbUser } = await supabase
      .from("users")
      .select("*, role:roles(*)")
      .eq("email", user.email || "")
      .single();

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        role: dbUser?.role?.name || "CUSTOMER",
        metadata: user.user_metadata,
        dbProfile: dbUser
      }
    });
  } catch (error: any) {
    console.error("API Auth Me Error:", error);
    return NextResponse.json({ authenticated: false, error: error.message }, { status: 500 });
  }
}
