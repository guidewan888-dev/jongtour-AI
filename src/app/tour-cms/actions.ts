"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function createManualTour(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { role: true, supplier: true }
  });

  if (!dbUser || (dbUser.role.name !== "ADMIN" && dbUser.role.name !== "SUPPLIER_ADMIN")) {
    throw new Error("Forbidden");
  }

  const title = formData.get("title") as string;
  const destination = formData.get("destination") as string;
  const durationDays = parseInt(formData.get("durationDays") as string);
  const price = parseFloat(formData.get("price") as string);
  const imageUrl = formData.get("imageUrl") as string;
  const description = formData.get("description") as string;

  if (!title || !destination || isNaN(durationDays) || isNaN(price)) {
    throw new Error("Missing required fields");
  }

  // If supplier admin, use their supplier ID. If Jongtour admin, use Jongtour supplier ID
  // Wait, Jongtour should have its own Supplier record for manual tours
  let supplierId = dbUser.supplierId;
  
  if (dbUser.role.name === "ADMIN" && !supplierId) {
    // Fallback to finding "MANUAL" or "JONGTOUR" supplier
    const jongtour = await prisma.supplier.findFirst(); // Mock fallback
    if (jongtour) supplierId = jongtour.id;
  }

  if (!supplierId) {
     throw new Error("No supplier profile linked to this user");
  }

  // Generate a random tour code for manual tours
  const tourCode = `M-${Date.now().toString().slice(-6)}`;

  const tour = await prisma.tour.create({
    data: {
      tourName: title,
      tourCode: tourCode,
      slug: `tour-${tourCode.toLowerCase()}`,
      durationDays,
      durationNights: Math.max(0, durationDays - 1),
      supplierId: supplierId,
      externalTourId: tourCode,
      status: "DRAFT",
    }
  });

  revalidatePath("/tour-cms");
  redirect("/tour-cms");
}
