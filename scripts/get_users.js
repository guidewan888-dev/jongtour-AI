const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
async function main() { 
  const users = await prisma.user.findMany({ 
    where: { OR: [{role: 'AGENT'}, {role: 'SUPPLIER'}, {role: 'ADMIN'}] }, 
    include: { company: true } 
  }); 
  console.log(users.map(u => ({ email: u.email, role: u.role, company: u.company?.name, subdomain: u.company?.subdomain }))); 
} 
main().finally(() => prisma.$disconnect());
