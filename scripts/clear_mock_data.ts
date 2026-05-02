import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning up remaining data...");

  try { await prisma.apiSyncLog.deleteMany({}); console.log("Deleted all sync logs."); } catch (e) { console.log("Failed sync log", e.message); }
  try { await prisma.fitRequest.deleteMany({}); console.log("Deleted all FIT requests."); } catch (e) { console.log("Failed FIT", e.message); }

  console.log("Cleanup complete!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
