const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.findUnique({ where: { subdomain: 'ktc' } });
  
  if (company) {
    await prisma.user.updateMany({
      where: { email: { in: ['admin@jongtour.com', 'guidewan888@gmail.com'] } },
      data: { companyId: company.id }
    });
    console.log("Attached KTC company to both admin accounts.");
  }
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
