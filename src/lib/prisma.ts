import { PrismaClient } from '@prisma/client'

// บังคับใช้ Connection Pooler เสมอ เพื่อแก้ปัญหา Vercel แย่งกัน Connect จน Database เต็ม
const poolerUrl = process.env.DATABASE_URL?.includes('6543') 
  ? process.env.DATABASE_URL 
  : "postgresql://postgres:zX70oOfCtmYFTimy@db.qterfftaebnoawnzkfgu.supabase.co:6543/postgres?pgbouncer=true";

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: poolerUrl
      }
    }
  })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
