import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const res = await prisma.$queryRaw`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'tour_embeddings';
  `;
  console.log("columns:", res);
}
run();
