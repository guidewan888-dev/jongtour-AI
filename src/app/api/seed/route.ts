import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // 0. Clean up existing data
    await prisma.payment.deleteMany({});
    await prisma.traveler.deleteMany({});
    await prisma.booking.deleteMany({});
    await prisma.tourDeparture.deleteMany({});
    await prisma.tour.deleteMany({});

    // 1. สร้างลูกค้า (User)
    const user1 = await prisma.user.upsert({
      where: { email: "customer1@example.com" },
      update: {},
      create: {
        email: "customer1@example.com",
        password: "hashed_password",
        name: "คุณสมชาย ใจดี",
        phone: "0812345678",
        role: "CUSTOMER",
      },
    });

    const user2 = await prisma.user.upsert({
      where: { email: "customer2@example.com" },
      update: {},
      create: {
        email: "customer2@example.com",
        password: "hashed_password",
        name: "คุณวิภาวรรณ สมบูรณ์",
        phone: "0898765432",
        role: "CUSTOMER",
      },
    });

    await prisma.user.upsert({
      where: { email: "admin@jongtour.com" },
      update: {},
      create: {
        email: "admin@jongtour.com",
        password: "hashed_password",
        name: "Super Admin",
        role: "ADMIN",
      },
    });

    // 2. สร้างแพ็กเกจทัวร์ (Tours)
    const tours = [
      {
        title: "ทัวร์ญี่ปุ่น โตเกียว ฟูจิ โอซาก้า (พิเศษ บุฟเฟต์ขาปูยักษ์)",
        destination: "Japan",
        durationDays: 5,
        price: 35900,
        imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
        description: "สัมผัสประสบการณ์เที่ยวญี่ปุ่นแบบจัดเต็ม ช้อปปิ้งชินจูกุ",
        source: "API_ZEGO"
      },
      {
        title: "ทัวร์เกาหลีใต้ โซล เกาะนามิ สวนสนุกเอเวอร์แลนด์",
        destination: "South Korea",
        durationDays: 4,
        price: 18900,
        imageUrl: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&q=80",
        description: "เที่ยวเกาหลีสุดชิค ถ่ายรูปเกาะนามิ เล่นสวนสนุก",
        source: "API_ZEGO"
      },
      {
        title: "ทัวร์ยุโรปตะวันออก ออสเตรีย เช็ก ฮังการี",
        destination: "Europe",
        durationDays: 8,
        price: 55900,
        imageUrl: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80",
        description: "สัมผัสความโรแมนติกแห่งยุโรปตะวันออก",
        source: "API_GO365"
      },
      {
        title: "ทัวร์ไต้หวัน ไทเป ทะเลสาบสุริยันจันทรา",
        destination: "Taiwan",
        durationDays: 4,
        price: 15900,
        imageUrl: "https://images.unsplash.com/photo-1558235284-48f57f4fb0a4?w=800&q=80",
        description: "เที่ยวไต้หวันสุดคุ้ม ชิมชานมไข่มุกต้นตำรับ",
        source: "MANUAL"
      }
    ];

    const createdTours = [];

    for (const t of tours) {
      const tour = await prisma.tour.create({
        data: {
          title: t.title,
          destination: t.destination,
          durationDays: t.durationDays,
          price: t.price,
          imageUrl: t.imageUrl,
          description: t.description,
          source: t.source as any,
        }
      });

      const today = new Date();
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const departure = await prisma.tourDeparture.create({
        data: {
          tourId: tour.id,
          startDate: nextMonth,
          endDate: new Date(nextMonth.getTime() + (t.durationDays * 24 * 60 * 60 * 1000)),
          price: t.price,
          totalSeats: 30,
          availableSeats: 15,
        }
      });

      createdTours.push({ tour, departure });
    }

    // 3. สร้าง Bookings
    const statuses = ["PENDING", "AWAITING_CONFIRMATION", "DEPOSIT_PAID", "FULL_PAID", "CANCELLED"];
    
    for (let i = 0; i < 5; i++) {
      const td = createdTours[i % createdTours.length];
      const user = i % 2 === 0 ? user1 : user2;
      const travelerCount = (i % 3) + 1;
      const totalPrice = td.tour.price * travelerCount;
      
      const createdAt = new Date();
      createdAt.setHours(createdAt.getHours() - (i * 12));

      await prisma.booking.create({
        data: {
          userId: user.id,
          departureId: td.departure.id,
          status: statuses[i] as any,
          totalPrice: totalPrice,
          createdAt: createdAt,
          travelers: {
            create: Array.from({ length: travelerCount }).map((_, idx) => ({
              name: `${user.name} ผู้ติดตาม ${idx + 1}`
            }))
          },
          payments: {
            create: statuses[i] !== "PENDING" && statuses[i] !== "CANCELLED" ? [
              { amount: totalPrice, status: statuses[i] === "AWAITING_CONFIRMATION" ? "PENDING" : "APPROVED", type: "FULL" }
            ] : []
          }
        }
      });
    }

    return NextResponse.json({ message: "Seeding finished successfully!" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
