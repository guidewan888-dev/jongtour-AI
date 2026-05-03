import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // 0. Clean up existing data (Optional, useful for clean seeding)
  await prisma.payment.deleteMany({});
  await prisma.bookingTraveler.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.price.deleteMany({});
  await prisma.departure.deleteMany({});
  await prisma.tour.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.agent.deleteMany({});
  await prisma.role.deleteMany({});

  // 1. Roles
  const adminRole = await prisma.role.create({ data: { name: "ADMIN", description: "Super Admin" } });
  const customerRole = await prisma.role.create({ data: { name: "CUSTOMER", description: "Customer User" } });

  // 2. Customers
  const cust1 = await prisma.customer.create({
    data: {
      firstName: "Somchai",
      lastName: "Jaidee",
      email: "customer1@example.com",
      phone: "0812345678"
    }
  });
  
  const cust2 = await prisma.customer.create({
    data: {
      firstName: "Wipawan",
      lastName: "Somboon",
      email: "customer2@example.com",
      phone: "0898765432"
    }
  });

  // 3. Users
  const user1 = await prisma.user.create({
    data: {
      email: "customer1@example.com",
      passwordHash: "hashed_password",
      roleId: customerRole.id,
      customer: { connect: { id: cust1.id } }
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "customer2@example.com",
      passwordHash: "hashed_password",
      roleId: customerRole.id,
      customer: { connect: { id: cust2.id } }
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@jongtour.com",
      passwordHash: "hashed_password",
      roleId: adminRole.id,
    },
  });

  // 4. Supplier
  const supplier1 = await prisma.supplier.create({
    data: {
      canonicalName: "zego",
      displayName: "Zego API",
      bookingMethod: "API_ZEGO"
    }
  });

  // 5. Tours
  const tours = [
    {
      tourCode: "JP001",
      tourName: "ทัวร์ญี่ปุ่น โตเกียว ฟูจิ โอซาก้า (พิเศษ บุฟเฟต์ขาปูยักษ์)",
      slug: "tour-jp001",
      durationDays: 5,
      durationNights: 4,
      externalTourId: "EXT-JP001"
    },
    {
      tourCode: "KR001",
      tourName: "ทัวร์เกาหลีใต้ โซล เกาะนามิ สวนสนุกเอเวอร์แลนด์",
      slug: "tour-kr001",
      durationDays: 4,
      durationNights: 3,
      externalTourId: "EXT-KR001"
    }
  ];

  const createdTours = [];

  for (const t of tours) {
    const tour = await prisma.tour.create({
      data: {
        tourCode: t.tourCode,
        tourName: t.tourName,
        slug: t.slug,
        durationDays: t.durationDays,
        durationNights: t.durationNights,
        externalTourId: t.externalTourId,
        supplierId: supplier1.id,
        status: "PUBLISHED",
        images: {
          create: [{ imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80", isCover: true }]
        }
      }
    });

    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const departure = await prisma.departure.create({
      data: {
        tourId: tour.id,
        supplierId: supplier1.id,
        startDate: nextMonth,
        endDate: new Date(nextMonth.getTime() + (t.durationDays * 24 * 60 * 60 * 1000)),
        totalSeats: 30,
        remainingSeats: 15,
        prices: {
          create: [{
            paxType: "ADULT",
            sellingPrice: 35900,
            currency: "THB"
          }]
        }
      }
    });

    createdTours.push({ tour, departure });
  }

  // 6. Bookings
  const statuses = ["PENDING", "CONFIRMED", "CANCELLED"];
  
  for (let i = 0; i < 3; i++) {
    const td = createdTours[i % createdTours.length];
    const customer = i % 2 === 0 ? cust1 : cust2;
    const travelerCount = (i % 3) + 1;
    const totalPrice = 35900 * travelerCount;
    
    const createdAt = new Date();
    createdAt.setHours(createdAt.getHours() - (i * 12));

    await prisma.booking.create({
      data: {
        bookingRef: `BKG-${Date.now()}-${i}`,
        supplierId: supplier1.id,
        tourId: td.tour.id,
        departureId: td.departure.id,
        customerId: customer.id,
        status: statuses[i],
        totalPrice: totalPrice,
        createdAt: createdAt,
        travelers: {
          create: Array.from({ length: travelerCount }).map((_, idx) => ({
            firstName: customer.firstName,
            lastName: `Follower ${idx + 1}`
          }))
        },
        payments: {
          create: statuses[i] !== "PENDING" && statuses[i] !== "CANCELLED" ? [
            { paymentRef: `PAY-${Date.now()}-${i}`, amount: totalPrice, paymentMethod: "BANK_TRANSFER", status: "COMPLETED" }
          ] : []
        }
      }
    });
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
