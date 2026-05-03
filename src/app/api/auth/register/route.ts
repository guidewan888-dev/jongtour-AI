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

    // 2. Create Agent & User in Prisma
    const { PrismaClient } = await import('@prisma/client');
    const db = new PrismaClient();

    await db.$transaction(async (tx) => {
      // Find or Create Role
      let role = await tx.role.findUnique({ where: { name: 'AGENT_ADMIN' } });
      if (!role) {
        role = await tx.role.create({ data: { name: 'AGENT_ADMIN', description: 'Agent Administrator' } });
      }

      // Create Agent
      const agent = await tx.agent.create({
        data: {
          companyName: companyName,
          contactName: name,
          email: email,
          phone: phone,
          status: 'ACTIVE',
        }
      });

      // Create User
      await tx.user.create({
        data: {
          id: authData.user!.id, // Link Supabase UUID
          email: email,
          passwordHash: '', // Handled by Supabase
          roleId: role.id,
          agentId: agent.id,
          status: 'ACTIVE',
        }
      });
    });

    return NextResponse.json({ success: true, message: 'ลงทะเบียนสำเร็จ กรุณาเข้าสู่ระบบ' });

  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ success: false, message: error.message || 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' }, { status: 500 });
  }
}
