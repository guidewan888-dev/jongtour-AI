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
    include: { company: true }
  });

  if (!dbUser || (dbUser.role !== "ADMIN" && dbUser.role !== "SUPPLIER" && dbUser.company?.type !== "SUPPLIER")) {
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

  // If supplier, link to their company ID. If admin, supplierId is null (Jongtour itself)
  const isSupplier = dbUser.role === "SUPPLIER" || dbUser.company?.type === "SUPPLIER";
  const supplierId = isSupplier ? dbUser.company?.id : null;

  const tour = await prisma.tour.create({
    data: {
      title,
      destination,
      durationDays,
      price,
      imageUrl: imageUrl || null,
      description: description || null,
      source: "MANUAL",
      supplierId
    }
  });

  revalidatePath("/tour-cms");
  redirect("/tour-cms");
}
