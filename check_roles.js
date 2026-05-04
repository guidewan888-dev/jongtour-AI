const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({ include: { role: true } });
  console.log(JSON.stringify(users.map(u => ({ email: u.email, role: u.role?.name })), null, 2));
}
check().catch(console.error).finally(() => prisma.$disconnect());
