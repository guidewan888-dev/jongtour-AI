import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'guidewan888@gmail.com' },
    include: { role: true }
  });
  console.log(user);
}

main().catch(console.error).finally(() => prisma.$disconnect());
