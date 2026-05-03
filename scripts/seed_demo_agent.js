const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.upsert({
    where: { subdomain: 'demo' },
    update: {
      name: 'Demo Travel Agency',
      type: 'AGENT',
      themeColor: '#3b82f6', // blue
    },
    create: {
      name: 'Demo Travel Agency',
      type: 'AGENT',
      subdomain: 'demo',
      themeColor: '#3b82f6',
    }
  });
  console.log('Demo company created/updated:', company);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
