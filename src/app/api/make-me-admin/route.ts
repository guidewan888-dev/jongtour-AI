import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    // 1. Get logged in user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ error: "กรุณาล็อกอินก่อนครับ!" }, { status: 401 });
    }

    // 2. Update their role to ADMIN in Supabase
    // Note: This API shouldn't really be open in a real production app without a secret key!
    const { data: updatedUser, error: updateError } = await supabase
      .from('User')
      .upsert({
        email: user.email,
        role: "ADMIN",
        password: "OAUTH_USER", // Dummy password since auth is handled by Supabase
      }, { onConflict: 'email' })
      .select();

    // 3. Redirect them to the Admin dashboard
    return NextResponse.redirect(new URL("/admin/bookings", request.url));

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
