import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // 1. สร้างลูกค้า (User)
  const user1 = await prisma.user.upsert({
    where: { email: "customer1@example.com" },
    update: {},
    create: {
      email: "customer1@example.com",
      password: "hashed_password",
      name: "สมชาย ใจดี",
      phone: "0812345678",
      role: "CUSTOMER",
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@jongtour.com" },
    update: {},
    create: {
      email: "admin@jongtour.com",
      password: "hashed_password",
      name: "Super Admin",
      role: "ADMIN",
    },
  });

  // 2. สร้างแพ็กเกจทัวร์ (Tours) แบบ Mock Data
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

    // 3. สร้างรอบวันเดินทาง (TourDeparture) สำหรับแต่ละทัวร์
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

    // สร้าง Booking จำลองให้ทัวร์ญี่ปุ่น
    if (t.destination === "Japan") {
      await prisma.booking.create({
        data: {
          userId: user1.id,
          departureId: departure.id,
          status: "AWAITING_CONFIRMATION",
          totalPrice: t.price * 2,
          travelers: {
            create: [
              { name: "สมชาย ใจดี" },
              { name: "สมหญิง ใจดี" }
            ]
          },
          payments: {
            create: [
              { amount: t.price * 2, status: "PENDING", type: "FULL" }
            ]
          }
        }
      });
    }
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
