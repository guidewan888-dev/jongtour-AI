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

  // ─── 7. Affiliates ────────────────────────────────────
  console.log("Seeding affiliates...");

  await prisma.affiliateClick.deleteMany({});
  await prisma.commissionLedger.deleteMany({});
  await prisma.affiliatePayout.deleteMany({});
  await prisma.commissionRule.deleteMany({});
  await prisma.affiliate.deleteMany({});

  const affiliates = await Promise.all([
    prisma.affiliate.create({ data: {
      displayName: "TravelWithNook", email: "nook@influencer.com", phone: "0891234567",
      type: "INFLUENCER", tier: "GOLD", status: "ACTIVE",
      referralCode: "NOOK25", couponCode: "NOOKTOUR",
      socialHandle: "@travelwithnook", websiteUrl: "https://youtube.com/@travelwithnook",
      bankName: "KBank", bankAccount: "123-4-56789-0", bankAccountName: "นุ๊ก ท่องเที่ยว",
      kycStatus: "VERIFIED", totalRevenue: 450000, totalCommission: 67500, totalPaid: 45000,
      cookieDays: 45,
    }}),
    prisma.affiliate.create({ data: {
      displayName: "Asia Explorer Co.", email: "partner@asiaexplorer.com", phone: "0212345678",
      type: "AGENT_B2B", tier: "PLATINUM", status: "ACTIVE",
      referralCode: "ASIAEXP", 
      bankName: "SCB", bankAccount: "456-7-89012-3", bankAccountName: "บจก. เอเชีย เอ็กซ์พลอเรอร์",
      taxId: "0105563012345", kycStatus: "VERIFIED",
      totalRevenue: 2500000, totalCommission: 250000, totalPaid: 200000,
      cookieDays: 60,
    }}),
    prisma.affiliate.create({ data: {
      displayName: "สมศักดิ์ พนักงาน", email: "somsak@jongtour.com",
      type: "PRO_STAFF", tier: "SILVER", status: "ACTIVE",
      referralCode: "STAFF001",
      bankName: "BBL", bankAccount: "789-0-12345-6", bankAccountName: "สมศักดิ์ จงทัวร์",
      kycStatus: "VERIFIED", totalRevenue: 180000, totalCommission: 5400, totalPaid: 3600,
    }}),
    prisma.affiliate.create({ data: {
      displayName: "ลิงค์มาสเตอร์", email: "linkmaster@gmail.com",
      type: "AFFILIATE_LINK", tier: "BRONZE", status: "ACTIVE",
      referralCode: "LM2569",
      kycStatus: "PENDING", totalRevenue: 45000, totalCommission: 4500, totalPaid: 0,
    }}),
    prisma.affiliate.create({ data: {
      displayName: "JapanDeals Sub-Agent", email: "japan@subagent.com",
      type: "SUB_AGENT", tier: "SILVER", status: "ACTIVE",
      referralCode: "JPDEALS",
      bankName: "KBank", bankAccount: "111-2-33333-4", bankAccountName: "Japan Deals",
      kycStatus: "VERIFIED", totalRevenue: 320000, totalCommission: 6400, totalPaid: 4800,
    }}),
  ]);

  // ─── 8. Commission Rules ─────────────────────────────
  console.log("Seeding commission rules...");

  await Promise.all([
    prisma.commissionRule.create({ data: { name: "Global Tour Default", priority: 6, productType: "TOUR", rateType: "PERCENTAGE", rateValue: 8 } }),
    prisma.commissionRule.create({ data: { name: "Global Visa Default", priority: 6, productType: "VISA", rateType: "FLAT", rateValue: 500 } }),
    prisma.commissionRule.create({ data: { name: "Influencer Bonus", priority: 2, affiliateType: "INFLUENCER", rateType: "PERCENTAGE", rateValue: 20 } }),
    prisma.commissionRule.create({ data: { name: "B2B Agent Rate", priority: 2, affiliateType: "AGENT_B2B", rateType: "PERCENTAGE", rateValue: 12 } }),
    prisma.commissionRule.create({ data: { name: "Pro-Staff Rate", priority: 2, affiliateType: "PRO_STAFF", rateType: "PERCENTAGE", rateValue: 3 } }),
    prisma.commissionRule.create({ data: { name: "Nook Special Override", priority: 1, affiliateId: affiliates[0].id, rateType: "PERCENTAGE", rateValue: 22, validFrom: new Date("2026-01-01"), validUntil: new Date("2026-12-31") } }),
  ]);

  // ─── 9. Commission Ledger Entries ────────────────────
  console.log("Seeding commission ledger...");

  await Promise.all([
    prisma.commissionLedger.create({ data: {
      affiliateId: affiliates[0].id, bookingRef: "BKG-NOOK-001", productType: "TOUR",
      bookingValue: 35900, commissionRate: 22, commissionAmount: 7898, whtAmount: 236.94, netAmount: 7661.06, status: "CONFIRMED",
    }}),
    prisma.commissionLedger.create({ data: {
      affiliateId: affiliates[0].id, bookingRef: "BKG-NOOK-002", productType: "TOUR",
      bookingValue: 45900, commissionRate: 22, commissionAmount: 10098, whtAmount: 302.94, netAmount: 9795.06, status: "PENDING",
    }}),
    prisma.commissionLedger.create({ data: {
      affiliateId: affiliates[1].id, bookingRef: "BKG-ASIA-001", productType: "TOUR",
      bookingValue: 129000, commissionRate: 12, commissionAmount: 15480, whtAmount: 464.40, netAmount: 15015.60, status: "PAID",
    }}),
  ]);

  // ─── 10. Affiliate Clicks ───────────────────────────
  console.log("Seeding affiliate clicks...");

  for (let i = 0; i < 25; i++) {
    const aff = affiliates[i % affiliates.length];
    const daysAgo = Math.floor(Math.random() * 30);
    const dt = new Date(); dt.setDate(dt.getDate() - daysAgo);
    await prisma.affiliateClick.create({ data: {
      affiliateId: aff.id, referralCode: aff.referralCode,
      couponCode: aff.couponCode, sourceUrl: `https://social.com/post/${i}`,
      landingUrl: `https://jongtour.com/tour/jp${i}?ref=${aff.referralCode}`,
      converted: Math.random() > 0.7, createdAt: dt,
    }});
  }

  // ─── 11. Talents ─────────────────────────────────────
  console.log("Seeding talents...");

  await prisma.talentPricingOverride.deleteMany({});
  await prisma.talentFavorite.deleteMany({});
  await prisma.talentReview.deleteMany({});
  await prisma.talentScheduleBlock.deleteMany({});
  await prisma.talentRequest.deleteMany({});
  await prisma.talent.deleteMany({});

  const talents = await Promise.all([
    prisma.talent.create({ data: {
      displayName: "พี่ก้อย", realName: "สุชาดา วงศ์สว่าง",
      email: "koy@jongtour.com", phone: "0891111111", lineId: "@koy_guide",
      tier: "ELITE", status: "ACTIVE", region: "Japan, Korea",
      languages: ["TH", "JP", "EN"], specialties: ["Japan Culture", "Food Tour", "Family"],
      bio: "ไกด์มืออาชีพ 15 ปี ชำนาญเส้นทางญี่ปุ่นทุกฤดู จัดกรุ๊ปส่วนตัวให้สนุกทุกวัย",
      experience: "15 years", licenseNo: "TG-2554-001",
      rating: 4.9, reviewCount: 128, totalTrips: 340, totalEarnings: 1250000,
    }}),
    prisma.talent.create({ data: {
      displayName: "พี่โอ๊ต", realName: "พัฒนา ทัพไทย",
      email: "oat@jongtour.com", phone: "0892222222",
      tier: "PREMIUM", status: "ACTIVE", region: "Europe, Turkey",
      languages: ["TH", "EN", "FR"], specialties: ["Europe", "Adventure", "Photography"],
      bio: "สายยุโรปโดยเฉพาะ เน้นประสบการณ์ไม่เหมือนใคร ถ่ายรูปสวยทุกมุม",
      experience: "10 years", licenseNo: "TG-2558-015",
      rating: 4.8, reviewCount: 95, totalTrips: 210, totalEarnings: 890000,
    }}),
    prisma.talent.create({ data: {
      displayName: "พี่มิ้นท์", realName: "มณฑิรา ศิริวัฒน์",
      email: "mint@jongtour.com", phone: "0893333333",
      tier: "SENIOR", status: "ACTIVE", region: "China, Taiwan, Hong Kong",
      languages: ["TH", "ZH", "EN"], specialties: ["China", "Shopping", "Luxury"],
      bio: "เชี่ยวชาญจีน-ไต้หวัน พูดจีนกลางได้คล่อง บริการระดับ premium",
      experience: "8 years", licenseNo: "TG-2560-022",
      rating: 4.7, reviewCount: 67, totalTrips: 145, totalEarnings: 560000,
    }}),
    prisma.talent.create({ data: {
      displayName: "น้องแบงค์", realName: "ธนกร แสงทอง",
      email: "bank@jongtour.com", phone: "0894444444",
      tier: "STANDARD", status: "ACTIVE", region: "Vietnam, Cambodia, Laos",
      languages: ["TH", "EN", "VI"], specialties: ["Indochina", "Budget", "Backpacker"],
      bio: "ไกด์รุ่นใหม่ไฟแรง สายอินโดจีน เน้นทริปสนุกราคาเบา",
      experience: "3 years", licenseNo: "TG-2566-040",
      rating: 4.5, reviewCount: 23, totalTrips: 48, totalEarnings: 180000,
    }}),
  ]);

  // ─── 12. Talent Schedule Blocks ──────────────────────
  console.log("Seeding talent schedules...");

  const nextWeek = new Date(); nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekEnd = new Date(nextWeek); nextWeekEnd.setDate(nextWeekEnd.getDate() + 5);
  const nextMonth = new Date(); nextMonth.setMonth(nextMonth.getMonth() + 1);
  const nextMonthEnd = new Date(nextMonth); nextMonthEnd.setDate(nextMonthEnd.getDate() + 7);

  await Promise.all([
    prisma.talentScheduleBlock.create({ data: { talentId: talents[0].id, startDate: nextWeek, endDate: nextWeekEnd, reason: "BOOKED", requestRef: "TR-DEMO001" } }),
    prisma.talentScheduleBlock.create({ data: { talentId: talents[1].id, startDate: nextMonth, endDate: nextMonthEnd, reason: "BOOKED", requestRef: "TR-DEMO002" } }),
    prisma.talentScheduleBlock.create({ data: { talentId: talents[2].id, startDate: nextWeek, endDate: new Date(nextWeek.getTime() + 3 * 86400000), reason: "PERSONAL" } }),
  ]);

  // ─── 13. Talent Requests ─────────────────────────────
  console.log("Seeding talent requests...");

  await Promise.all([
    prisma.talentRequest.create({ data: {
      requestRef: "TR-DEMO001", talentId: talents[0].id, customerId: cust1.id,
      bookingType: "TOUR", travelDate: nextWeek, daysCount: 5, paxCount: 4,
      language: "TH", message: "อยากได้พี่ก้อยนำเที่ยวญี่ปุ่นครับ ครอบครัว 4 คน",
      status: "CONFIRMED", assignedTalentId: talents[0].id,
      premiumAmount: 3000, confirmedAt: new Date(),
    }}),
    prisma.talentRequest.create({ data: {
      requestRef: "TR-DEMO002", talentId: talents[1].id, customerId: cust2.id,
      bookingType: "PRIVATE_GROUP", travelDate: nextMonth, daysCount: 7, paxCount: 8,
      language: "TH", message: "Private group ยุโรป 8 คน อยากได้ไกด์ถ่ายรูปเก่ง",
      status: "PENDING_REVIEW",
      premiumAmount: 5000,
    }}),
    prisma.talentRequest.create({ data: {
      requestRef: "TR-DEMO003", talentId: talents[0].id,
      bookingType: "TOUR", travelDate: new Date(nextMonth.getTime() + 14 * 86400000),
      daysCount: 5, paxCount: 2, language: "EN",
      message: "Want Koy for Japan trip, English speaking",
      status: "SUBMITTED", backupTalentId: talents[2].id,
    }}),
  ]);

  // ─── 14. Talent Reviews ──────────────────────────────
  console.log("Seeding talent reviews...");

  const reviewTexts = [
    { r: 5, c: "พี่ก้อยดูแลดีมากครับ ครอบครัวประทับใจ อาหารอร่อยทุกมื้อ!" },
    { r: 5, c: "Best guide ever! 知道很多秘密景点" },
    { r: 4, c: "เส้นทางดี ถ่ายรูปสวย แต่เดินเยอะหน่อย" },
    { r: 5, c: "พี่โอ๊ตพาไปที่ที่ทัวร์ทั่วไปไม่ไป สุดยอด" },
    { r: 4, c: "พี่มิ้นท์พูดจีนได้ สะดวกมากตอนช็อปปิ้ง" },
    { r: 5, c: "น้องแบงค์เฮฮา สนุกมาก ราคาคุ้มค่า" },
  ];

  for (let i = 0; i < reviewTexts.length; i++) {
    await prisma.talentReview.create({ data: {
      talentId: talents[i % talents.length].id,
      customerId: i % 2 === 0 ? cust1.id : cust2.id,
      rating: reviewTexts[i].r, comment: reviewTexts[i].c,
      isPublic: true, isModerated: true,
    }});
  }

  // ─── 15. Talent Favorites ────────────────────────────
  await prisma.talentFavorite.create({ data: { talentId: talents[0].id, customerId: cust1.id } });
  await prisma.talentFavorite.create({ data: { talentId: talents[1].id, customerId: cust2.id } });
  await prisma.talentFavorite.create({ data: { talentId: talents[0].id, customerId: cust2.id } });

  // ─── 16. Notifications ──────────────────────────────
  console.log("Seeding notifications...");

  await prisma.notification.deleteMany({});

  await Promise.all([
    prisma.notification.create({ data: { customerId: cust1.id, type: "BOOKING", title: "✅ การจองยืนยันแล้ว", message: "Tokyo Explorer 5D — ยืนยันเรียบร้อย", linkUrl: "/account/bookings" } }),
    prisma.notification.create({ data: { customerId: cust1.id, type: "TALENT", title: "✅ ยืนยันไกด์แล้ว", message: "พี่ก้อย พร้อมดูแลคุณในทริป Tokyo", linkUrl: "/account/talent-requests" } }),
    prisma.notification.create({ data: { customerId: cust1.id, type: "PAYMENT", title: "💳 ชำระเงินสำเร็จ", message: "฿35,900 ผ่าน Bank Transfer", isRead: true } }),
    prisma.notification.create({ data: { customerId: cust2.id, type: "SYSTEM", title: "🔄 เสนอทางเลือกไกด์", message: "ไกด์ที่เลือกไม่ว่าง — ดูทางเลือก", linkUrl: "/talents/request/alternatives" } }),
    prisma.notification.create({ data: { customerId: cust2.id, type: "SYSTEM", title: "🛂 วีซ่าญี่ปุ่น อนุมัติแล้ว", message: "Tourist Visa — Japan ผ่านเรียบร้อย", isRead: true } }),
  ]);

  // ─── 17. Pricing Overrides ───────────────────────────
  await prisma.talentPricingOverride.create({ data: {
    talentId: talents[0].id, requestRef: "TR-DEMO001",
    premiumAmount: 3000, surcharge: 0, discount: 0,
    reason: "Elite tier premium for 5-day Japan trip",
  }});

  console.log("✅ Seeding finished — all 17 sections complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
