import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const tours = await prisma.tour.findMany({
    select: { id: true, tourName: true, supplierId: true, status: true }
  });
  
  const mockSuppliers = tours.filter(t => !t.supplierId.startsWith('SUP_'));
  const allSupplierIds = [...new Set(tours.map(t => t.supplierId))];
  
  console.log(`Total tours: ${tours.length}`);
  console.log(`Unique Supplier IDs:`, allSupplierIds);
  console.log(`Mock/Non-standard Supplier Tours: ${mockSuppliers.length}`);
  if (mockSuppliers.length > 0) {
    console.log(mockSuppliers.slice(0, 5));
  }
}
check();
