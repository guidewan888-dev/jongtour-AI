import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Setting up pgvector...");
  
  try {
    // 1. Create vector extension
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector;`);
    console.log("✅ Extension 'vector' created or already exists.");

    // 2. Add embedding column to Tour table
    await prisma.$executeRawUnsafe(`ALTER TABLE "Tour" ADD COLUMN IF NOT EXISTS "embedding" vector(1536);`);
    console.log("✅ Column 'embedding' added to Tour table.");

    // 3. Create the match_tours RPC function
    const createRpcQuery = `
      CREATE OR REPLACE FUNCTION match_tours (
        query_embedding vector(1536),
        match_threshold float,
        match_count int
      )
      RETURNS TABLE (
        id text,
        similarity float
      )
      LANGUAGE sql
      AS $$
        SELECT
          "Tour".id,
          1 - ("Tour".embedding <=> query_embedding) AS similarity
        FROM "Tour"
        WHERE "Tour".embedding IS NOT NULL 
          AND 1 - ("Tour".embedding <=> query_embedding) > match_threshold
        ORDER BY "Tour".embedding <=> query_embedding
        LIMIT match_count;
      $$;
    `;
    await prisma.$executeRawUnsafe(createRpcQuery);
    console.log("✅ RPC function 'match_tours' created.");

  } catch (error) {
    console.error("❌ Error setting up pgvector:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
