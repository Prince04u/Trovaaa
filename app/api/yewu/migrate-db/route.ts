import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Create K3ResultOverride table
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

    // 2. Create FiveDResultOverride table
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

    // 3. Create ResultOverride table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ResultOverride" (
          "id" TEXT NOT NULL,
          "mode" "WingoMode" NOT NULL,
          "roundNumber" BIGINT NOT NULL,
          "number" INTEGER NOT NULL,
          "createdById" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "ResultOverride_pkey" PRIMARY KEY ("id")
      );
    `);

    // Create Indexes
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "K3ResultOverride_mode_roundNumber_idx" ON "K3ResultOverride"("mode", "roundNumber");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "FiveDResultOverride_mode_roundNumber_idx" ON "FiveDResultOverride"("mode", "roundNumber");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ResultOverride_mode_roundNumber_idx" ON "ResultOverride"("mode", "roundNumber");`);

    return NextResponse.json({ success: true, message: "Missing tables successfully created!" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
