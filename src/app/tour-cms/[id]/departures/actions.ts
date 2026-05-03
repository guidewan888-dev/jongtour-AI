"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createDeparture(tourId: string, formData: FormData) {
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;
  const price = parseFloat(formData.get("price") as string);
  const totalSeats = parseInt(formData.get("totalSeats") as string);

  // Optional fields
  const netPriceStr = formData.get("netPrice") as string;
  const netPrice = netPriceStr ? parseFloat(netPriceStr) : null;
  
  const childPriceStr = formData.get("childPrice") as string;
  const childPrice = childPriceStr ? parseFloat(childPriceStr) : null;
  
  const singleRoomPriceStr = formData.get("singleRoomPrice") as string;
  const singleRoomPrice = singleRoomPriceStr ? parseFloat(singleRoomPriceStr) : null;
  
  const depositPriceStr = formData.get("depositPrice") as string;
  const depositPrice = depositPriceStr ? parseFloat(depositPriceStr) : null;

  if (!startDateStr || !endDateStr || isNaN(price) || isNaN(totalSeats)) {
    throw new Error("Missing required fields");
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  const tour = await prisma.tour.findUnique({
    where: { id: tourId },
    select: { supplierId: true }
  });

  if (!tour) {
    throw new Error("Tour not found");
  }

  const departure = await prisma.departure.create({
    data: {
      tourId,
      supplierId: tour.supplierId,
      startDate,
      endDate,
      totalSeats,
      remainingSeats: totalSeats,
      prices: {
        create: [
          {
            paxType: "ADULT",
            sellingPrice: price,
            netPrice: netPrice,
          },
          ...(childPrice ? [{
            paxType: "CHILD",
            sellingPrice: childPrice,
            netPrice: null,
          }] : []),
          ...(singleRoomPrice ? [{
            paxType: "SINGLE_SUPP",
            sellingPrice: singleRoomPrice,
            netPrice: null,
          }] : []),
        ]
      }
    }
  });

  revalidatePath(`/tour-cms/${tourId}/departures`);
  revalidatePath(`/tour-cms/${tourId}`);
}

export async function deleteDeparture(departureId: string, tourId: string) {
  // First check if there are any bookings for this departure
  const bookingCount = await prisma.booking.count({
    where: { departureId }
  });

  if (bookingCount > 0) {
    throw new Error("Cannot delete departure because it already has bookings.");
  }

  await prisma.departure.delete({
    where: { id: departureId }
  });

  revalidatePath(`/tour-cms/${tourId}/departures`);
  revalidatePath(`/tour-cms/${tourId}`);
}
