import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const s = await prisma.supplier.findFirst();
  console.log(s);
}
check();
