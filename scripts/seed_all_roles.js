const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const allRoles = [
    'SUPER_ADMIN', 'ADMIN', 'OPERATION', 'FINANCE', 
    'CONTENT_MANAGER', 'SALE_MANAGER', 'SALE_STAFF', 
    'SUPPLIER_MANAGER', 'API_MANAGER', 'AGENT_OWNER', 
    'AGENT_STAFF', 'CUSTOMER_SUPPORT', 'CUSTOMER'
  ];

  console.log("Seeding Enterprise Roles with Prisma...");
  
  for (const roleName of allRoles) {
    const existingRole = await prisma.role.findUnique({ where: { name: roleName } });
    
    if (!existingRole) {
      console.log(`Creating role: ${roleName}`);
      await prisma.role.create({ data: { name: roleName } });
    } else {
      console.log(`Role exists: ${roleName}`);
    }
  }

  // Update master admin to SUPER_ADMIN
  const email = 'admin@jongtour.com';
  const superAdminRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
  
  if (superAdminRole) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { roleId: superAdminRole.id }
      });
      console.log(`Updated ${email} to SUPER_ADMIN`);
    }
  }

  console.log("Done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
