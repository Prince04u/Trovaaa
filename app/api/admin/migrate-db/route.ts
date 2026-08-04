import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // We execute the missing migrations manually using raw SQL because Vercel 
    // prevents database migrations during the build phase.
    
    // 1. Create K3ResultOverride table (using BIGINT for roundNumber to prevent overflow)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "K3ResultOverride" (
          "id" TEXT NOT NULL,
          "mode" "K3Mode" NOT NULL,
          "roundNumber" BIGINT NOT NULL,
          "dice1" INTEGER NOT NULL,
          "dice2" INTEGER NOT NULL,
          "dice3" INTEGER NOT NULL,
          "createdById" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "K3ResultOverride_pkey" PRIMARY KEY ("id")
      );
    `);

    // 2. Create FiveDResultOverride table (using BIGINT for roundNumber)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "FiveDResultOverride" (
          "id" TEXT NOT NULL,
          "mode" "FiveDMode" NOT NULL,
          "roundNumber" BIGINT NOT NULL,
          "a" INTEGER NOT NULL,
          "b" INTEGER NOT NULL,
          "c" INTEGER NOT NULL,
          "d" INTEGER NOT NULL,
          "e" INTEGER NOT NULL,
          "createdById" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "FiveDResultOverride_pkey" PRIMARY KEY ("id")
      );
    `);

    // 3. Create Indexes safely
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "K3ResultOverride_mode_roundNumber_idx" ON "K3ResultOverride"("mode", "roundNumber");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "FiveDResultOverride_mode_roundNumber_idx" ON "FiveDResultOverride"("mode", "roundNumber");
    `);

    // 4. Create Foreign Keys safely (Postgres doesn't have IF NOT EXISTS for constraints, so we catch errors)
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "K3ResultOverride" ADD CONSTRAINT "K3ResultOverride_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      `);
    } catch (e: any) {
      if (!e.message.includes("already exists")) {
        console.error(e);
      }
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "FiveDResultOverride" ADD CONSTRAINT "FiveDResultOverride_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      `);
    } catch (e: any) {
      if (!e.message.includes("already exists")) {
        console.error(e);
      }
    }

    return NextResponse.json({ success: true, message: "Database tables K3ResultOverride and FiveDResultOverride created successfully!" });
  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: err.message, 
    });
  }
}
