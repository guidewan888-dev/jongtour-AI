import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Assuming this exists, I'll need to check
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { email, password, name, companyName, phone } = await req.json();

    if (!email || !password || !name || !companyName) {
      return NextResponse.json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    });

    if (authError) {
      return NextResponse.json({ success: false, message: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาดในการสร้างบัญชี' }, { status: 500 });
    }

    // 2. Create Company & User in Prisma
    // Start transaction since we are creating both
    const { PrismaClient } = await import('@prisma/client');
    const db = new PrismaClient();

    await db.$transaction(async (tx) => {
      // Create Company (AGENT)
      const company = await tx.company.create({
        data: {
          name: companyName,
          type: 'AGENT',
        }
      });

      // Create User
      await tx.user.create({
        data: {
          id: authData.user!.id, // Link Supabase UUID
          email: email,
          password: '', // Handled by Supabase
          name: name,
          phone: phone,
          role: 'AGENT',
          companyId: company.id,
        }
      });
    });

    return NextResponse.json({ success: true, message: 'ลงทะเบียนสำเร็จ กรุณาเข้าสู่ระบบ' });

  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ success: false, message: error.message || 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' }, { status: 500 });
  }
}
